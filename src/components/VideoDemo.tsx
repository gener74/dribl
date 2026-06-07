"use client";

import { useState } from "react";
import { Level } from "@/data/levels";

interface Props {
  level: Level;
  onReady: () => void;
}

export default function VideoDemo({ level, onReady }: Props) {
  const [watched, setWatched] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">{level.icon}</div>
        <h2 className="text-2xl font-bold text-white">{level.title}</h2>
        <p className="text-green-300 mt-1">{level.description}</p>
      </div>

      <div className="w-full bg-black rounded-2xl overflow-hidden border border-green-800 aspect-video relative">
        {level.youtubeId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${level.youtubeId}?autoplay=0&rel=0`}
            title="Demo exercici"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setWatched(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <span className="text-5xl">🎬</span>
            <p className="text-sm">Afegeix un vídeo demo a <code>/public/videos/level-{level.id}.mp4</code></p>
          </div>
        )}
      </div>

      <div className="bg-[#1a3010] rounded-xl p-4 w-full border border-green-800">
        <h3 className="text-green-400 font-semibold mb-2">Com funciona:</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>1. Assegura't que la pilota és visible a la càmera</li>
          <li>2. Mantén distància d&apos;1-2 metres de la càmera</li>
          <li>3. L&apos;app detectarà automàticament els tocs</li>
          <li>4. Objectiu: <strong className="text-white">{level.targetCount} tocs consecutius</strong> en {level.timeLimit}s</li>
        </ul>
      </div>

      <button
        onClick={onReady}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-95"
      >
        Estic preparat! Comencem
      </button>
    </div>
  );
}
