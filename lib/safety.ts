export interface Helpline {
  name: string;
  number: string;
  hours: string;
}

export const CRISIS_HELPLINES: Helpline[] = [
  { name: "Tele-MANAS (National)", number: "14416", hours: "24/7" },
  { name: "iCall Psychosocial Helpline", number: "+91-9152987821", hours: "Mon–Sat 10am–8pm" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7" },
  { name: "AASRA", number: "+91-9820466726", hours: "24/7" },
];

const CRISIS_PATTERNS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "self harm",
  "self-harm",
  "hurt myself",
  "no reason to live",
  "better off dead",
];

export function detectCrisisLanguage(text: string): boolean {
  const normalized = text.toLowerCase();
  return CRISIS_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function getCrisisResponse(): string {
  return (
    "I'm really glad you reached out. What you're feeling matters, and you don't have to face this alone. " +
    "Please contact a trained counselor right now — Tele-MANAS at 14416 (24/7) or Vandrevala Foundation at 1860-2662-345. " +
    "Your life is valuable, and support is available."
  );
}
