import { useRef, useCallback, useEffect } from "react";

export interface DetectionResult {
  ballDetected: boolean;
  ballPosition: { x: number; y: number } | null;
  footPositions: { x: number; y: number }[];
  touchDetected: boolean;
}

const TOUCH_COOLDOWN_MS = 500;
const TOUCH_DISTANCE_THRESHOLD = 0.18;
const BALL_PERSISTENCE_MS = 300;

export function useBallTouchDetector(onTouch: () => void, enabled: boolean) {
  const cocoModelRef = useRef<any>(null);
  const poseModelRef = useRef<any>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const loadedRef = useRef(false);
  const nearFootFramesRef = useRef<number>(0);
  const lastKnownBallRef = useRef<{ x: number; y: number; ts: number } | null>(null);

  const loadModels = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const tf = await import("@tensorflow/tfjs");
    await import("@tensorflow/tfjs-backend-webgl");
    await tf.setBackend("webgl");
    await tf.ready();

    const [cocoSsd, poseDetection] = await Promise.all([
      import("@tensorflow-models/coco-ssd"),
      import("@tensorflow-models/pose-detection"),
    ]);

    cocoModelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });
    poseModelRef.current = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
  }, []);

  const detectFrame = useCallback(
    async (video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<DetectionResult> => {
      const result: DetectionResult = {
        ballDetected: false,
        ballPosition: null,
        footPositions: [],
        touchDetected: false,
      };

      if (!cocoModelRef.current || !poseModelRef.current) return result;
      if (video.readyState < 2) return result;

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w === 0 || h === 0) return result;

      const [objects, poses] = await Promise.all([
        cocoModelRef.current.detect(video),
        poseModelRef.current.estimatePoses(video),
      ]);

      const ball = objects.find((o: any) => o.class === "sports ball" && o.score > 0.4);
      const now = Date.now();

      if (ball) {
        const pos = {
          x: (ball.bbox[0] + ball.bbox[2] / 2) / w,
          y: (ball.bbox[1] + ball.bbox[3] / 2) / h,
          ts: now,
        };
        lastKnownBallRef.current = pos;
        result.ballDetected = true;
        result.ballPosition = { x: pos.x, y: pos.y };
      } else if (lastKnownBallRef.current && now - lastKnownBallRef.current.ts < BALL_PERSISTENCE_MS) {
        result.ballDetected = true;
        result.ballPosition = { x: lastKnownBallRef.current.x, y: lastKnownBallRef.current.y };
      }

      if (poses.length > 0) {
        const kps = poses[0].keypoints;
        for (const idx of [15, 16, 17, 18]) {
          const kp = kps[idx];
          if (kp && (kp.score ?? 0) > 0.3) {
            result.footPositions.push({ x: kp.x / w, y: kp.y / h });
          }
        }
      }

      if (result.ballPosition && result.footPositions.length > 0) {
        const isNearFoot = result.footPositions.some((foot) => {
          const dx = foot.x - result.ballPosition!.x;
          const dy = foot.y - result.ballPosition!.y;
          return Math.sqrt(dx * dx + dy * dy) < TOUCH_DISTANCE_THRESHOLD;
        });

        if (isNearFoot) {
          nearFootFramesRef.current += 1;
        } else {
          if (nearFootFramesRef.current >= 2 && Date.now() - lastTouchTimeRef.current > TOUCH_COOLDOWN_MS) {
            result.touchDetected = true;
            lastTouchTimeRef.current = Date.now();
            onTouch();
          }
          nearFootFramesRef.current = 0;
        }
      } else {
        nearFootFramesRef.current = 0;
      }

      drawOverlay(canvas, result, w, h);
      return result;
    },
    [onTouch]
  );

  useEffect(() => {
    if (enabled) loadModels();
  }, [enabled, loadModels]);

  return { loadModels, detectFrame, cocoModelRef, poseModelRef };
}

function drawOverlay(
  canvas: HTMLCanvasElement,
  result: DetectionResult,
  videoW: number,
  videoH: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / videoW;
  const scaleY = canvas.height / videoH;

  if (result.ballPosition) {
    const bx = result.ballPosition.x * videoW * scaleX;
    const by = result.ballPosition.y * videoH * scaleY;
    ctx.beginPath();
    ctx.arc(bx, by, 18, 0, Math.PI * 2);
    ctx.strokeStyle = result.touchDetected ? "#f59e0b" : "#22c55e";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = result.touchDetected ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.15)";
    ctx.fill();
  }

  for (const foot of result.footPositions) {
    const fx = foot.x * videoW * scaleX;
    const fy = foot.y * videoH * scaleY;
    ctx.beginPath();
    ctx.arc(fx, fy, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(59,130,246,0.6)";
    ctx.fill();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
