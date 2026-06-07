"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LEVELS } from "@/data/levels";

const difficultyColor = {
  "Fàcil": "text-green-400 border-green-400",
  "Mitjà": "text-yellow-400 border-yellow-400",
  "Difícil": "text-red-400 border-red-400",
};

export default function Home() {
  const unlockedLevels = [1];

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="text-6xl mb-3">⚽</div>
        <h1 className="text-4xl font-bold text-white mb-2">Dribl</h1>
        <p className="text-green-300 text-lg">Millora el teu toc de pilota</p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        {LEVELS.map((level, i) => {
          const unlocked = unlockedLevels.includes(level.id);
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {unlocked ? (
                <Link href={`/level/${level.id}`}>
                  <div className="bg-[#1a3010] border border-green-700 hover:border-green-400 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] hover:bg-[#213d15]">
                    <LevelCard level={level} unlocked />
                  </div>
                </Link>
              ) : (
                <div className="bg-[#111] border border-gray-700 rounded-2xl p-5 opacity-50 cursor-not-allowed">
                  <LevelCard level={level} unlocked={false} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-gray-500 text-sm"
      >
        Completa els nivells per desbloquejar-ne de nous
      </motion.p>
    </main>
  );
}

function LevelCard({ level, unlocked }: { level: (typeof LEVELS)[0]; unlocked: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-4xl">{unlocked ? level.icon : "🔒"}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-bold text-lg">
            Nivell {level.id}: {level.title}
          </span>
        </div>
        <p className="text-gray-300 text-sm">{level.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-xs border rounded-full px-2 py-0.5 ${difficultyColor[level.difficulty]}`}
          >
            {level.difficulty}
          </span>
          <span className="text-gray-400 text-xs">
            {level.timeLimit}s · Objectiu: {level.targetCount} tocs
          </span>
        </div>
      </div>
      {unlocked && (
        <div className="text-green-400 text-2xl">›</div>
      )}
    </div>
  );
}
