// Everything the site says lives here. The page and the in-browser shell both
// read from these lists, so an edit here updates both.

export const PROFILE = {
  name: "Srihari Srikanth",
  handle: "srihari",
  school: "Purdue University",
  degree: "B.S. Computer Engineering, Minor in Mathematics",
  graduation: "December 2027",
  location: "West Lafayette, IN",
  email: "cs.srihari875@gmail.com",
  github: "https://github.com/Srihari87",
  linkedin: "https://www.linkedin.com/in/srihari-srikanth/",
  resume: "/Srihari_Srikanth_Resume.pdf",
  summary:
    "Computer Engineering student at Purdue who likes the layer where software meets the machine: shells and syscalls, lock-free queues, data pipelines, GPU clusters. I've shipped production systems at Intellicent, a stealth ML startup and Caterpillar, and I do adversarial-ML research in Prof. Zahra Ghodsi's lab.",
  coursework: [
    "Data Structures & Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Database Systems",
    "Distributed Systems",
    "AI Native Programmer (Claude Code, Codex)",
  ],
  honors: [
    "Purdue Undergraduate Research Fellowship",
    "Purdue Undergraduate ECE Scholarship",
  ],
};

export const EXPERIENCE = [
  {
    id: "intellicent",
    company: "Intellicent",
    role: "Software Engineer Intern",
    location: "Seattle, WA",
    period: "May 2026 – Aug 2026",
    bullets: [
      "Built a serverless AWS pipeline (Lambda, S3) for GPU-accelerated extraction and parsing of 1M+ records.",
      "Engineered SQL data-engineering workflows on Databricks, transforming raw records at scale.",
      "Built observability dashboards for production data pipelines, improving downstream model accuracy by 15%.",
      "Developed Go microservices and REST APIs, streaming records through Kafka for high-intake pipelines.",
    ],
    tags: ["Go", "AWS Lambda", "Kafka", "Databricks", "SQL"],
  },
  {
    id: "signal-found",
    company: "Signal Found",
    note: "Stealth startup",
    role: "Machine Learning Engineering Intern",
    location: "San Francisco, CA",
    period: "Jan 2026 – May 2026",
    bullets: [
      "Built a scalable Python test framework over a vector database, generating 15K+ automated tests and identifying 9 system failures.",
      "Orchestrated 200+ concurrent sandboxed browsers on a Linux VPS with session and network isolation.",
      "Configured TCP/IP networking and IS-IS routing across isolated environments, sustaining 95%+ evasion.",
    ],
    tags: ["Python", "Vector DB", "Linux", "Networking"],
  },
  {
    id: "caterpillar",
    company: "Caterpillar",
    role: "Undergraduate Software Engineer",
    location: "West Lafayette, IN",
    period: "Aug 2025 – Jan 2026",
    bullets: [
      "Re-architected 7 inventory apps into a unified cloud-native platform, cutting data-retrieval time by 50%.",
      "Built low-latency REST APIs enabling near real-time inventory sync across distributed enterprise systems.",
      "Built an LLM-powered assistant over legacy systems, cutting manual inventory-lookup time by 40–60%.",
    ],
    tags: ["Cloud", "REST APIs", "LLMs"],
  },
  {
    id: "tcls-lab",
    company: "TCLS Security Lab",
    note: "Prof. Zahra Ghodsi",
    role: "Undergraduate Machine Learning Researcher",
    location: "West Lafayette, IN",
    period: "Aug 2025 – Present",
    bullets: [
      "Built PyTorch/TensorFlow infrastructure for adversarial-robustness benchmarking on CUDA GPUs.",
      "Benchmarked adversarial attacks (FGSM, PGD) and defenses, quantifying accuracy–robustness tradeoffs.",
      "Built distributed CUDA pipelines with Spark, Kubernetes and Slurm; tuned NUMA affinity and block I/O.",
    ],
    tags: ["PyTorch", "CUDA", "Slurm", "Kubernetes", "Spark"],
  },
];

// Personal and team projects. `repo` is only set when the code is public.
export const PROJECTS = [
  {
    id: "posix-shell",
    title: "POSIX Shell",
    stack: ["C", "POSIX", "Unix syscalls"],
    // DRAFT: written from the standard feature set of a POSIX shell. Edit it to
    // match what your shell actually does before publishing.
    desc: "A Unix command shell written from scratch in C. It parses commands into pipelines, wires up I/O redirection and pipes with fork, exec, dup2 and pipe, runs jobs in the background and reaps them on SIGCHLD, expands environment variables, and ships the usual built-ins (cd, exit, setenv, unsetenv, source). The terminal on this page is a small tribute to it.",
  },
  {
    id: "tick2trade",
    title: "tick2trade",
    stack: ["C++", "Lock-free", "Linux"],
    desc: "A low-latency tick-to-trade engine: market-data feed handler, lock-free queue, array-indexed limit-order-book matcher and a market-making strategy on one hot thread, with nanosecond instrumentation and a live browser dashboard. About 55 ns median and 420 ns p99 service-time latency at 4–7M events/s, with no heap allocation or locks on the hot path.",
    repo: "https://github.com/Srihari87/high-frequency-trading",
    shot: "/shots/tick2trade.jpg",
  },
  {
    id: "boilerswap",
    title: "BoilerSwap",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
    desc: "A full-stack PWA marketplace for Purdue students with @purdue.edu OAuth and JWT sessions, used by real students. A route-optimization service recommends where to meet, cutting buyer–seller coordination by 30%.",
    live: "https://boilerswap.xyz",
  },
  {
    id: "drone",
    title: "Autonomous Drone",
    org: "Embedded Systems at Purdue",
    stack: ["C/C++", "STM32", "Pixhawk", "ROS2", "OpenCV"],
    desc: "Real-time C/C++ firmware on a Pixhawk (STM32) flight controller for an autonomous drone, with sensor and control data integrated across ROS2 nodes and bridged between the flight controller and the companion computer over MAVLink.",
  },
  {
    id: "txn-engine",
    title: "Distributed Transaction Engine",
    stack: ["C++", "gRPC", "Redis", "PostgreSQL", "Docker"],
    desc: "A gRPC transaction service in C++: a transaction manager that moves each transfer from pending to committed or rolled back, idempotency keys cached in Redis in front of PostgreSQL, and a Dockerized deployment.",
    repo: "https://github.com/Srihari87/distributed-engine",
  },
  {
    id: "kairo",
    title: "Kairo",
    stack: ["SwiftUI", "Firebase", "HealthKit", "Solidity"],
    desc: "A SwiftUI iOS app with 400+ signups: Firebase Auth and Firestore real-time sync, cosine-similarity matching over HealthKit biometrics, and a Solidity betting engine settled by HealthKit-verified triggers.",
    shot: "/shots/kairo-feed.png",
  },
];

export const SKILLS = [
  { group: "Languages", items: ["Python", "Java", "Go", "C/C++", "CUDA", "JavaScript", "TypeScript", "SQL", "Bash", "Swift"] },
  { group: "Cloud & DevOps", items: ["Docker", "Kubernetes", "AWS (Lambda, S3)", "CI/CD (Jenkins)", "Git", "Linux", "REST APIs"] },
  { group: "Frameworks & Tools", items: ["React", "Next.js", "Node.js", "Databricks", "Spark", "PostgreSQL"] },
  { group: "ML & AI", items: ["PyTorch", "TensorFlow", "scikit-learn", "Hugging Face", "LangChain", "RAG", "LLMs"] },
];
