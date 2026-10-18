export type ExamTag =
  | "JEE"
  | "NEET"
  | "UPSC"
  | "CAT"
  | "GATE"
  | "CUET"
  | "Boards"
  | "All";

export interface StressVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  exams: ExamTag[];
  youtubeId: string;
  category: "anxiety" | "motivation" | "breathing" | "sleep" | "strategy";
}

export const STRESS_VIDEOS: StressVideo[] = [
  {
    id: "stress-friend",
    title: "Make Stress Your Ally",
    description:
      "Reframe exam pressure as fuel. Learn how stress can sharpen focus when managed correctly.",
    duration: "14 min",
    exams: ["All"],
    youtubeId: "RcGyVTAoXEU",
    category: "anxiety",
  },
  {
    id: "exam-calm",
    title: "Calm Your Mind Before Exams",
    description:
      "Practical techniques to lower cortisol and enter the exam hall with a clear head.",
    duration: "8 min",
    exams: ["JEE", "NEET", "Boards", "CUET"],
    youtubeId: "ihwcw_ofuME",
    category: "breathing",
  },
  {
    id: "mock-recovery",
    title: "Recovering from a Bad Mock Test",
    description:
      "Turn mock test setbacks into learning data instead of spiraling self-doubt.",
    duration: "6 min",
    exams: ["JEE", "NEET", "GATE", "CAT"],
    youtubeId: "w-HYZvCeHzs",
    category: "motivation",
  },
  {
    id: "sleep-prep",
    title: "Sleep for Memory Consolidation",
    description:
      "Why cutting sleep hurts recall — and how to wind down after late-night study sessions.",
    duration: "10 min",
    exams: ["All"],
    youtubeId: "5MuIMqhT8DM",
    category: "sleep",
  },
  {
    id: "upsc-marathon",
    title: "Sustaining Mental Health in Long Prep",
    description:
      "Managing multi-year exam journeys without burnout — pacing, rest, and self-compassion.",
    duration: "12 min",
    exams: ["UPSC", "GATE"],
    youtubeId: "Ks-_Mh1QhMc",
    category: "strategy",
  },
  {
    id: "cat-pressure",
    title: "Handling Time Pressure in Competitive Exams",
    description:
      "Stay composed when the clock is ticking — exam hall strategies for high-pressure tests.",
    duration: "7 min",
    exams: ["CAT", "JEE", "CUET"],
    youtubeId: "TQMbvJNRpLE",
    category: "strategy",
  },
  {
    id: "box-breathing",
    title: "Box Breathing for Instant Calm",
    description:
      "4-4-4-4 breathing pattern used by athletes and military — perfect before mock tests.",
    duration: "5 min",
    exams: ["All"],
    youtubeId: "gz4G31qVbbI",
    category: "breathing",
  },
  {
    id: "neet-anxiety",
    title: "NEET Exam Day Anxiety Toolkit",
    description:
      "Specific coping strategies for biology-heavy syllabus stress and exam-day nerves.",
    duration: "9 min",
    exams: ["NEET"],
    youtubeId: "hHW1oY26OBQ",
    category: "anxiety",
  },
];

export const VIDEO_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "anxiety", label: "Exam Anxiety" },
  { id: "breathing", label: "Breathing" },
  { id: "motivation", label: "Motivation" },
  { id: "sleep", label: "Sleep & Rest" },
  { id: "strategy", label: "Exam Strategy" },
] as const;
