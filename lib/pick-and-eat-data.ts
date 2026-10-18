export interface PickEatOption {
  id: string;
  emoji: string;
  label: string;
  reaction: string;
}

export interface PickEatRound {
  question: string;
  subtitle: string;
  options: PickEatOption[];
}

export const PICK_EAT_ROUNDS: PickEatRound[] = [
  {
    question: "2 AM study session — pick ONE fuel",
    subtitle: "Your brain is 40% syllabus, 60% caffeine dreams",
    options: [
      { id: "maggi", emoji: "🍜", label: "Midnight Maggi", reaction: "Slurp! Carbs unlocked. Brain says thanks, stomach says hero." },
      { id: "chai", emoji: "☕", label: "Strong Chai", reaction: "Gulp! You are now legally a night owl. Sleep is optional." },
      { id: "fruits", emoji: "🍎", label: "Apple (healthy?)", reaction: "Crunch! Doctor AND mom are proud. Rare W for aspirants." },
      { id: "chips", emoji: "🥔", label: "Study Chips", reaction: "Crackle! Salt heals emotional damage from organic chemistry." },
    ],
  },
  {
    question: "Bad mock score — pick your comfort bite",
    subtitle: "Crying is valid. Eating is also valid.",
    options: [
      { id: "icecream", emoji: "🍦", label: "Ice Cream", reaction: "Brain freeze = temporary amnesia of percentile. Worth it." },
      { id: "samosa", emoji: "🥟", label: "Hot Samosa", reaction: "Crispy hug accepted. Tomorrow's mock doesn't know what hit it." },
      { id: "chocolate", emoji: "🍫", label: "Dark Chocolate", reaction: "Mmm. Serotonin delivery successful. Error log can wait." },
      { id: "lassi", emoji: "🥛", label: "Sweet Lassi", reaction: "Smooth! Anxiety diluted to 3%. Revise after burp." },
    ],
  },
  {
    question: "Syllabus incomplete — pick stress snack",
    subtitle: "Panic eating is a coping mechanism (we checked)",
    options: [
      { id: "pizza", emoji: "🍕", label: "Cheese Pizza", reaction: "Cheesy optimism acquired! 3 chapters still pending though." },
      { id: "biryani", emoji: "🍛", label: "Biryani Bowl", reaction: "Royal treatment for a stressed king/queen. Nap recommended." },
      { id: "cookie", emoji: "🍪", label: "Exam Cookie", reaction: "Fortune says: 'One more mock won't kill you.' Probably." },
      { id: "nuts", emoji: "🥜", label: "Brain Nuts", reaction: "Omega-3 enters the chat. Smart snacking — who are you?" },
    ],
  },
  {
    question: "Parents asked rank again — pick escape food",
    subtitle: "Food > awkward dinner table talk",
    options: [
      { id: "dosa", emoji: "🫓", label: "Crispy Dosa", reaction: "Crunch louder than 'beta rank kya aayi?' Silence achieved." },
      { id: "burger", emoji: "🍔", label: "Stress Burger", reaction: "Layers of feelings, one bite. Process > rank. Always." },
      { id: "juice", emoji: "🧃", label: "Mango Juice", reaction: "Sweet sip of denial. Share one process win tomorrow instead." },
      { id: "paratha", emoji: "🥙", label: "Aloo Paratha", reaction: "Homemade love detected. You are enough, rank or not." },
    ],
  },
  {
    question: "Post-revision reward — pick ONE treat",
    subtitle: "You studied. That alone deserves a medal (or snack)",
    options: [
      { id: "cake", emoji: "🍰", label: "Victory Cake", reaction: "Celebration mode ON! Rest is part of the strategy." },
      { id: "momos", emoji: "🥟", label: "Steamy Momos", reaction: "Hot steam = hot brain. Well done on showing up today." },
      { id: "smoothie", emoji: "🥤", label: "Power Smoothie", reaction: "Blended greatness! Tomorrow's you says thank you." },
      { id: "jalebi", emoji: "🍩", label: "Sweet Jalebi", reaction: "Sugar spiral of joy! Guilt-free break earned." },
    ],
  },
];

export const FUNNY_CAMERA_FILTERS = [
  { id: "chef", label: "Chef Hat", emoji: "👨‍🍳", style: "rotate-1" },
  { id: "clown", label: "Clown Nose", emoji: "🤡", style: "-rotate-1" },
  { id: "cool", label: "Cool Shades", emoji: "😎", style: "rotate-2" },
  { id: "nerd", label: "Study Nerd", emoji: "🤓", style: "-rotate-2" },
] as const;
