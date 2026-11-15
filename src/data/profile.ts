// Single source of truth for everything personal on the site.
// Edit here; pages read from this file.

export const site = {
  url: "https://roshnrf.vercel.app",
  name: "Roshan Abdul Rauof",
  title: "Roshan Abdul Rauof · Data Science & ML",
  description:
    "MSc Data Science student at TU Dortmund. I build speech and voice AI, applied ML pipelines, and the backend systems that ship them.",
};

export const profile = {
  name: "Roshan Abdul Rauof",
  eyebrow: "MSc Data Science · TU Dortmund",
  availability: "Open to working student and internship roles in Germany",
  headline:
    "I build machine learning systems that hold up outside a notebook.",
  intro:
    "Speech models scored at the phoneme level, voice agents that refuse to guess, and anomaly pipelines validated on data they never trained on. Now studying Data Science at TU Dortmund.",
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
