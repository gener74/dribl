"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBallTouchDetector } from "@/hooks/useBallTouchDetector";
import { Level } from "@/data/levels";

type Phase = "loading" | "countdown" | "playing" | "success" | "timeout";

interface Props {
  level: Level;
  onComplete: (touches: number, time: number) => void;
  onBack: () => void;
}

export default function ExerciseCamera({ level, onComplete, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [modelsReady, setModelsReady] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [countdown, setCountdown] = useState(3);
  const [loadingMsg, setLoadingMsg] = useState("Iniciant càmera...");
  const [touchFlash, setTouchFlash] = useState(false);

  const touchCountRef = useRef(0);
  const phaseRef = useRef<Phase>("loading");
  const loopRef = useRef<number>(0);

  const handleTouch = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    touchCountRef.current += 1;
    setTouchCount(touchCountRef.current);
    setTouchFlash(true);
    setTimeout(() => setTouchFlash(false), 200);
  }, []);

  const { loadModels, detectFrame } = useBallTouchDetector(handleTouch, true);

  // Start camera
  useEffect(() => {
    let cancelled = false;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "environment" },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch (e: any) {
            if (e?.name !== "AbortError") throw e;
          }
        }
        if (cancelled) return;

        setLoadingMsg("Carregant models d'IA...");
        await loadModels();
        if (cancelled) return;
        setModelsReady(true);
        setPhase("countdown");
      } catch (err) {
        if (!cancelled) {
          setLoadingMsg("Error accedint a la càmera. Comprova els permisos.");
          console.error(err);
        }
      }
    }
    initCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(loopRef.current);
    };
  }, [loadModels]);

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("playing");
      phaseRef.current = "playing";
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      phaseRef.current = "timeout";
      setPhase("timeout");
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (touchCount >= level.targetCount && phase === "playing") {
      phaseRef.current = "success";
      setPhase("success");
      onComplete(touchCount, level.timeLimit - timeLeft);
    }
  }, [touchCount, level.targetCount, level.timeLimit, timeLeft, phase, onComplete]);

  // Detection loop
  useEffect(() => {
    if (!modelsReady || phase === "loading") return;

    let running = true;

    async function loop() {
      if (!running) return;
      if (
        videoRef.current &&
        canvasRef.current &&
        phaseRef.current === "playing"
      ) {
        await detectFrame(videoRef.current, canvasRef.current);
      }
      loopRef.current = requestAnimationFrame(loop);
    }

    loopRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(loopRef.current);
    };
  }, [modelsReady, phase, detectFrame]);

  const timerPercent = (timeLeft / level.timeLimit) * 100;
  const timerColor =
    timeLeft > 20 ? "bg-green-500" : timeLeft > 10 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Tornar
        </button>
        <span className="text-green-300 font-bold">
          Nivell {level.id}: {level.title}
        </span>
        <div />
      </div>

      {/* Camera view */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border-2 transition-colors ${
          touchFlash ? "border-amber-400" : "border-green-800"
        }`}
        style={{ aspectRatio: "4/3" }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full scale-x-[-1]"
          width={640}
          height={480}
        />

        {/* Loading overlay */}
        {phase === "loading" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">{loadingMsg}</p>
          </div>
        )}

        {/* Countdown overlay */}
        <AnimatePresence>
          {phase === "countdown" && (
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60"
            >
              <div className="text-center">
                <div className="text-8xl font-black text-white">
                  {countdown === 0 ? "VA!" : countdown}
                </div>
                <p className="text-green-300 mt-2">Prepara la pilota</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Touch flash */}
        <AnimatePresence>
          {touchFlash && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-amber-400/30 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Touch counter in corner */}
        {phase === "playing" && (
          <div className="absolute top-3 left-3 bg-black/70 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-3xl font-black text-white">{touchCount}</span>
            <span className="text-gray-300 text-sm">/ {level.targetCount}</span>
          </div>
        )}
      </div>

      {/* Timer bar */}
      {phase === "playing" && (
        <div className="w-full">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Temps restant</span>
            <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${timerColor}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Touch dots */}
      {phase === "playing" && (
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: level.targetCount }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < touchCount ? { scale: [1.3, 1] } : {}}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                i < touchCount
                  ? "bg-amber-400 border-amber-400 text-black"
                  : "border-gray-600 text-gray-600"
              }`}
            >
              {i < touchCount ? "✓" : i + 1}
            </motion.div>
          ))}
        </div>
      )}

      {/* Result overlays */}
      <AnimatePresence>
        {(phase === "success" || phase === "timeout") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-2xl p-6 text-center border-2 ${
              phase === "success"
                ? "bg-green-900/50 border-green-500"
                : "bg-red-900/50 border-red-500"
            }`}
          >
            {phase === "success" ? (
              <>
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-2xl font-black text-white">Molt bé!</h2>
                <p className="text-green-300 mt-1">
                  Has completat {touchCount} tocs en {level.timeLimit - timeLeft}s
                </p>
                <button
                  onClick={() => window.location.href = "/"}
                  className="mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Tornar al menú
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">⏱️</div>
                <h2 className="text-2xl font-black text-white">Temps esgotat!</h2>
                <p className="text-gray-300 mt-1">
                  Has fet {touchCount} de {level.targetCount} tocs. Torna-ho a intentar!
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Tornar a intentar
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {phase === "playing" && (
        <p className="text-gray-500 text-xs text-center">
          Assegura&apos;t que la pilota és visible · Punt verd = pilota detectada · Punt blau = peu detectat
        </p>
      )}
    </div>
  );
}
