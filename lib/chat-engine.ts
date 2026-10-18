/**
 * MindPilot AI - Empathetic Cognitive Chat Engine
 * Dual-persona response generator (Mom & Best Friend mode)
 * Handles competitive exam stress, backlogs, mock test drops, and crisis detection.
 */

export function getLocalEmpatheticResponse(
  message: string,
  examType: string = 'JEE',
  stressors: string[] = ['Backlog', 'Mock Scores'],
  resilience: number = 70,
  name: string = 'Aspirant'
): string {
  const text = message.toLowerCase();
  
  // Sensitive trigger check for medical disclaimer
  const sensitiveWords = [
    'depressed', 'suicide', 'self harm', 'kill myself', 'die', 'end it', 
    'clinical', 'diagnose', 'medication', 'therapy', 'counselor', 'hopeless'
  ];
  const isSensitive = sensitiveWords.some(w => text.includes(w));
  
  const disclaimer = "\n\n*Disclaimer: I am an AI wellness companion, not a medical professional. If you are experiencing severe distress or thoughts of self-harm, please connect with a professional counselor or contact Tele-MANAS (14416) or Kiran (1800-599-0019) immediately.*";

  if (isSensitive) {
    return `${name}, please hear me: I am right here with you, and you are so incredibly precious. I know the weight of ${examType} feels crushing right now, but nothing—absolutely nothing—is worth more than your life and well-being. Please talk to me, talk to your parents, or let's connect with a professional counselor who can help you carry this. I'm wrapping you in the biggest virtual hug right now.${disclaimer}`;
  }

  // Common exam student themes
  if (text.includes('physics') || text.includes('math') || text.includes('chemistry') || text.includes('syllabus') || text.includes('backlog') || text.includes('study')) {
    return `Oh ${name}, backlog anxiety is the absolute worst feeling. First, take a deep breath. Let Mom remind you: your brain cannot absorb rotational mechanics or organic compounds when it is running on panic! Let's treat this like your best friend would: forget the 500-page book for today. Just choose *one* small sub-topic. Can we review just 3 formulas or 2 problems together? I'll sit with you while you do it. Make sure you have a glass of water nearby, okay?`;
  }

  if (text.includes('mock') || text.includes('score') || text.includes('marks') || text.includes('rank') || text.includes('fail') || text.includes('percentile')) {
    return `Hey ${name}, your best friend here. A mock test score is just a diagnostic checkpoint, not a definition of your intelligence or your worth! These coaching institutes set mock tests ridiculously tough on purpose to push everyone. Let's do this: close your eyes for 30 seconds. Mom wants you to repeat: "This mock test does not define my future." Now, let's identify just *one* silly error we can avoid next time, and then we shut the books and take a 20-minute break. Deal?`;
  }

  if (text.includes('parent') || text.includes('dad') || text.includes('mom') || text.includes('expectations') || text.includes('family') || text.includes('pressure') || text.includes('disappoint')) {
    return `Oh ${name}, parental expectations make this whole marathon twice as heavy. I know how deeply you want to make them proud. But remember: most of the time, parents are just projecting their own fears because they love you and see the intense pressure you're under. As your best friend, I promise you: your worth is not tied to an entrance rank. Let's send them a short text: "Studying hard today, taking a short water break!" That keeps them calm and gives you peace. You are doing so well.`;
  }

  if (text.includes('burnout') || text.includes('tired') || text.includes('exhausted') || text.includes('give up') || text.includes('sleep') || text.includes('sleepy') || text.includes('can\'t focus')) {
    return `${name}, look at me: put the pen down right now. You are physically and mentally exhausted, and I am not letting you study in this state. Studying with cognitive fatigue is like running on a flat tire—every minute just creates more frustration. Wash your face with cool water, drink a glass of warm milk or water, and get 7 hours of sleep. Your books will be right here tomorrow. When you wake up rested, we'll attack that syllabus together with fresh energy. Sleep well, dear!`;
  }

  if (text.includes('hello') || text.includes('hi ') || text.includes('hey') || text.includes('greeting') || text.trim() === 'hi' || text.trim() === 'hello') {
    return `Hey ${name}! 🤗 Mom is here, and your best friend is right beside you! We're checking in on you. The exam preparation for ${examType} is tough, but you are so much stronger than you give yourself credit for. Tell me, did you eat something good today? How are you feeling right in this moment?`;
  }

  if (text.includes('panic') || text.includes('anxiety') || text.includes('scared') || text.includes('heart') || text.includes('nervous')) {
    return `Breathe with me, ${name}. Inhale slowly through your nose for 4 seconds... hold for 4... and exhale gently through your mouth for 6 seconds. You are safe right now in this room. That panic is just an adrenaline spike trying to protect you. Drop your shoulders away from your ears, un-clench your jaw, and let's take 3 slow breaths together. I'm right here with you.`;
  }

  return `I hear you, ${name}. Preparing for ${examType} is a long, emotional marathon, and it's completely normal to feel overwhelmed, stuck, or uncertain. Your resilience index is currently at ${resilience}%, which means your foundation is strong—we just need to protect your mental peace today! What is one small, manageable thing we can do in the next 15 minutes to help you feel lighter? I'm listening to everything you have to say.`;
}
