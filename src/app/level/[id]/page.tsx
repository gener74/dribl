"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LEVELS } from "@/data/levels";
import VideoDemo from "@/components/VideoDemo";
import ExerciseCamera from "@/components/ExerciseCamera";

type Stage = "demo" | "exercise";

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = parseInt(params.id as string);
  const level = LEVELS.find((l) => l.id === levelId);

  const [stage, setStage] = useState<Stage>("demo");
  const [result, setResult] = useState<{ touches: number; time: number } | null>(null);

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-2xl mb-4">Nivell no trobat</p>
          <button onClick={() => router.push("/")} className="text-green-400 underline">
            Tornar al menú
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = (touches: number, time: number) => {
    setResult({ touches, time });
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <AnimatePresence mode="wait">
        {stage === "demo" && (
          <motion.div
            key="demo"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
          >
            <div className="mb-6">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Tornar al menú
              </button>
            </div>
            <VideoDemo level={level} onReady={() => setStage("exercise")} />
          </motion.div>
        )}

        {stage === "exercise" && (
          <motion.div
            key="exercise"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <ExerciseCamera
              level={level}
              onComplete={handleComplete}
              onBack={() => setStage("demo")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
