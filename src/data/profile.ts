// Single source of truth for everything personal on the site.
// Edit here; pages read from this file.

export const site = {
  url: "https://roshnrf.vercel.app",
  name: "Roshan Abdul Rauof",
  title: "Roshan Abdul Rauof · Data Science & ML",
  description:
    "MSc Data Science student at TU Dortmund. I build machine learning systems end to end: anomaly detection, speech and voice AI, LLM retrieval, and the real-time code underneath.",
};

export const profile = {
  name: "Roshan Abdul Rauof",
  eyebrow: "MSc Data Science · TU Dortmund",
  availability: "Open to working student and internship roles in Germany",
  headline: "Raw data in, working system out. I build every layer in between.",
  intro:
    "An insider-threat pipeline with a live dashboard. A speech model fine-tuned to 96% phoneme accuracy. A Hindi and Malayalam voice agent that answers in about a second. A 16-caller conference server in C. A demand forecaster for grocery stores. Ask about any of them below.",
  location: "Dortmund, Germany",
  email: "roshanabdlrf03@gmail.com",
  links: {
    github: "https://github.com/roshnrf",
    linkedin: "https://linkedin.com/in/rosh003",
    medium: "https://medium.com/@rosh003",
    resume: "/resume.pdf",
  },
};

export const stats = [
  {
    value: "96.0%",
    label: "phoneme accuracy with a LoRA-tuned Whisper, vs 80.0% stock",
    href: "/projects/articuplay",
  },
  {
    value: "0.897",
    label: "ROC-AUC on CERT r6.2 insider-threat data, 4,000 users",
    href: "/projects/pirs",
  },
  {
    value: "1.0–1.5 s",
    label: "median voice round trip, speech in to speech out, no GPU",
    href: "/projects/scheme-sahayak",
  },
];

export const about = [
  "I am a Data Science master's student at TU Dortmund, with a B.Tech in Computer Science (AI & ML) from VIT Chennai.",
  "Most of my work sits where models meet messy input: children's speech, noisy microphones, behavioural logs with five positive labels in 1.3 million rows. I like the part after the model trains, where you find out whether it survives real data, and I write down what broke along the way.",
  "Before the MSc I interned at DRDO in Bengaluru, building a real-time multi-party VoIP conferencing system in C, and at Feynn Labs, building a demand-forecasting system for small grocery stores.",
];

export const focus = [
  {
    title: "Speech & voice AI",
    body: "ASR fine-tuning, phoneme-level scoring, real-time voice pipelines in Hindi and Malayalam.",
  },
  {
    title: "Applied ML",
    body: "Anomaly detection, forecasting and evaluation that reports limitations next to the headline number.",
  },
  {
    title: "ML systems",
    body: "FastAPI backends, retrieval with confidence gates, and real-time audio pipelines that stay inside a latency budget.",
  },
];

export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  kind: "Education" | "Work";
  points: string[];
};

export const timeline: TimelineItem[] = [
  {
    period: "Oct 2026 – now",
    title: "MSc Data Science",
    org: "TU Dortmund University, Germany",
    kind: "Education",
    points: ["Started in the winter semester 2026/27."],
  },
  {
    period: "Jul – Aug 2026",
    title: "AI Intern",
    org: "Defence Research and Development Organisation (DRDO), Bengaluru",
    kind: "Work",
    points: [
      "Built a real-time multi-party VoIP conferencing system in C with PJSIP/PJMEDIA: server-side call routing, presence state and audio mixing, as the audio layer for a planned AI noise-suppression stage.",
      "Traced an audio latency problem through frame-by-frame timing analysis and isolated codec selection as the main source of delay.",
    ],
  },
  {
    period: "2022 – 2026",
    title: "B.Tech Computer Science (AI & ML)",
    org: "VIT Chennai, India",
    kind: "Education",
    points: [
      "Capstone: PIRS, a 9-layer insider-threat prediction pipeline.",
    ],
  },
  {
    period: "Jul – Sep 2025",
    title: "ML & Data Science Intern",
    org: "Feynn Labs",
    kind: "Work",
    points: [
      "Built FreshStock AI, an inventory optimisation platform for small grocery stores: 87.3% demand-forecast accuracy with Random Forest models and time-series features.",
    ],
  },
];

export const skills = [
  {
    group: "Languages",
    items: ["Python", "C", "SQL", "TypeScript", "Java", "C++"],
  },
  {
    group: "Systems & real-time audio",
    items: [
      "SIP / RTP",
      "PJSIP / PJMEDIA",
      "POSIX (epoll, timerfd)",
      "G.711",
      "Jitter buffering",
    ],
  },
  {
    group: "ML & deep learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "LoRA fine-tuning",
      "LSTM autoencoders",
      "Isolation Forest",
      "Q-learning",
      "SHAP",
    ],
  },
  {
    group: "Speech & NLP",
    items: [
      "Whisper / faster-whisper",
      "Pipecat",
      "Sarvam AI",
      "LangChain",
      "FAISS",
      "RAG",
      "Gemini API",
    ],
  },
  {
    group: "Backend & cloud",
    items: [
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL",
      "Supabase",
      "AWS Lambda / S3 / DynamoDB",
      "Streamlit",
      "React",
    ],
  },
];

