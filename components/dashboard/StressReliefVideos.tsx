"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Video, Filter, Award, Sparkles } from "lucide-react";
import {
  STRESS_VIDEOS,
  VIDEO_CATEGORIES,
  type ExamTag,
} from "@/lib/stressVideos";

interface StressReliefVideosProps {
  onAddXp: (amount: number) => void;
}

const EXAM_FILTERS: ExamTag[] = [
  "All",
  "JEE",
  "NEET",
  "UPSC",
  "CAT",
  "GATE",
  "CUET",
  "Boards",
];

export default function StressReliefVideos({ onAddXp }: StressReliefVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState(STRESS_VIDEOS[0]);
  const [examFilter, setExamFilter] = useState<ExamTag>("All");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const playerRef = useRef<any>(null);
  const [watched, setWatched] = useState<Set<string>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mindpilot-watched-videos');
        return saved ? new Set(JSON.parse(saved)) : new Set();
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  const filtered = STRESS_VIDEOS.filter((v) => {
    const examMatch =
      examFilter === "All" || v.exams.includes("All") || v.exams.includes(examFilter);
    const catMatch = categoryFilter === "all" || v.category === categoryFilter;
    return examMatch && catMatch;
  });

  const handleSelect = (video: (typeof STRESS_VIDEOS)[0]) => {
    setSelectedVideo(video);
  };

  const handleClaimReward = (videoId: string) => {
    if (watched.has(videoId)) return;
    const next = new Set([...watched, videoId]);
    setWatched(next);
    localStorage.setItem('mindpilot-watched-videos', JSON.stringify(Array.from(next)));
    onAddXp(75);
    alert(`Thank you for taking a recovery break! +75 XP has been added to your profile. 🎓`);
  };

  // Automated YouTube Player API logic
  useEffect(() => {
    let tag = document.getElementById('yt-iframe-api-script') as HTMLScriptElement;
    if (!tag) {
      tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const createPlayer = () => {
      // Check if YT or window.YT is defined
      const globalYT = (window as any).YT;
      if (!globalYT || !globalYT.Player) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
      }

      playerRef.current = new globalYT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: selectedVideo.youtubeId,
        playerVars: {
          rel: 0,
          autoplay: 1, // Start playing automatically
          modestbranding: 1
        },
        events: {
          onStateChange: (event: any) => {
            // event.data === 0 represents YT.PlayerState.ENDED
            if (event.data === 0) {
              handleClaimReward(selectedVideo.id);
            }
          }
        }
      });
    };

    const globalYT = (window as any).YT;
    if (globalYT && globalYT.Player) {
      createPlayer();
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        createPlayer();
      };
    }

    return () => {
      // Cleanup player only if needed
    };
  }, [selectedVideo.id]);

  return (
    <div className="space-y-6 w-full text-left">
      <div className="glass-panel bg-white/70 border border-slate-200/50 p-5 rounded-3xl space-y-2 shadow-md w-full">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
          <Video className="text-primary w-5 h-5" />
          Stress Relief Library
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Curated videos to lower exam anxiety, improve sleep, and build exam-day confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg border border-card-border relative">
            <div id="youtube-player" className="w-full h-full" />
          </div>
          <div className="glass-panel bg-white/70 border border-slate-200/50 rounded-2xl p-5 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap">
                {selectedVideo.duration}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              {selectedVideo.exams.map((exam) => (
                <span
                  key={exam}
                  className="text-[9px] font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full"
                >
                  {exam}
                </span>
              ))}
            </div>

            {/* Watch Progress & Reward indicator */}
            <div className="mt-4 p-3 rounded-xl border flex items-center justify-between text-xs transition-all bg-slate-50 border-slate-200">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Sparkles size={14} className="text-warning animate-pulse" />
                Automatic Reward:
              </span>
              {watched.has(selectedVideo.id) ? (
                <span className="text-success font-black flex items-center gap-1">
                  <Award size={14} className="text-warning" />
                  +75 XP Credited!
                </span>
              ) : (
                <span className="text-secondary font-black animate-pulse">
                  Watch to the end to get +75 XP automatically! 🎓
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Video list & filters */}
        <div className="space-y-4">
          <div className="glass-panel bg-white/70 border border-slate-200/50 rounded-2xl p-4 shadow-md">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter by Exam
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {EXAM_FILTERS.map((exam) => (
                <button
                  key={exam}
                  onClick={() => setExamFilter(exam)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    examFilter === exam
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel bg-white/70 border border-slate-200/50 rounded-2xl p-4 shadow-md">
            <h4 className="text-[10px] font-black text-secondary uppercase tracking-wider mb-3">
              Category
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {VIDEO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-secondary/10 border-secondary text-secondary"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {filtered.map((video) => (
              <button
                key={video.id}
                onClick={() => handleSelect(video)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                  selectedVideo.id === video.id
                    ? "bg-primary/10 border-primary font-bold text-slate-800"
                    : "bg-white/70 border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-error/15 text-error flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-error" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">
                      {video.title}
                    </p>
                    <p className="text-[9px] text-text-muted">{video.duration}</p>
                  </div>
                  {watched.has(video.id) && (
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1 bg-white/70 border border-slate-200/80 py-2 rounded-xl shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-warning" />
            {watched.size} videos watched · +75 XP each
          </p>
        </div>
      </div>
    </div>
  );
}
