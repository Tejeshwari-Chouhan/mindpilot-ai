"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, Sparkles, Utensils, RefreshCw, Award } from "lucide-react";
import {
  PICK_EAT_ROUNDS,
  FUNNY_CAMERA_FILTERS,
  type PickEatOption,
} from "@/lib/pick-and-eat-data";

interface FunnyCameraPickEatProps {
  onAddXp: (amount: number) => void;
}

type GamePhase = "idle" | "playing" | "eating" | "done";

export default function FunnyCameraPickEat({ onAddXp }: FunnyCameraPickEatProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<GamePhase>("idle");
  const [roundIndex, setRoundIndex] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [filterIdx, setFilterIdx] = useState(0);
  const [picked, setPicked] = useState<PickEatOption | null>(null);
  const [eatAnim, setEatAnim] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const rounds = PICK_EAT_ROUNDS;
  const currentRound = rounds[roundIndex];
  const filter = FUNNY_CAMERA_FILTERS[filterIdx % FUNNY_CAMERA_FILTERS.length];

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setCameraError("Camera blocked — no worries, funny mode still works!");
      setCameraOn(false);
    }
  }, []);

  // Bind the camera stream to the video element once it is mounted in the DOM
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error("Error playing video:", err));
    }
  }, [cameraOn]);

  useEffect(() => {
    if (phase === "idle" || phase === "done") stopCamera();
  }, [phase, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startGame = async () => {
    setRoundIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setPicked(null);
    setEatAnim(false);
    setFilterIdx(Math.floor(Math.random() * FUNNY_CAMERA_FILTERS.length));
    setPhase("playing");
    await startCamera();
  };

  const handlePick = (option: PickEatOption) => {
    if (phase !== "playing" || picked) return;
    setPicked(option);
    setEatAnim(true);
    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);
    setPhase("eating");

    setTimeout(() => {
      setEatAnim(false);
      const next = roundIndex + 1;
      if (next >= rounds.length) {
        setPhase("done");
        onAddXp(nextScore * 25 + 75);
        stopCamera();
      } else {
        setRoundIndex(next);
        setPicked(null);
        setFilterIdx((i) => (i + 1) % FUNNY_CAMERA_FILTERS.length);
        setPhase("playing");
      }
    }, 2200);
  };

  return (
    <div className="glass-panel bg-white/40 border border-card-border/60 rounded-3xl overflow-hidden min-h-[480px] w-full backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Camera panel */}
        <div className="relative bg-zinc-950 min-h-[280px] lg:min-h-[480px] flex items-center justify-center overflow-hidden">
          {phase !== "idle" && cameraOn ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${filter.style}`}
                aria-label="Funny camera preview"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
              {/* Funny overlay stickers */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg animate-bounce pointer-events-none" aria-hidden="true">
                {filter.emoji}
              </div>
              <div className="absolute bottom-24 left-4 text-2xl animate-pulse pointer-events-none" aria-hidden="true">🍽️</div>
              <div className="absolute bottom-32 right-4 text-2xl animate-pulse pointer-events-none" aria-hidden="true">😋</div>
              <div className="absolute inset-4 border-4 border-dashed border-amber-400/50 rounded-3xl pointer-events-none" />
              {eatAnim && picked && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <span
                    className="text-8xl animate-[bounce_0.4s_ease-in-out_infinite]"
                    role="img"
                    aria-label={`Eating ${picked.label}`}
                  >
                    {picked.emoji}
                  </span>
                  <p className="absolute bottom-16 text-white font-extrabold text-lg drop-shadow-lg animate-pulse">
                    NOM NOM NOM!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="text-7xl" aria-hidden="true">🤳🍕</div>
              <p className="text-text-muted text-sm font-semibold max-w-xs">
                {cameraError ?? "Funny face cam activates when you start"}
              </p>
            </div>
          )}

          {phase === "playing" || phase === "eating" ? (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
              <span className="text-[10px] font-bold bg-black/50 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                Q{roundIndex + 1}/{rounds.length}
              </span>
              <button
                type="button"
                onClick={() => setFilterIdx((i) => (i + 1) % FUNNY_CAMERA_FILTERS.length)}
                className="text-[10px] font-bold bg-amber-500/80 text-white px-2.5 py-1 rounded-full backdrop-blur-sm hover:bg-amber-500 transition cursor-pointer"
                aria-label="Change funny filter"
              >
                {filter.label} {filter.emoji}
              </button>
            </div>
          ) : null}

          {phase !== "idle" && !cameraOn && !cameraError && (
            <button
              type="button"
              onClick={startCamera}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 hover:bg-white text-zinc-900 text-xs font-bold px-4 py-2 rounded-xl shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Enable Camera
            </button>
          )}
        </div>

        {/* Q&A panel */}
        <div className="p-6 flex flex-col justify-center min-h-[280px]">
          {phase === "idle" && (
            <div className="text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center mx-auto">
                <Utensils className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">
                Funny Camera — Pick & Eat
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Turn on your cam, get a silly filter, answer funny exam-stress Q&As, and virtually
                eat your pick. Instant mood lift — zero calories guilt.
              </p>
              <button
                type="button"
                onClick={startGame}
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-95 text-white font-bold py-3 px-8 rounded-xl text-sm inline-flex items-center justify-center gap-2 cursor-pointer w-full"
              >
                <Camera className="w-4 h-4" /> Start Pick & Eat
              </button>
            </div>
          )}

          {phase === "playing" && currentRound && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-1">
                  Pick ONE & eat it!
                </p>
                <h4 className="text-base font-extrabold text-foreground">
                  {currentRound.question}
                </h4>
                <p className="text-xs text-text-muted mt-1 italic">
                  {currentRound.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {currentRound.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePick(opt)}
                    className="p-4 rounded-2xl border-2 border-card-border bg-white/5 hover:border-orange-500 hover:bg-orange-500/5 transition text-left group cursor-pointer"
                  >
                    <span className="text-3xl block mb-1 group-hover:scale-110 transition-transform" aria-hidden="true">
                      {opt.emoji}
                    </span>
                    <span className="text-xs font-bold text-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "eating" && picked && (
            <div className="text-center space-y-4 animate-fadeIn">
              <span className="text-6xl animate-pulse" aria-hidden="true">{picked.emoji}</span>
              <p className="text-sm font-extrabold text-foreground">
                You ate {picked.label}!
              </p>
              <p className="text-xs text-text-muted font-medium leading-relaxed max-w-sm mx-auto">
                {picked.reaction}
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="text-center space-y-4">
              <Award className="w-12 h-12 text-amber-500 mx-auto" aria-hidden="true" />
              <h3 className="text-xl font-extrabold text-foreground">
                Feast Complete!
              </h3>
              <p className="text-sm text-text-muted">
                You picked & ate {score} stress snacks. Mood: upgraded.
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                <Sparkles className="w-3.5 h-3.5" /> +{score * 25 + 75} XP
              </span>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={startGame}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Play Again
                </button>
                <button
                  type="button"
                  onClick={() => { stopCamera(); setPhase("idle"); }}
                  className="border border-card-border text-text-muted hover:text-foreground font-bold py-2.5 px-6 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CameraOff className="w-3.5 h-3.5" /> Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