export const otherProjects = [
  {
    title: "License Plate Recognition",
    body: "Event-driven serverless pipeline on AWS: S3 uploads trigger Lambda, Rekognition extracts the plate text, results land in DynamoDB behind an API Gateway REST API.",
    tags: ["AWS Lambda", "Rekognition", "DynamoDB"],
    href: "https://github.com/roshnrf/License-Plate-Recognition-AWS",
  },
  {
    title: "FreshStock AI",
    body: "Demand forecasting and automated reordering for small grocery stores. 87.3% forecast accuracy with Random Forest models.",
    tags: ["scikit-learn", "Pandas", "Forecasting"],
    href: "https://github.com/roshnrf/FreshStock-AI---Smart-Inventory-Management-System",
  },
];

export const externalPosts = [
  {
    title:
      "Cracking India's Electric Two-Wheeler Market: A Data-Driven Segmentation Strategy",
    date: "2025-10-01",
    summary:
      "Market segmentation of India's EV two-wheeler space using clustering and consumer data.",
    href: "https://medium.com/@rosh003/cracking-indias-electric-two-wheeler-market-a-data-driven-segmentation-strategy-3eb66a46fe8b",
  },
  {
    title:
      "FreshStock AI: Revolutionizing Inventory Management for Small Grocery Stores",
    date: "2025-10-01",
    summary:
      "How the inventory optimisation system reached 87.3% forecast accuracy.",
    href: "https://medium.com/@rosh003/freshstock-ai-revolutionizing-inventory-management-for-small-grocery-stores-a52eff64420a",
  },
];

export type StoryScene = "pipeline" | "insiders" | "gate" | "phonemes" | "now";

/**
 * The scroll story on the home page: the projects in the order they were
 * built, each leading to the next.
 */
export const story: {
  scene: StoryScene;
  kicker: string;
  title: string;
  body: string[];
  href: string;
  link: string;
}[] = [
  {
    scene: "pipeline",
    kicker: "Nov 2025 · Where it started",
    title: "A story written for one child",
    body: [
      "Four-year-olds do not repeat word lists willingly. StoryWeaver has the child describe a picture, uses Whisper and Gemini to find the words they struggle with, and writes a short story built around those words.",
      "In a one-week pilot, two children completed every session and their practice accuracy rose from 72% to 87%. It also left me with a question: when the speech model quietly corrects a mispronounced word, the error disappears. I came back to that a year later.",
    ],
    href: "/projects/storyweaver",
    link: "StoryWeaver write-up",
  },
  {
    scene: "insiders",
    kicker: "Apr 2026 · Capstone",
    title: "Five insiders among four thousand",
    body: [
      "An insider has legitimate access, so no single action looks wrong. What changes is behaviour over time.",
      "PIRS scores that drift with three detectors and forecasts it seven days ahead. On CERT r6.2 it reached 0.8973 ROC-AUC and ranked three of the five labelled insiders in the top 5% of risk. On real logs from LANL, with no retraining, it held at 0.7429. It runs as a live dashboard across all 4,000 users.",
    ],
    href: "/projects/pirs",
    link: "PIRS write-up and live dashboard",
  },
  {
    scene: "gate",
    kicker: "Jul 2026 · Voice AI",
    title: "A voice agent that answers in a second, in two languages",
    body: [
      "Scheme Sahayak answers spoken questions about Indian government schemes in Hindi and Malayalam, in about 1.0 to 1.5 seconds without a GPU.",
      "Every answer is grounded in retrieved scheme text. I measured where genuine questions scored (0.40 to 0.50) and where unrelated ones did (0.27 to 0.37), and set a gate at 0.38 between them, so the agent only speaks when it has the source to back it.",
    ],
    href: "/projects/scheme-sahayak",
    link: "Scheme Sahayak write-up and demo videos",
  },
  {
    scene: "phonemes",
    kicker: "Sep 2026 · Back to the first idea",
    title: "Hearing the sound a transcript hides",
    body: [
      "StoryWeaver could tell that a word was wrong, not which sound. ArticuPlay answers that. I fine-tuned Whisper with LoRA, training 0.73% of its parameters, and scored every attempt phoneme by phoneme.",
      "On 30 held-out words, phoneme accuracy went from 80% to 96%, and wrong attempts that were praised by mistake fell from 28% to 3%. It is built for children with apraxia of speech, where knowing the exact sound is the whole point of therapy.",
    ],
    href: "/projects/articuplay",
    link: "ArticuPlay write-up",
  },
  {
    scene: "now",
    kicker: "Oct 2026 · Now",
    title: "Dortmund",
    body: [
      "I started the MSc in Data Science at TU Dortmund in October 2026.",
      "I am looking for a working student role or internship in Germany: machine learning, data science, speech and language, or the systems underneath them.",
    ],
    href: "/#contact",
    link: "Get in touch",
  },
];
