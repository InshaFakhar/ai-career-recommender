import React, { useState, useEffect, useContext, createContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getComparison, getPdfUrl } from '../services/api';

// ================================================================
// DARK MODE CONTEXT
// ================================================================
const ThemeContext = createContext({ dark: false, toggle: () => {} });

// ================================================================
// CAREER KNOWLEDGE BASE — 100% dynamic from ML prediction
// ================================================================
const CAREER_DB = {
  "Flutter Developer": {
    description: "Flutter Developers build cross-platform mobile applications using Google's Flutter framework and Dart programming language. They create high-performance, visually stunning apps for iOS, Android, and Web from a single codebase.",
    icon: "📱",
    primarySkills: ["Flutter", "Dart", "Firebase", "REST APIs", "State Management", "Git"],
    missingSkills: ["Riverpod/Bloc", "CI/CD for Mobile", "App Store Deployment", "Unit Testing", "Animations"],
    certifications: ["Google Associate Android Developer", "Flutter Certified Developer", "Firebase Certified", "Dart Language Certification", "AWS Mobile Developer"],
    tools: ["Flutter SDK", "Android Studio", "VS Code", "Firebase Console", "Git", "Postman", "Figma"],
    companies: ["Google", "Alibaba", "BMW", "Nubank", "Reflectly", "Hamilton", "Dream11", "Careem"],
    demand: "Very High",
    growth: 85,
    workEnv: ["Remote", "Hybrid"],
    softSkills: ["Attention to Detail", "UI Sensibility", "Problem Solving", "Collaboration", "Continuous Learning"],
    responsibilities: [
      "Build cross-platform mobile apps with Flutter",
      "Implement beautiful UI from Figma designs",
      "Integrate REST APIs and Firebase services",
      "Write unit and widget tests",
      "Deploy apps to Google Play & App Store",
      "Optimize app performance and memory usage"
    ],
    similarCareers: ["Mobile App Developer", "React Native Developer", "iOS Developer", "Android Developer", "Frontend Developer"],
    roadmap: [
      { skill: "Dart Language Fundamentals", done: true, weeks: 0 },
      { skill: "Flutter Widgets & Layouts", done: false, weeks: 3 },
      { skill: "State Management (Riverpod/Bloc)", done: false, weeks: 4 },
      { skill: "Firebase Integration", done: false, weeks: 2 },
      { skill: "REST API Integration", done: false, weeks: 2 },
      { skill: "Navigation & Routing", done: false, weeks: 1 },
      { skill: "Testing & CI/CD", done: false, weeks: 3 },
      { skill: "App Store Deployment", done: false, weeks: 1 },
    ],
    growthPath: ["Flutter Intern", "Junior Flutter Dev", "Flutter Developer", "Senior Flutter Dev", "Lead Mobile Engineer", "Mobile Architect", "CTO"],
    futureScope: "Flutter is Google's fastest growing open-source project with 150k+ GitHub stars. As companies move away from native development, Flutter engineers are in extreme demand globally. Cross-platform skills will dominate mobile development by 2027.",
    projects: ["E-commerce Shopping App", "Chat App with Firebase", "Food Delivery Clone", "Fitness Tracker App", "Multi-platform Portfolio App"],
    salary: {
      "Pakistan":       { entry: "PKR 80k–130k/mo",  mid: "PKR 150k–250k/mo",  senior: "PKR 280k–500k/mo" },
      "UAE":            { entry: "AED 7k–12k/mo",    mid: "AED 14k–22k/mo",    senior: "AED 26k–45k/mo" },
      "Saudi Arabia":   { entry: "SAR 7k–13k/mo",    mid: "SAR 15k–26k/mo",    senior: "SAR 30k–55k/mo" },
      "United Kingdom": { entry: "£30k–45k/yr",      mid: "£50k–72k/yr",       senior: "£78k–120k/yr" },
      "Canada":         { entry: "CAD 55k–78k/yr",   mid: "CAD 85k–118k/yr",   senior: "CAD 125k–185k/yr" },
      "Germany":        { entry: "€40k–58k/yr",      mid: "€62k–88k/yr",       senior: "€92k–138k/yr" },
      "United States":  { entry: "$80k–110k/yr",     mid: "$115k–155k/yr",     senior: "$160k–240k/yr" },
    },
    resources: [
      { name: "Flutter.dev (Official)", url: "https://flutter.dev/learn", type: "Free" },
      { name: "Flutter & Dart - Zero to Hero (Udemy)", url: "#", type: "Paid" },
      { name: "Angela Yu Flutter Bootcamp", url: "#", type: "Paid" },
      { name: "Firebase for Flutter (Google Codelabs)", url: "#", type: "Free" },
      { name: "FlutterFlow (No-code + Code)", url: "#", type: "Free" },
    ],
  },
  "Mobile App Developer": {
    description: "Mobile App Developers design and build applications for smartphones and tablets. They work across iOS and Android platforms, creating user-friendly, high-performance applications that reach millions of users.",
    icon: "📲",
    primarySkills: ["Flutter", "React Native", "Firebase", "REST APIs", "JavaScript", "Dart"],
    missingSkills: ["Native iOS (Swift)", "Native Android (Kotlin)", "Push Notifications", "App Analytics", "Offline Sync"],
    certifications: ["Google Associate Android Developer", "Apple iOS Development", "React Native Certification", "Firebase Certified", "AWS Mobile Developer"],
    tools: ["Android Studio", "Xcode", "VS Code", "Firebase", "Postman", "Git", "Figma"],
    companies: ["Google", "Apple", "Meta", "Snapchat", "Uber", "Careem", "Bykea", "JazzCash"],
    demand: "Very High",
    growth: 80,
    workEnv: ["Remote", "Hybrid", "On-site"],
    softSkills: ["User Empathy", "Problem Solving", "Creativity", "Communication", "Adaptability"],
    responsibilities: [
      "Develop mobile apps for iOS and Android",
      "Integrate backend APIs and third-party SDKs",
      "Optimize app for performance and battery life",
      "Submit apps to App Store and Google Play",
      "Collaborate with UI/UX designers",
      "Fix bugs and maintain existing apps"
    ],
    similarCareers: ["Flutter Developer", "React Native Developer", "iOS Developer", "Android Developer", "Full Stack Developer"],
    roadmap: [
      { skill: "Mobile Development Basics", done: true, weeks: 0 },
      { skill: "Flutter / React Native", done: false, weeks: 5 },
      { skill: "Firebase & Backend Integration", done: false, weeks: 3 },
      { skill: "State Management", done: false, weeks: 3 },
      { skill: "App Testing & Debugging", done: false, weeks: 2 },
      { skill: "App Store / Play Store Deployment", done: false, weeks: 1 },
      { skill: "Push Notifications & Analytics", done: false, weeks: 2 },
    ],
    growthPath: ["App Dev Intern", "Junior App Developer", "Mobile App Developer", "Senior App Developer", "Lead Mobile Engineer", "Mobile Architect", "Head of Mobile"],
    futureScope: "Mobile app market will reach $935 billion by 2026. With 7 billion smartphone users globally, mobile development is one of the safest career bets. AR/VR mobile apps are the next frontier.",
    projects: ["Social Media App", "Ride-sharing Clone", "E-commerce App", "Health Tracking App", "Language Learning App"],
    salary: {
      "Pakistan":       { entry: "PKR 70k–120k/mo",  mid: "PKR 140k–230k/mo",  senior: "PKR 260k–480k/mo" },
      "UAE":            { entry: "AED 7k–12k/mo",    mid: "AED 13k–22k/mo",    senior: "AED 25k–42k/mo" },
      "Saudi Arabia":   { entry: "SAR 7k–13k/mo",    mid: "SAR 15k–24k/mo",    senior: "SAR 28k–52k/mo" },
      "United Kingdom": { entry: "£30k–44k/yr",      mid: "£48k–70k/yr",       senior: "£75k–118k/yr" },
      "Canada":         { entry: "CAD 52k–75k/yr",   mid: "CAD 82k–115k/yr",   senior: "CAD 120k–180k/yr" },
      "Germany":        { entry: "€38k–56k/yr",      mid: "€60k–85k/yr",       senior: "€90k–135k/yr" },
      "United States":  { entry: "$78k–108k/yr",     mid: "$112k–152k/yr",     senior: "$158k–235k/yr" },
    },
    resources: [
      { name: "Google's Android Developer Guides", url: "#", type: "Free" },
      { name: "React Native Official Docs", url: "#", type: "Free" },
      { name: "Udemy Mobile Dev Bootcamp", url: "#", type: "Paid" },
      { name: "Firebase Mobile Codelabs", url: "#", type: "Free" },
      { name: "App Dev with Flutter (Coursera)", url: "#", type: "Free" },
    ],
  },
  "Data Scientist": {
    description: "Data Scientists extract meaningful insights from complex datasets using statistical analysis, machine learning, and data visualization. They bridge the gap between raw data and business decisions, working at the intersection of mathematics, programming, and domain expertise.",
    icon: "🔬",
    primarySkills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas", "NumPy", "Statistics"],
    missingSkills: ["Apache Spark", "Power BI", "MLflow", "Deep Learning", "Feature Engineering"],
    certifications: ["Google Data Analytics Certificate", "IBM Data Science Professional", "AWS ML Specialty", "Coursera ML Specialization (Andrew Ng)", "Microsoft Azure AI Engineer"],
    tools: ["Jupyter Notebook", "VS Code", "Python", "Git", "Docker", "Tableau", "Power BI", "PostgreSQL"],
    companies: ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "IBM", "NVIDIA", "Spotify"],
    demand: "Very High",
    growth: 92,
    workEnv: ["Remote", "Hybrid"],
    softSkills: ["Critical Thinking", "Storytelling with Data", "Problem Solving", "Communication", "Curiosity"],
    responsibilities: [
      "Build and evaluate ML models for business problems",
      "Analyze large datasets to find patterns",
      "Create visualizations and dashboards",
      "Collaborate with engineering and product teams",
      "Present findings to non-technical stakeholders",
      "Monitor deployed models in production"
    ],
    similarCareers: ["ML Engineer", "AI Engineer", "Data Analyst", "Research Scientist", "BI Analyst"],
    roadmap: [
      { skill: "Python Programming", done: true, weeks: 0 },
      { skill: "Statistics & Probability", done: false, weeks: 4 },
      { skill: "Data Analysis (Pandas, NumPy)", done: false, weeks: 3 },
      { skill: "SQL & Databases", done: false, weeks: 2 },
      { skill: "Machine Learning (Scikit-learn)", done: false, weeks: 6 },
      { skill: "Deep Learning (TensorFlow)", done: false, weeks: 5 },
      { skill: "Data Visualization", done: false, weeks: 2 },
      { skill: "MLOps & Deployment", done: false, weeks: 4 },
    ],
    growthPath: ["Data Science Intern", "Junior Data Scientist", "Data Scientist", "Senior Data Scientist", "Lead Data Scientist", "Principal Scientist", "Chief Data Officer"],
    futureScope: "AI and Data Science demand is projected to grow 35% by 2030. With the explosion of big data and generative AI, every industry needs skilled data scientists. Specializations in NLP, Computer Vision, and GenAI offer exceptional growth.",
    projects: ["Customer Churn Predictor", "Movie Recommendation System", "Sentiment Analysis App", "Stock Price Forecaster", "Image Classifier with CNN"],
    salary: {
      "Pakistan":       { entry: "PKR 80k–150k/mo",  mid: "PKR 200k–350k/mo",  senior: "PKR 400k–700k/mo" },
      "UAE":            { entry: "AED 8k–14k/mo",    mid: "AED 16k–26k/mo",    senior: "AED 30k–52k/mo" },
      "Saudi Arabia":   { entry: "SAR 9k–15k/mo",    mid: "SAR 18k–30k/mo",    senior: "SAR 36k–62k/mo" },
      "United Kingdom": { entry: "£35k–52k/yr",      mid: "£56k–82k/yr",       senior: "£88k–138k/yr" },
      "Canada":         { entry: "CAD 62k–88k/yr",   mid: "CAD 92k–135k/yr",   senior: "CAD 145k–208k/yr" },
      "Germany":        { entry: "€46k–64k/yr",      mid: "€68k–95k/yr",       senior: "€98k–148k/yr" },
      "United States":  { entry: "$82k–115k/yr",     mid: "$122k–165k/yr",     senior: "$172k–258k/yr" },
    },
    resources: [
      { name: "Andrew Ng ML Specialization (Coursera)", url: "#", type: "Paid" },
      { name: "fast.ai Practical Deep Learning", url: "#", type: "Free" },
      { name: "Kaggle Learn (Free)", url: "#", type: "Free" },
      { name: "DataCamp Data Scientist Track", url: "#", type: "Paid" },
      { name: "Google Data Analytics (Coursera)", url: "#", type: "Paid" },
    ],
  },
  "Machine Learning Engineer": {
    description: "ML Engineers design, build, and deploy ML systems at production scale. They bridge data science and software engineering, ensuring ML models run efficiently and reliably in real-world environments.",
    icon: "🤖",
    primarySkills: ["Python", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "MLflow"],
    missingSkills: ["Kubeflow", "Apache Spark", "Terraform", "Model Monitoring", "A/B Testing"],
    certifications: ["Google ML Engineer", "AWS ML Specialty", "IBM AI Engineering", "Deep Learning Specialization", "MLOps Zoomcamp"],
    tools: ["Docker", "Kubernetes", "MLflow", "Jupyter", "Git", "AWS SageMaker", "TensorFlow Serving"],
    companies: ["Google", "NVIDIA", "OpenAI", "Microsoft", "Amazon", "Apple", "Tesla", "DeepMind"],
    demand: "Very High",
    growth: 95,
    workEnv: ["Remote", "Hybrid"],
    softSkills: ["Systems Thinking", "Problem Solving", "Communication", "Collaboration", "Attention to Scale"],
    responsibilities: [
      "Build and deploy ML models to production",
      "Design ML pipelines and automation",
      "Optimize model performance and latency",
      "Monitor models and retrain on new data",
      "Collaborate with data scientists and engineers",
      "Implement A/B testing frameworks"
    ],
    similarCareers: ["Data Scientist", "AI Engineer", "Software Engineer", "DevOps Engineer", "Research Engineer"],
    roadmap: [
      { skill: "Python & ML Fundamentals", done: true, weeks: 0 },
      { skill: "Deep Learning (TF/PyTorch)", done: false, weeks: 6 },
      { skill: "Docker & Containerization", done: false, weeks: 3 },
      { skill: "Kubernetes & Orchestration", done: false, weeks: 4 },
      { skill: "MLOps & CI/CD for ML", done: false, weeks: 4 },
      { skill: "Cloud ML (AWS SageMaker)", done: false, weeks: 3 },
      { skill: "Model Monitoring & Drift Detection", done: false, weeks: 2 },
    ],
    growthPath: ["ML Intern", "Junior ML Engineer", "ML Engineer", "Senior ML Engineer", "Staff ML Engineer", "Principal Engineer", "ML Director"],
    futureScope: "ML Engineering is the fastest growing tech role. With GenAI and LLM boom, demand for engineers who can deploy and scale AI systems has skyrocketed. 40%+ growth expected through 2030.",
    projects: ["Real-time Object Detection API", "NLP Text Classifier Service", "ML Pipeline with Airflow", "Model Serving with FastAPI", "Recommendation System at Scale"],
    salary: {
      "Pakistan":       { entry: "PKR 100k–180k/mo",  mid: "PKR 250k–420k/mo",  senior: "PKR 500k–900k/mo" },
      "UAE":            { entry: "AED 10k–16k/mo",    mid: "AED 18k–30k/mo",    senior: "AED 36k–62k/mo" },
      "Saudi Arabia":   { entry: "SAR 11k–18k/mo",    mid: "SAR 22k–36k/mo",    senior: "SAR 42k–72k/mo" },
      "United Kingdom": { entry: "£42k–62k/yr",       mid: "£68k–95k/yr",       senior: "£100k–158k/yr" },
      "Canada":         { entry: "CAD 72k–98k/yr",    mid: "CAD 105k–148k/yr",  senior: "CAD 158k–228k/yr" },
      "Germany":        { entry: "€52k–72k/yr",       mid: "€78k–108k/yr",      senior: "€115k–168k/yr" },
      "United States":  { entry: "$102k–135k/yr",     mid: "$142k–188k/yr",     senior: "$195k–285k/yr" },
    },
    resources: [
      { name: "MLOps Specialization (Coursera)", url: "#", type: "Paid" },
      { name: "Full Stack Deep Learning", url: "#", type: "Free" },
      { name: "Hugging Face Courses", url: "#", type: "Free" },
      { name: "AWS ML Engineer Path", url: "#", type: "Paid" },
      { name: "Made With ML (MLOps)", url: "#", type: "Free" },
    ],
  },
  "Full Stack Developer": {
    description: "Full Stack Developers handle both frontend and backend development, capable of building complete web applications independently. They work with databases, APIs, and user interfaces across the entire technology stack.",
    icon: "🌐",
    primarySkills: ["React", "Node.js", "JavaScript", "MongoDB", "SQL", "Express.js", "TypeScript"],
    missingSkills: ["Docker", "GraphQL", "Redis", "AWS", "Testing (Jest/Cypress)"],
    certifications: ["Meta Full-Stack Developer", "AWS Developer Associate", "MongoDB Developer", "React Certification", "Google Cloud Developer"],
    tools: ["VS Code", "Git", "Docker", "Postman", "MongoDB Compass", "MySQL Workbench", "Firebase"],
    companies: ["Startups", "Google", "Microsoft", "Shopify", "Atlassian", "Slack", "Zoom", "HubSpot"],
    demand: "Very High",
    growth: 78,
    workEnv: ["Remote", "Hybrid", "On-site"],
    softSkills: ["Versatility", "Problem Solving", "Communication", "Time Management", "Self-management"],
    responsibilities: [
      "Build complete web applications end-to-end",
      "Design and implement REST/GraphQL APIs",
      "Create responsive and interactive frontends",
      "Design database schemas and queries",
      "Deploy applications to cloud platforms",
      "Mentor junior developers and code review"
    ],
    similarCareers: ["Frontend Developer", "Backend Developer", "Software Engineer", "Mobile App Developer", "DevOps Engineer"],
    roadmap: [
      { skill: "HTML/CSS/JavaScript", done: true, weeks: 0 },
      { skill: "React.js", done: false, weeks: 5 },
      { skill: "Node.js & Express", done: false, weeks: 4 },
      { skill: "SQL & MongoDB", done: false, weeks: 3 },
      { skill: "REST API Design", done: false, weeks: 2 },
      { skill: "TypeScript", done: false, weeks: 3 },
      { skill: "Docker & Deployment", done: false, weeks: 3 },
      { skill: "Testing & CI/CD", done: false, weeks: 2 },
    ],
    growthPath: ["Intern Developer", "Junior Full Stack", "Full Stack Developer", "Senior Full Stack", "Tech Lead", "Solutions Architect", "CTO"],
    futureScope: "Full Stack developers are among the most demanded professionals. MERN/MEAN stack dominates modern web. JAMstack, serverless, and edge computing are reshaping the landscape.",
    projects: ["Social Media Platform", "E-commerce with Payment", "Real-time Collaboration Tool", "Project Management App", "Blog with CMS"],
    salary: {
      "Pakistan":       { entry: "PKR 70k–130k/mo",  mid: "PKR 160k–280k/mo",  senior: "PKR 350k–600k/mo" },
      "UAE":            { entry: "AED 8k–13k/mo",    mid: "AED 15k–25k/mo",    senior: "AED 28k–48k/mo" },
      "Saudi Arabia":   { entry: "SAR 8k–14k/mo",    mid: "SAR 18k–28k/mo",    senior: "SAR 32k–58k/mo" },
      "United Kingdom": { entry: "£32k–48k/yr",      mid: "£52k–75k/yr",       senior: "£80k–125k/yr" },
      "Canada":         { entry: "CAD 58k–80k/yr",   mid: "CAD 88k–125k/yr",   senior: "CAD 135k–195k/yr" },
      "Germany":        { entry: "€44k–60k/yr",      mid: "€65k–90k/yr",       senior: "€95k–140k/yr" },
      "United States":  { entry: "$85k–115k/yr",     mid: "$120k–160k/yr",     senior: "$165k–240k/yr" },
    },
    resources: [
      { name: "The Odin Project (Free)", url: "#", type: "Free" },
      { name: "MERN Stack - Udemy", url: "#", type: "Paid" },
      { name: "FreeCodeCamp Full Stack", url: "#", type: "Free" },
      { name: "Meta Full-Stack Certificate", url: "#", type: "Paid" },
      { name: "Next.js Official Docs", url: "#", type: "Free" },
    ],
  },
  "Frontend Developer": {
    description: "Frontend Developers build the visual layer of web applications. They create responsive, interactive user interfaces ensuring great user experiences across all devices using modern JavaScript frameworks.",
    icon: "🎨",
    primarySkills: ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Next.js"],
    missingSkills: ["Testing (Jest/RTL)", "GraphQL", "Accessibility (a11y)", "Performance Optimization", "WebSockets"],
    certifications: ["Meta Front-End Developer", "Google UX Design", "freeCodeCamp Responsive Web", "React Developer Certification", "AWS Cloud Practitioner"],
    tools: ["VS Code", "Git", "Chrome DevTools", "Figma", "Webpack", "Vite", "Storybook"],
    companies: ["Google", "Meta", "Netflix", "Airbnb", "Shopify", "Twitter", "Adobe", "Canva"],
    demand: "High",
    growth: 72,
    workEnv: ["Remote", "Hybrid", "On-site"],
    softSkills: ["Creativity", "Attention to Detail", "Communication", "Teamwork", "Pixel-perfect mindset"],
    responsibilities: [
      "Build responsive UI components",
      "Implement designs from Figma/XD mockups",
      "Optimize web performance (Core Web Vitals)",
      "Write unit and integration tests",
      "Ensure cross-browser compatibility",
      "Collaborate with backend and design teams"
    ],
    similarCareers: ["Full Stack Developer", "UI/UX Designer", "Backend Developer", "React Native Developer", "Web Designer"],
    roadmap: [
      { skill: "HTML & CSS Mastery", done: true, weeks: 0 },
      { skill: "JavaScript ES6+", done: false, weeks: 4 },
      { skill: "React.js", done: false, weeks: 5 },
      { skill: "TypeScript", done: false, weeks: 3 },
      { skill: "Next.js & SSR", done: false, weeks: 3 },
      { skill: "Testing (Jest/RTL)", done: false, weeks: 2 },
      { skill: "Web Performance", done: false, weeks: 2 },
    ],
    growthPath: ["Frontend Intern", "Junior Frontend Dev", "Frontend Developer", "Senior Frontend Dev", "Lead Frontend Engineer", "Frontend Architect", "VP Engineering"],
    futureScope: "Frontend development evolves with PWAs, Web3, and AI-powered UIs. React and Next.js dominate. TypeScript is now industry standard. AI code assistants are boosting developer productivity 40%+.",
    projects: ["Portfolio Website", "E-commerce App with React", "Real-time Dashboard", "Clone of Popular App", "Component Library"],
    salary: {
      "Pakistan":       { entry: "PKR 60k–100k/mo",  mid: "PKR 120k–200k/mo",  senior: "PKR 250k–450k/mo" },
      "UAE":            { entry: "AED 6k–10k/mo",    mid: "AED 12k–20k/mo",    senior: "AED 25k–40k/mo" },
      "Saudi Arabia":   { entry: "SAR 6k–12k/mo",    mid: "SAR 14k–24k/mo",    senior: "SAR 28k–50k/mo" },
      "United Kingdom": { entry: "£28k–42k/yr",      mid: "£46k–68k/yr",       senior: "£72k–115k/yr" },
      "Canada":         { entry: "CAD 50k–72k/yr",   mid: "CAD 80k–115k/yr",   senior: "CAD 122k–175k/yr" },
      "Germany":        { entry: "€38k–54k/yr",      mid: "€56k–80k/yr",       senior: "€84k–125k/yr" },
      "United States":  { entry: "$72k–98k/yr",      mid: "$102k–142k/yr",     senior: "$148k–215k/yr" },
    },
    resources: [
      { name: "JavaScript.info (Free)", url: "#", type: "Free" },
      { name: "React Official Docs", url: "#", type: "Free" },
      { name: "Frontend Masters", url: "#", type: "Paid" },
      { name: "CSS Tricks (Free)", url: "#", type: "Free" },
      { name: "Scrimba React Course", url: "#", type: "Free" },
    ],
  },
  "Backend Developer": {
    description: "Backend Developers build server-side logic, databases, and APIs that power applications. They ensure data is processed, stored, and delivered securely and efficiently.",
    icon: "⚙️",
    primarySkills: ["Node.js", "Python", "SQL", "MongoDB", "REST APIs", "Express.js", "Docker"],
    missingSkills: ["Microservices", "Redis Caching", "Message Queues (RabbitMQ)", "gRPC", "Load Balancing"],
    certifications: ["AWS Developer Associate", "MongoDB Developer", "Node.js Certification", "Google Cloud Developer", "Docker Certified Associate"],
    tools: ["VS Code", "Docker", "Postman", "Git", "PostgreSQL", "Redis", "Linux Terminal", "NGINX"],
    companies: ["Amazon", "Microsoft", "Google", "Uber", "Stripe", "PayPal", "Twilio", "GitHub"],
    demand: "Very High",
    growth: 80,
    workEnv: ["Remote", "Hybrid", "On-site"],
    softSkills: ["Logical Thinking", "Problem Solving", "Documentation", "Teamwork", "Security Mindset"],
    responsibilities: [
      "Design and build REST/GraphQL APIs",
      "Design database schemas and optimize queries",
      "Implement authentication & authorization (JWT/OAuth)",
      "Optimize server performance and caching",
      "Write technical documentation",
      "Ensure API security and rate limiting"
    ],
    similarCareers: ["Full Stack Developer", "DevOps Engineer", "Cloud Engineer", "Database Administrator", "Software Engineer"],
    roadmap: [
      { skill: "Node.js / Python Fundamentals", done: true, weeks: 0 },
      { skill: "SQL & Database Design", done: false, weeks: 3 },
      { skill: "REST API Design & Security", done: false, weeks: 3 },
      { skill: "Authentication (JWT/OAuth)", done: false, weeks: 2 },
      { skill: "Docker & Containers", done: false, weeks: 2 },
      { skill: "Redis & Caching Strategies", done: false, weeks: 2 },
      { skill: "Microservices Architecture", done: false, weeks: 4 },
    ],
    growthPath: ["Backend Intern", "Junior Backend Dev", "Backend Developer", "Senior Backend Dev", "Lead Backend Engineer", "Solutions Architect", "CTO"],
    futureScope: "Backend development is the backbone of every digital product. Serverless, edge computing, and microservices are the future. GraphQL adoption is growing 200% year-over-year.",
    projects: ["REST API with Auth (Node.js)", "E-commerce Backend", "Real-time Chat Server", "URL Shortener Service", "Payment Gateway Integration"],
    salary: {
      "Pakistan":       { entry: "PKR 70k–120k/mo",  mid: "PKR 150k–250k/mo",  senior: "PKR 300k–520k/mo" },
      "UAE":            { entry: "AED 7k–12k/mo",    mid: "AED 14k–23k/mo",    senior: "AED 26k–46k/mo" },
      "Saudi Arabia":   { entry: "SAR 7k–13k/mo",    mid: "SAR 16k–26k/mo",    senior: "SAR 30k–56k/mo" },
      "United Kingdom": { entry: "£30k–46k/yr",      mid: "£52k–74k/yr",       senior: "£78k–122k/yr" },
      "Canada":         { entry: "CAD 56k–78k/yr",   mid: "CAD 86k–122k/yr",   senior: "CAD 132k–188k/yr" },
      "Germany":        { entry: "€42k–60k/yr",      mid: "€64k–88k/yr",       senior: "€92k–138k/yr" },
      "United States":  { entry: "$82k–108k/yr",     mid: "$112k–152k/yr",     senior: "$158k–235k/yr" },
    },
    resources: [
      { name: "Node.js Official Docs", url: "#", type: "Free" },
      { name: "The Backend Engineering Course (Udemy)", url: "#", type: "Paid" },
      { name: "FastAPI Python Docs", url: "#", type: "Free" },
      { name: "System Design Primer (GitHub)", url: "#", type: "Free" },
      { name: "Hussein Nasser (YouTube)", url: "#", type: "Free" },
    ],
  },
  "DevOps Engineer": {
    description: "DevOps Engineers bridge development and operations, automating deployment pipelines, managing cloud infrastructure, and ensuring applications run reliably at scale using modern tools and practices.",
    icon: "🔧",
    primarySkills: ["Docker", "Kubernetes", "Linux", "AWS", "Git", "CI/CD", "Terraform"],
    missingSkills: ["Ansible", "Prometheus/Grafana", "Helm Charts", "ArgoCD", "Security Scanning"],
    certifications: ["AWS DevOps Engineer Professional", "Docker Certified Associate", "CKA (Kubernetes)", "HashiCorp Terraform Associate", "Google DevOps Engineer"],
    tools: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Ansible", "Prometheus", "Grafana"],
    companies: ["Amazon", "Google", "Microsoft", "Netflix", "Spotify", "Uber", "Cloudflare", "HashiCorp"],
    demand: "Very High",
    growth: 88,
    workEnv: ["Remote", "Hybrid"],
    softSkills: ["Systems Thinking", "Problem Solving", "Collaboration", "Attention to Detail", "Incident Response"],
    responsibilities: [
      "Build and maintain CI/CD pipelines",
      "Manage cloud infrastructure as code",
      "Monitor system performance and alerts",
      "Automate repetitive operational tasks",
      "Ensure security and compliance",
      "Respond to production incidents"
    ],
    similarCareers: ["Cloud Engineer", "Platform Engineer", "Site Reliability Engineer", "System Administrator", "Backend Developer"],
    roadmap: [
      { skill: "Linux & Bash Scripting", done: true, weeks: 0 },
      { skill: "Git & Version Control", done: false, weeks: 1 },
      { skill: "Docker & Containerization", done: false, weeks: 3 },
      { skill: "Kubernetes Orchestration", done: false, weeks: 5 },
      { skill: "CI/CD (GitHub Actions/Jenkins)", done: false, weeks: 3 },
      { skill: "Terraform (Infrastructure as Code)", done: false, weeks: 3 },
      { skill: "AWS / Azure / GCP", done: false, weeks: 4 },
      { skill: "Monitoring (Prometheus/Grafana)", done: false, weeks: 2 },
    ],
    growthPath: ["DevOps Intern", "Junior DevOps Engineer", "DevOps Engineer", "Senior DevOps Engineer", "Lead DevOps Engineer", "Platform Architect", "VP Infrastructure"],
    futureScope: "DevOps is evolving into Platform Engineering and GitOps. With cloud adoption accelerating, DevOps professionals earn some of the highest salaries in tech. Platform engineering is the next evolution.",
    projects: ["CI/CD Pipeline with GitHub Actions", "Kubernetes Cluster Setup", "Terraform AWS Infrastructure", "Monitoring Stack (Prometheus + Grafana)", "Self-healing Infrastructure"],
    salary: {
      "Pakistan":       { entry: "PKR 80k–140k/mo",  mid: "PKR 180k–320k/mo",  senior: "PKR 380k–680k/mo" },
      "UAE":            { entry: "AED 9k–15k/mo",    mid: "AED 17k–28k/mo",    senior: "AED 32k–55k/mo" },
      "Saudi Arabia":   { entry: "SAR 9k–16k/mo",    mid: "SAR 19k–32k/mo",    senior: "SAR 36k–65k/mo" },
      "United Kingdom": { entry: "£38k–56k/yr",      mid: "£62k–88k/yr",       senior: "£92k–145k/yr" },
      "Canada":         { entry: "CAD 65k–90k/yr",   mid: "CAD 96k–138k/yr",   senior: "CAD 148k–218k/yr" },
      "Germany":        { entry: "€48k–66k/yr",      mid: "€72k–98k/yr",       senior: "€102k–155k/yr" },
      "United States":  { entry: "$92k–122k/yr",     mid: "$132k–175k/yr",     senior: "$178k–265k/yr" },
    },
    resources: [
      { name: "KodeKloud DevOps Learning Path", url: "#", type: "Paid" },
      { name: "Linux Foundation CKA Course", url: "#", type: "Paid" },
      { name: "TechWorld with Nana (YouTube)", url: "#", type: "Free" },
      { name: "HashiCorp Terraform Docs", url: "#", type: "Free" },
      { name: "AWS DevOps Engineer Path", url: "#", type: "Paid" },
    ],
  },
  "Cyber Security Analyst": {
    description: "Cyber Security Analysts protect organizations from digital threats. They monitor networks, conduct vulnerability assessments, respond to incidents, and implement security measures to safeguard sensitive data.",
    icon: "🔒",
    primarySkills: ["Networking", "Linux", "Python", "Cyber Security", "Ethical Hacking", "SIEM"],
    missingSkills: ["Penetration Testing", "Incident Response", "Malware Analysis", "Threat Intelligence", "Cloud Security"],
    certifications: ["CompTIA Security+", "CEH (Certified Ethical Hacker)", "CISSP", "AWS Security Specialty", "Google Cybersecurity Certificate"],
    tools: ["Wireshark", "Metasploit", "Nmap", "Burp Suite", "Kali Linux", "Splunk", "SIEM Tools", "Nessus"],
    companies: ["CrowdStrike", "Palo Alto Networks", "IBM Security", "Microsoft", "Amazon", "Deloitte", "Accenture", "FireEye"],
    demand: "Very High",
    growth: 90,
    workEnv: ["Hybrid", "On-site"],
    softSkills: ["Analytical Thinking", "Attention to Detail", "Ethics", "Communication", "Stress Management"],
    responsibilities: [
      "Monitor security events and SIEM alerts",
      "Conduct vulnerability assessments and pen tests",
      "Respond to and investigate security incidents",
      "Implement and maintain security policies",
      "Perform threat hunting and intelligence gathering",
      "Train staff on security awareness"
    ],
    similarCareers: ["Network Engineer", "Cloud Security Engineer", "SOC Analyst", "Penetration Tester", "Information Security Manager"],
    roadmap: [
      { skill: "Networking Fundamentals (TCP/IP)", done: true, weeks: 0 },
      { skill: "Linux Administration", done: false, weeks: 3 },
      { skill: "Python for Security Automation", done: false, weeks: 3 },
      { skill: "Ethical Hacking & Kali Linux", done: false, weeks: 6 },
      { skill: "SIEM & Log Analysis", done: false, weeks: 3 },
      { skill: "Penetration Testing Methodology", done: false, weeks: 5 },
      { skill: "Cloud Security (AWS/Azure)", done: false, weeks: 3 },
    ],
    growthPath: ["Security Intern", "Junior SOC Analyst", "Security Analyst", "Senior Security Analyst", "Security Engineer", "Security Architect", "CISO"],
    futureScope: "Cybersecurity is #1 fastest growing tech field. Cyber attacks increased 300%+ since 2020. Global cybersecurity market will reach $366 billion by 2028. Zero-trust security is the new standard.",
    projects: ["Network Vulnerability Scanner", "Phishing Detection Tool", "Intrusion Detection System", "Security Audit Report", "Capture The Flag (CTF) Challenges"],
    salary: {
      "Pakistan":       { entry: "PKR 75k–130k/mo",  mid: "PKR 170k–280k/mo",  senior: "PKR 350k–600k/mo" },
      "UAE":            { entry: "AED 8k–13k/mo",    mid: "AED 15k–26k/mo",    senior: "AED 30k–52k/mo" },
      "Saudi Arabia":   { entry: "SAR 8k–15k/mo",    mid: "SAR 18k–30k/mo",    senior: "SAR 35k–65k/mo" },
      "United Kingdom": { entry: "£36k–52k/yr",      mid: "£56k–82k/yr",       senior: "£88k–138k/yr" },
      "Canada":         { entry: "CAD 62k–88k/yr",   mid: "CAD 92k–135k/yr",   senior: "CAD 145k–208k/yr" },
      "Germany":        { entry: "€46k–64k/yr",      mid: "€70k–96k/yr",       senior: "€102k–152k/yr" },
      "United States":  { entry: "$82k–115k/yr",     mid: "$122k–165k/yr",     senior: "$168k–255k/yr" },
    },
    resources: [
      { name: "TryHackMe (Beginner Friendly)", url: "#", type: "Free/Paid" },
      { name: "HackTheBox (Advanced)", url: "#", type: "Free/Paid" },
      { name: "CompTIA Security+ Study Guide", url: "#", type: "Paid" },
      { name: "Google Cybersecurity Certificate", url: "#", type: "Paid" },
      { name: "Cybrary (Free Courses)", url: "#", type: "Free" },
    ],
  },
  "UI/UX Designer": {
    description: "UI/UX Designers create intuitive, visually appealing digital experiences. They research user behavior, create wireframes and prototypes, and collaborate with developers to build products users love.",
    icon: "✏️",
    primarySkills: ["Figma", "UI/UX Design", "CSS", "HTML", "Adobe XD", "User Research"],
    missingSkills: ["Motion Design", "Design Systems", "Accessibility (WCAG)", "User Testing", "Framer"],
    certifications: ["Google UX Design Certificate", "Interaction Design Foundation", "Adobe XD Certification", "Meta UI/UX Designer", "Nielsen Norman UX Certificate"],
    tools: ["Figma", "Adobe XD", "Sketch", "InVision", "Zeplin", "Hotjar", "Maze", "Miro"],
    companies: ["Apple", "Google", "Adobe", "Airbnb", "Spotify", "Canva", "Figma", "Microsoft"],
    demand: "High",
    growth: 68,
    workEnv: ["Remote", "Hybrid", "On-site"],
    softSkills: ["Empathy", "Creativity", "Communication", "Attention to Detail", "User Advocacy"],
    responsibilities: [
      "Conduct user research and interviews",
      "Create wireframes, mockups, and prototypes",
      "Design high-fidelity UI in Figma",
      "Build and maintain design systems",
      "Conduct usability testing and iterate",
      "Collaborate closely with frontend developers"
    ],
    similarCareers: ["Frontend Developer", "Product Designer", "Graphic Designer", "Product Manager", "Motion Designer"],
    roadmap: [
      { skill: "Design Principles & Theory", done: true, weeks: 0 },
      { skill: "Figma Mastery", done: false, weeks: 4 },
      { skill: "User Research Methods", done: false, weeks: 3 },
      { skill: "Wireframing & Information Architecture", done: false, weeks: 2 },
      { skill: "Prototyping & User Testing", done: false, weeks: 3 },
      { skill: "Design Systems", done: false, weeks: 3 },
      { skill: "HTML/CSS Basics for Designers", done: false, weeks: 3 },
    ],
    growthPath: ["Design Intern", "Junior UI/UX Designer", "UI/UX Designer", "Senior Designer", "Lead Designer", "Design Director", "Chief Design Officer"],
    futureScope: "UX design is critical as digital products compete on experience. AI tools (Figma AI, Galileo) are transforming design workflows. Designers who understand AI and accessibility will command premium salaries.",
    projects: ["Mobile App Redesign Case Study", "E-commerce UI Kit", "Design System from Scratch", "User Research & Usability Report", "SaaS Dashboard Design"],
    salary: {
      "Pakistan":       { entry: "PKR 50k–90k/mo",   mid: "PKR 100k–180k/mo",  senior: "PKR 200k–380k/mo" },
      "UAE":            { entry: "AED 6k–10k/mo",    mid: "AED 12k–20k/mo",    senior: "AED 22k–40k/mo" },
      "Saudi Arabia":   { entry: "SAR 6k–11k/mo",    mid: "SAR 13k–23k/mo",    senior: "SAR 26k–48k/mo" },
      "United Kingdom": { entry: "£28k–42k/yr",      mid: "£46k–68k/yr",       senior: "£72k–112k/yr" },
      "Canada":         { entry: "CAD 48k–70k/yr",   mid: "CAD 76k–108k/yr",   senior: "CAD 118k–172k/yr" },
      "Germany":        { entry: "€38k–54k/yr",      mid: "€56k–80k/yr",       senior: "€84k–125k/yr" },
      "United States":  { entry: "$66k–92k/yr",      mid: "$96k–138k/yr",      senior: "$142k–215k/yr" },
    },
    resources: [
      { name: "Google UX Design Certificate (Coursera)", url: "#", type: "Paid" },
      { name: "Figma YouTube Channel (Official)", url: "#", type: "Free" },
      { name: "Nielsen Norman Group Articles", url: "#", type: "Free" },
      { name: "Interaction Design Foundation", url: "#", type: "Paid" },
      { name: "Dribbble Learning Resources", url: "#", type: "Free" },
    ],
  },
  "Software Engineer": {
    description: "Software Engineers design, develop, and maintain software systems applying rigorous engineering principles. They build reliable, scalable, and maintainable software across domains — web, mobile, systems, or embedded.",
    icon: "💻",
    primarySkills: ["Python", "Java", "C++", "Git", "SQL", "Data Structures", "Algorithms"],
    missingSkills: ["System Design", "Cloud Platforms", "Microservices", "CI/CD", "Testing (TDD)"],
    certifications: ["AWS Developer Associate", "Oracle Java Certification", "Google Associate Cloud Engineer", "Microsoft Azure Developer", "Agile/Scrum Master"],
    tools: ["VS Code", "IntelliJ IDEA", "Git", "Docker", "Postman", "JIRA", "Linux Terminal", "GitHub"],
    companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple", "IBM", "Oracle", "SAP"],
    demand: "Very High",
    growth: 82,
    workEnv: ["Remote", "Hybrid", "On-site"],
    softSkills: ["Problem Solving", "Communication", "Teamwork", "Time Management", "Continuous Learning"],
    responsibilities: [
      "Write clean, efficient, maintainable code",
      "Design software architecture and components",
      "Participate in code reviews and mentoring",
      "Debug and resolve production issues",
      "Write unit tests and ensure code quality",
      "Collaborate with cross-functional teams"
    ],
    similarCareers: ["Full Stack Developer", "Backend Developer", "DevOps Engineer", "ML Engineer", "Mobile Developer"],
    roadmap: [
      { skill: "Data Structures & Algorithms", done: true, weeks: 0 },
      { skill: "Object-Oriented Programming", done: false, weeks: 3 },
      { skill: "System Design Fundamentals", done: false, weeks: 6 },
      { skill: "Design Patterns", done: false, weeks: 3 },
      { skill: "Cloud Fundamentals", done: false, weeks: 3 },
      { skill: "Testing & TDD", done: false, weeks: 2 },
      { skill: "CI/CD & DevOps Basics", done: false, weeks: 2 },
    ],
    growthPath: ["Software Intern", "Junior Software Engineer", "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer", "Engineering Manager"],
    futureScope: "Software Engineering remains the backbone of tech. AI, IoT, blockchain, and quantum computing will create entirely new software domains. Engineers who can adapt across domains will thrive.",
    projects: ["Open Source Contribution", "DSA Problem Solver CLI", "Microservices App", "System Design Document", "LeetCode Portfolio (100+ problems)"],
    salary: {
      "Pakistan":       { entry: "PKR 70k–122k/mo",  mid: "PKR 152k–262k/mo",  senior: "PKR 322k–582k/mo" },
      "UAE":            { entry: "AED 7k–12k/mo",    mid: "AED 14k–24k/mo",    senior: "AED 28k–50k/mo" },
      "Saudi Arabia":   { entry: "SAR 7k–13k/mo",    mid: "SAR 16k–28k/mo",    senior: "SAR 32k–60k/mo" },
      "United Kingdom": { entry: "£32k–50k/yr",      mid: "£56k–80k/yr",       senior: "£85k–135k/yr" },
      "Canada":         { entry: "CAD 62k–85k/yr",   mid: "CAD 92k–132k/yr",   senior: "CAD 142k–205k/yr" },
      "Germany":        { entry: "€45k–62k/yr",      mid: "€66k–92k/yr",       senior: "€98k–148k/yr" },
      "United States":  { entry: "$86k–118k/yr",     mid: "$122k–168k/yr",     senior: "$172k–265k/yr" },
    },
    resources: [
      { name: "LeetCode (DSA Practice)", url: "#", type: "Free/Paid" },
      { name: "System Design Primer (GitHub)", url: "#", type: "Free" },
      { name: "Clean Code - Robert C. Martin", url: "#", type: "Book" },
      { name: "Grokking System Design (Educative)", url: "#", type: "Paid" },
      { name: "MIT OpenCourseWare CS", url: "#", type: "Free" },
    ],
  },
};

// Default for careers not in DB
const DEFAULT_DB = (career) => ({
  description: `${career} is a growing tech role with strong demand. Professionals combine technical expertise with domain knowledge to solve real-world problems at scale.`,
  icon: "🚀",
  primarySkills: ["Problem Solving", "Communication", "Technical Skills", "Teamwork", "Continuous Learning"],
  missingSkills: ["Domain Expertise", "Cloud Skills", "Leadership", "Project Management"],
  certifications: ["Google Career Certificate", "AWS Cloud Practitioner", "Coursera Professional Certificate", "LinkedIn Learning Path"],
  tools: ["VS Code", "Git", "GitHub", "Linux", "Docker", "Postman"],
  companies: ["Google", "Microsoft", "Amazon", "IBM", "Accenture", "Deloitte", "TCS", "Infosys"],
  demand: "High", growth: 70,
  workEnv: ["Remote", "Hybrid"],
  softSkills: ["Communication", "Problem Solving", "Teamwork", "Adaptability", "Time Management"],
  responsibilities: ["Complete project tasks efficiently", "Collaborate with team", "Continuously upskill", "Contribute to goals", "Document work"],
  similarCareers: ["Software Engineer", "Data Analyst", "Project Manager", "Business Analyst"],
  roadmap: [
    { skill: "Domain Fundamentals", done: true, weeks: 0 },
    { skill: "Core Technical Skills", done: false, weeks: 4 },
    { skill: "Industry Tools", done: false, weeks: 3 },
    { skill: "Certifications", done: false, weeks: 4 },
    { skill: "Portfolio Projects", done: false, weeks: 6 },
  ],
  growthPath: ["Intern", "Junior", "Mid-level", "Senior", "Lead", "Manager", "Director"],
  futureScope: "Strong growth potential as technology transforms every industry. Professionals who continuously upskill will find excellent global opportunities.",
  projects: ["Portfolio Project", "Open Source Contribution", "Domain Application", "Technical Blog", "Capstone Project"],
  salary: {
    "Pakistan":       { entry: "PKR 60k–100k/mo",  mid: "PKR 120k–200k/mo",  senior: "PKR 250k–450k/mo" },
    "UAE":            { entry: "AED 6k–10k/mo",    mid: "AED 12k–20k/mo",    senior: "AED 22k–38k/mo" },
    "United States":  { entry: "$70k–100k/yr",     mid: "$110k–150k/yr",     senior: "$155k–230k/yr" },
  },
  resources: [
    { name: "Coursera Professional Certificates", url: "#", type: "Paid" },
    { name: "freeCodeCamp (Free)", url: "#", type: "Free" },
    { name: "YouTube Tutorials", url: "#", type: "Free" },
  ],
});

const getDB = (career) => CAREER_DB[career] || DEFAULT_DB(career);

// ================================================================
// HELPER CONSTANTS
// ================================================================
const MODEL_COLORS = { 'Random Forest': '#6366f1', 'Decision Tree': '#f59e0b', 'SVM': '#ec4899', 'Logistic Regression': '#10b981' };
const RANK_COLORS  = ['#6366f1', '#f59e0b', '#10b981'];
const RANK_LABELS  = ['🥇 Best Match', '🥈 2nd Match', '🥉 3rd Match'];
const METRIC_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];
const DEMAND_CFG = {
  'Very High': { color: '#10b981', bg: '#d1fae5', bar: 95 },
  'High':      { color: '#6366f1', bg: '#e0e7ff', bar: 75 },
  'Medium':    { color: '#f59e0b', bg: '#fef3c7', bar: 50 },
  'Low':       { color: '#ef4444', bg: '#fee2e2', bar: 25 },
};
const COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "United Kingdom", "Canada", "Germany", "United States"];

// ================================================================
// LOADING SCREEN
// ================================================================
const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.5rem'
    }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      style={{
        width: 64, height: 64, borderRadius: '50%',
        border: '4px solid rgba(255,255,255,0.2)',
        borderTopColor: '#818cf8',
      }}
    />
    <div style={{ color: '#c7d2fe', fontSize: '1.2rem', fontWeight: '600' }}>
      Analyzing your profile with AI...
    </div>
    <div style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>
      Running 4 ML classifiers simultaneously
    </div>
    {['Encoding features...', 'Training prediction models...', 'Computing top careers...', 'Generating insights...'].map((t, i) => (
      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.5 }}
        style={{ color: '#818cf8', fontSize: '0.82rem', fontFamily: 'monospace' }}>
        ✓ {t}
      </motion.div>
    ))}
  </motion.div>
);

// ================================================================
// DARK MODE TOGGLE
// ================================================================
const DarkModeToggle = ({ dark, toggle }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={toggle}
    style={{
      position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000,
      background: dark ? '#312e81' : '#eef2ff',
      border: `2px solid ${dark ? '#6366f1' : '#c7d2fe'}`,
      borderRadius: '50%', width: 44, height: 44,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}
  >
    {dark ? '☀️' : '🌙'}
  </motion.button>
);

// ================================================================
// CIRCULAR PROGRESS
// ================================================================
const CircularProgress = ({ value, size = 110, color = '#6366f1', label = '' }) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle"
          fontSize="16" fontWeight="800" fill={color}>{value}%</text>
      </svg>
      {label && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px', fontWeight: '600' }}>{label}</div>}
    </div>
  );
};

// ================================================================
// MODEL CARD
// ================================================================
const ModelCard = ({ modelName, prediction, metricsData, isSelected, dark }) => {
  const color = MODEL_COLORS[modelName] || '#6366f1';
  const m     = metricsData || {};
  const conf  = Math.round((prediction?.confidence || 0) * 100);
  const barData = [
    { name: 'Accuracy',  value: Math.round((m.accuracy  || 0) * 10000) / 100 },
    { name: 'Precision', value: Math.round((m.precision || 0) * 10000) / 100 },
    { name: 'Recall',    value: Math.round((m.recall    || 0) * 10000) / 100 },
    { name: 'F1',        value: Math.round((m.f1        || 0) * 10000) / 100 },
  ];
  const pieData = [{ value: conf }, { value: 100 - conf }];
  const cardBg  = dark ? '#1e1b4b' : (isSelected ? 'rgba(99,102,241,0.04)' : '#fff');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: cardBg, border: `2px solid ${isSelected ? color : (dark ? '#312e81' : '#e2e8f0')}`,
        borderRadius: '16px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {isSelected && <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px',
            borderRadius: '6px', background: color, color: '#fff', display: 'inline-block', marginBottom: '4px' }}>✓ PRIMARY</span>}
          <div style={{ fontWeight: '700', color }}>{modelName}</div>
          <div style={{ fontSize: '0.75rem', color: dark ? '#a5b4fc' : '#64748b', marginTop: '2px' }}>
            Predicts: <b style={{ color: dark ? '#e0e7ff' : '#1e293b' }}>
              {prediction?.top3?.[0]?.career || prediction?.best_career || '—'}
            </b>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 66, height: 66 }}>
            <ResponsiveContainer><PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={19} outerRadius={29}
                dataKey="value" startAngle={90} endAngle={-270}>
                <Cell fill={color} /><Cell fill={dark ? '#312e81' : '#f1f5f9'} />
              </Pie>
            </PieChart></ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '-4px' }}>Confidence</div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color }}>{conf}%</div>
        </div>
      </div>
      {prediction?.top3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {prediction.top3.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px',
              borderRadius: '6px', background: i === 0 ? `${color}15` : (dark ? '#312e81' : '#f8fafc'), fontSize: '0.75rem' }}>
              <span style={{ color: i === 0 ? color : (dark ? '#a5b4fc' : '#475569'), fontWeight: i === 0 ? '600' : '400' }}>
                {i+1}. {t.career}
              </span>
              <span style={{ color: i === 0 ? color : '#94a3b8', fontWeight: '600' }}>{t.confidence_pct}%</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 115 }}>
        <ResponsiveContainer><BarChart data={barData} barSize={16} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#312e81' : '#f1f5f9'} />
          <XAxis dataKey="name" tick={{ fontSize: 8, fill: dark ? '#a5b4fc' : '#64748b' }} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 8, fill: dark ? '#a5b4fc' : '#64748b' }} />
          <Tooltip formatter={v => [`${v}%`]} contentStyle={{ background: dark ? '#1e1b4b' : '#fff' }} />
          <Bar dataKey="value" radius={[3,3,0,0]}>{barData.map((_, i) => <Cell key={i} fill={METRIC_COLORS[i]} />)}</Bar>
        </BarChart></ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// ================================================================
// MAIN RESULT PAGE
// ================================================================
const ResultPage = () => {
  const { state } = useLocation();
  const [dark, setDark]                     = useState(true);
  const [comparison, setComparison]         = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Pakistan');
  const [showLoading, setShowLoading]       = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getComparison().then(r => setComparison(r?.data || r)).catch(console.error);
  }, []);

  // Dark mode body
  useEffect(() => {
    document.body.style.background = dark ? '#0f0e1a' : '';
    document.body.style.color = dark ? '#e0e7ff' : '';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, [dark]);

  if (!state?.result) {
    return (
      <div style={{
        textAlign: 'center', padding: '5rem', minHeight: '100vh',
        background: dark ? '#0f0e1a' : '#f8faff', color: dark ? '#e0e7ff' : '#1e293b'
      }}>
        <DarkModeToggle dark={dark} toggle={() => setDark(!dark)} />
        <h2 style={{ color: dark ? '#e0e7ff' : undefined }}>No Result Found</h2>
        <Link to="/assessment" className="btn btn-primary">Go to Assessment</Link>
      </div>
    );
  }

  const { result, input } = state;
  const top3           = result?.top3 || [];
  const top5           = result?.top5 || top3;
  const metrics        = result?.metrics || {};
  const id             = result?.id;
  const modelUsed      = result?.model_used || 'Random Forest';
  const allPredictions = result?.all_predictions || {};
  const career         = result?.career || top3[0]?.career || 'Unknown';
  const aiExplanation  = result?.ai_explanation || `Based on your skills and interests, ${career} is your best career match.`;

  const db          = getDB(career);
  const confidPct   = Math.round((metrics?.confidence || 0) * 100);
  const demand      = db.demand || 'High';
  const demandCfg   = DEMAND_CFG[demand] || DEMAND_CFG['High'];

  // Fit score
  const fitScore = Math.min(Math.round(
    ((parseFloat(input?.cgpa) || 0) / 4) * 60 + (input?.experience === 'Yes' ? 40 : 0)
  ), 100);

  const radarData = [
    { subject: 'Skill Match',    A: Math.min(70 + confidPct * 0.25, 98), fullMark: 100 },
    { subject: 'Interest Fit',   A: Math.min(75 + confidPct * 0.20, 98), fullMark: 100 },
    { subject: 'Academic Score', A: Math.round((parseFloat(input?.cgpa || 0) / 4) * 100), fullMark: 100 },
    { subject: 'Experience',     A: input?.experience === 'Yes' ? 82 : 18, fullMark: 100 },
    { subject: 'Career Fit',     A: fitScore, fullMark: 100 },
  ];

  // Top 5 bar chart data
  const top5ChartData = top5.map(c => ({
    name:  c.career.length > 18 ? c.career.slice(0, 16) + '..' : c.career,
    value: c.confidence_pct,
    full:  c.career,
  }));

  // Styles
  const bg       = dark ? '#0f0e1a' : '#f8faff';
  const cardBg   = dark ? '#13112b' : '#ffffff';
  const border   = dark ? '#312e81' : '#e8edf5';
  const textPri  = dark ? '#e0e7ff' : '#1e293b';
  const textSec  = dark ? '#a5b4fc' : '#64748b';
  const inputBg  = dark ? '#1e1b4b' : '#f8fafc';

  const card = (children, extra = {}) => (
    <div style={{
      background: cardBg, border: `1px solid ${border}`,
      borderRadius: '20px', padding: '1.5rem',
      marginBottom: '1.5rem', boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
      ...extra
    }}>
      {children}
    </div>
  );

  const sectionTitle = (text, sub = '') => (
    <div style={{ marginBottom: '1.2rem' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: textPri }}>{text}</h3>
      {sub && <p style={{ color: textSec, fontSize: '0.78rem', margin: '3px 0 0' }}>{sub}</p>}
    </div>
  );

  const chip = (text, color, bg_) => (
    <span key={text} style={{
      padding: '5px 12px', borderRadius: '20px', background: bg_,
      color, fontSize: '0.78rem', fontWeight: '600', border: `1px solid ${color}30`
    }}>{text}</span>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s' }}>
      <AnimatePresence>{showLoading && <LoadingScreen />}</AnimatePresence>
      <DarkModeToggle dark={dark} toggle={() => setDark(!dark)} />

      <AnimatePresence>
        {!showLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}
          >

            {/* ── TOP 3 CAREER CARDS ────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '0.4rem', fontSize: '1.6rem', color: textPri }}>
                Your Top <span className="gradient-text">3 Career Matches</span>
              </h2>
              <p style={{ textAlign: 'center', color: textSec, marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                Based on your skill in <b style={{ color: '#6366f1' }}>{input?.skills}</b> and interest in <b style={{ color: '#ec4899' }}>{input?.interests}</b>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {top3.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }} whileHover={{ y: -4 }}
                    style={{
                      background: dark ? '#13112b' : '#fff',
                      border: `2px solid ${i === 0 ? RANK_COLORS[i] : border}`,
                      borderRadius: '18px', padding: '1.4rem',
                      boxShadow: i === 0 ? `0 8px 32px ${RANK_COLORS[i]}30` : '0 2px 12px rgba(0,0,0,0.05)',
                      transform: i === 0 ? 'translateY(-4px)' : 'none',
                    }}>
                    <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: '700',
                      padding: '3px 10px', borderRadius: '8px', marginBottom: '8px',
                      background: `${RANK_COLORS[i]}18`, color: RANK_COLORS[i] }}>{RANK_LABELS[i]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getDB(c.career).icon}</span>
                      <div style={{ fontSize: i === 0 ? '1.3rem' : '1.1rem', fontWeight: '800', color: RANK_COLORS[i] }}>
                        {c.career}
                      </div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span style={{ color: textSec }}>Confidence</span>
                        <span style={{ fontWeight: '700', color: RANK_COLORS[i] }}>{c.confidence_pct}%</span>
                      </div>
                      <div style={{ height: '7px', background: dark ? '#312e81' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.confidence_pct}%` }}
                          transition={{ duration: 1.2, delay: i * 0.2 }}
                          style={{ height: '100%', borderRadius: '4px',
                            background: `linear-gradient(90deg, ${RANK_COLORS[i]}, ${RANK_COLORS[i]}bb)` }} />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: textSec, lineHeight: '1.55', marginBottom: '10px' }}>
                      💡 {c.reason || 'Your profile aligns well with this career.'}
                    </p>
                    {c.suggested_skills?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: '600', color: textSec, marginBottom: '5px' }}>SKILLS TO LEARN</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {c.suggested_skills.slice(0, 4).map(sk => (
                            <span key={sk} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px',
                              background: `${RANK_COLORS[i]}12`, color: RANK_COLORS[i],
                              border: `1px solid ${RANK_COLORS[i]}30`, fontWeight: '500' }}>{sk}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── AI EXPLANATION ────────────────────────── */}
            {card(
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>🧠</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#6366f1', margin: '0 0 8px' }}>
                      AI Explanation — Why {career}?
                    </h3>
                    <p style={{ color: textSec, lineHeight: '1.7', fontSize: '0.9rem', margin: 0 }}>
                      {aiExplanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TOP 5 PROBABILITY CHART ───────────────── */}
            {card(
              <>
                {sectionTitle('📊 Top 5 Career Probability Chart', 'Probability distribution from the Random Forest model')}
                <div style={{ height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={top5ChartData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={dark ? '#312e81' : '#f1f5f9'} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: textSec }} />
                      <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 11, fill: textPri }} />
                      <Tooltip formatter={(v, _, p) => [`${v}%`, p.payload.full]}
                        contentStyle={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0,6,6,0]} label={{ position: 'right', fill: textSec, fontSize: 11, formatter: v => `${v}%` }}>
                        {top5ChartData.map((_, i) => (
                          <Cell key={i} fill={['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6'][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* ── SCORES + RADAR ────────────────────────── */}
            {card(
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: textPri, marginBottom: '1.2rem', fontSize: '1.05rem' }}>Profile Analysis</h3>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <CircularProgress value={confidPct} color="#6366f1" label="Confidence" />
                    <CircularProgress value={fitScore}  color="#ec4899" label="Fit Score" />
                    <CircularProgress value={Math.min(Math.round((parseFloat(input?.cgpa||0)/4)*100), 100)} color="#10b981" label="CGPA Score" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { label: 'Accuracy',  val: metrics?.accuracy,  desc: 'Overall correct predictions on test set' },
                      { label: 'Precision', val: metrics?.precision, desc: 'Correct out of all predicted positives' },
                      { label: 'Recall',    val: metrics?.recall,    desc: 'Correct out of all actual positives' },
                      { label: 'F1 Score',  val: metrics?.f1,        desc: 'Harmonic mean of Precision & Recall' },
                    ].map(({ label, val, desc }) => (
                      <div key={label} style={{ textAlign: 'center', padding: '8px', background: inputBg, borderRadius: '10px', border: `1px solid ${border}` }}>
                        <div style={{ fontSize: '0.68rem', color: textSec }}>{label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: textPri }}>
                          {val != null ? `${Math.round(val * 10000) / 100}%` : '—'}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: textSec, lineHeight: '1.3' }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height: 280 }}>
                  <p style={{ textAlign: 'center', fontSize: '0.82rem', color: textSec, marginBottom: '4px' }}>Profile Analysis Radar</p>
                  <ResponsiveContainer width="100%" height="92%">
                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                      <PolarGrid stroke={dark ? '#312e81' : '#e2e8f0'} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: textSec }} />
                      <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize: 8, fill: textSec }} />
                      <Radar name="Profile" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                      <Tooltip formatter={v => [`${v}`, 'Score']}
                        contentStyle={{ background: cardBg, border: `1px solid ${border}` }} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── PRIMARY SKILLS + SKILLS TO LEARN ─────── */}
            {card(
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  {sectionTitle(`🎯 Required Skills for ${career}`)}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {db.primarySkills.map((s, i) => {
                      const cs = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6','#06b6d4','#ef4444'];
                      const bs = ['#eef2ff','#fdf2f8','#fffbeb','#ecfdf5','#f5f3ff','#ecfeff','#fef2f2'];
                      return chip(s, cs[i%cs.length], bs[i%bs.length]);
                    })}
                  </div>
                </div>
                <div>
                  {sectionTitle('⚠️ Skills Gap — Learn These Next')}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {db.missingSkills.map(s => chip(s, '#ef4444', dark ? '#4c0519' : '#fef2f2'))}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: textSec, marginTop: '10px', lineHeight: '1.5' }}>
                    Mastering these will significantly increase your interview success rate and salary prospects.
                  </p>
                </div>
              </div>
            )}

            {/* ── CERTIFICATIONS + RESOURCES ────────────── */}
            {card(
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  {sectionTitle('🏆 Recommended Certifications')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {db.certifications.map((cert, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', background: inputBg, borderRadius: '10px',
                        border: `1px solid ${border}`, fontSize: '0.83rem', color: textPri }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#eef2ff',
                          color: '#6366f1', fontWeight: '700', fontSize: '0.7rem', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i+1}</span>
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {sectionTitle('📚 Learning Resources')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(db.resources || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: inputBg, borderRadius: '10px',
                        border: `1px solid ${border}` }}>
                        <span style={{ fontSize: '0.82rem', color: textPri, fontWeight: '500' }}>{r.name}</span>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px',
                          background: r.type === 'Free' ? '#ecfdf5' : r.type === 'Paid' ? '#fef2f2' : '#f5f3ff',
                          color: r.type === 'Free' ? '#10b981' : r.type === 'Paid' ? '#ef4444' : '#8b5cf6',
                          fontWeight: '700', whiteSpace: 'nowrap' }}>{r.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SALARY INSIGHTS ───────────────────────── */}
            {card(
              <>
                {sectionTitle('💰 Salary Insights by Country')}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                  {COUNTRIES.filter(c => db.salary?.[c]).map(country => (
                    <button key={country} onClick={() => setSelectedCountry(country)}
                      style={{ padding: '5px 14px', borderRadius: '20px',
                        border: `1.5px solid ${selectedCountry === country ? '#6366f1' : border}`,
                        background: selectedCountry === country ? '#eef2ff' : inputBg,
                        color: selectedCountry === country ? '#6366f1' : textSec,
                        fontWeight: selectedCountry === country ? '700' : '400',
                        fontSize: '0.78rem', cursor: 'pointer' }}>
                      {country}
                    </button>
                  ))}
                </div>
                {db.salary?.[selectedCountry] && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                      { level: '🟢 Entry Level',  val: db.salary[selectedCountry].entry,  color: '#10b981', bg: dark ? '#052e16' : '#ecfdf5' },
                      { level: '🔵 Mid Level',    val: db.salary[selectedCountry].mid,    color: '#6366f1', bg: dark ? '#1e1b4b' : '#eef2ff' },
                      { level: '🟡 Senior Level', val: db.salary[selectedCountry].senior, color: '#f59e0b', bg: dark ? '#451a03' : '#fffbeb' },
                    ].map(({ level, val, color, bg: cbg }) => (
                      <motion.div key={level} whileHover={{ scale: 1.03 }}
                        style={{ textAlign: 'center', padding: '1.2rem', background: cbg,
                          borderRadius: '14px', border: `2px solid ${color}30` }}>
                        <div style={{ fontSize: '0.72rem', color: textSec, fontWeight: '600', marginBottom: '6px' }}>{level}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color }}>{val}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── DEMAND + COMPANIES ────────────────────── */}
            {card(
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  {sectionTitle('📈 Market Demand & Growth')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ padding: '6px 18px', borderRadius: '20px',
                      background: demandCfg.bg, color: demandCfg.color,
                      fontWeight: '800', fontSize: '1rem', border: `2px solid ${demandCfg.color}30` }}>
                      {demand}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: textSec }}>Market Demand</span>
                  </div>
                  <div style={{ height: '10px', background: dark ? '#312e81' : '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${demandCfg.bar}%` }}
                      transition={{ duration: 1.5 }}
                      style={{ height: '100%', borderRadius: '5px',
                        background: `linear-gradient(90deg, ${demandCfg.color}, ${demandCfg.color}88)` }} />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ color: textSec }}>Growth Rate</span>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{db.growth}%</span>
                    </div>
                    <div style={{ height: '8px', background: dark ? '#312e81' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${db.growth}%` }}
                        transition={{ duration: 1.5 }}
                        style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: textSec, lineHeight: '1.5' }}>
                    {db.futureScope?.slice(0, 150)}...
                  </p>
                </div>
                <div>
                  {sectionTitle('🏢 Top Hiring Companies')}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(db.companies || []).map((c, i) => {
                      const cs = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6','#06b6d4','#ef4444','#f97316'];
                      return chip(c, cs[i%cs.length], `${cs[i%cs.length]}15`);
                    })}
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '600', color: textSec, marginBottom: '6px' }}>WORK ENVIRONMENT</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(db.workEnv || ['Remote','Hybrid']).map(env => {
                        const cfg = { 'Remote': ['#10b981','#ecfdf5'], 'Hybrid': ['#6366f1','#eef2ff'], 'On-site': ['#f59e0b','#fffbeb'] };
                        const [c, b] = cfg[env] || ['#64748b','#f1f5f9'];
                        return <span key={env} style={{ padding: '5px 14px', borderRadius: '20px',
                          background: dark ? `${c}20` : b, color: c, fontWeight: '700', fontSize: '0.8rem',
                          border: `1.5px solid ${c}40` }}>🏠 {env}</span>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PERSONALIZED ROADMAP ──────────────────── */}
            {card(
              <>
                {sectionTitle('🗺️ Personalized Learning Roadmap',
                  `~${db.roadmap?.filter(r => !r.done).reduce((a,b) => a + b.weeks, 0)} weeks to career-ready`)}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(db.roadmap || []).map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: step.done ? '#ecfdf5' : inputBg,
                        border: `2px solid ${step.done ? '#10b981' : border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: '700',
                        color: step.done ? '#10b981' : textSec }}>
                        {step.done ? '✓' : i+1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: '600',
                            color: step.done ? '#10b981' : textPri }}>{step.skill}</span>
                          <span style={{ fontSize: '0.72rem', color: textSec, fontStyle: 'italic' }}>
                            {step.done ? '✅ Done' : `~${step.weeks} weeks`}
                          </span>
                        </div>
                        <div style={{ height: '4px', background: dark ? '#312e81' : '#f1f5f9', borderRadius: '2px', marginTop: '5px' }}>
                          <div style={{ height: '100%', borderRadius: '2px',
                            width: step.done ? '100%' : `${Math.min((i / (db.roadmap.length||1)) * 35, 30)}%`,
                            background: step.done ? '#10b981' : 'linear-gradient(90deg, #6366f1, #ec4899)' }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* ── CAREER GROWTH PATH ────────────────────── */}
            {card(
              <>
                {sectionTitle('📈 Career Growth Path')}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  {(db.growthPath || []).map((step, i) => (
                    <React.Fragment key={i}>
                      <motion.div whileHover={{ scale: 1.05 }}
                        style={{ textAlign: 'center', padding: '10px 14px',
                          background: i === 0 ? '#eef2ff' : inputBg,
                          borderRadius: '10px', border: `1.5px solid ${i === 0 ? '#6366f1' : border}`,
                          minWidth: '100px' }}>
                        <div style={{ fontSize: '0.62rem', color: textSec, marginBottom: '3px' }}>Step {i+1}</div>
                        <div style={{ fontSize: '0.76rem', fontWeight: '600',
                          color: i === 0 ? '#6366f1' : textPri }}>{step}</div>
                      </motion.div>
                      {i < (db.growthPath?.length||0)-1 && (
                        <span style={{ color: '#94a3b8', fontSize: '1.1rem', padding: '0 2px' }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}

            {/* ── FUTURE SCOPE ──────────────────────────── */}
            {card(
              <>
                {sectionTitle('🔭 Future Scope & Industry Outlook')}
                <div style={{ padding: '16px', borderRadius: '12px',
                  background: dark ? '#1e1b4b' : 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(236,72,153,0.06))',
                  border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ color: textSec, lineHeight: '1.8', fontSize: '0.92rem', margin: 0 }}>
                    {db.futureScope}
                  </p>
                </div>
              </>
            )}

            {/* ── PORTFOLIO PROJECTS ────────────────────── */}
            {card(
              <>
                {sectionTitle('🚀 Recommended Portfolio Projects')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                  {(db.projects || []).map((p, i) => {
                    const cs = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6'];
                    return (
                      <motion.div key={i} whileHover={{ scale: 1.03 }}
                        style={{ padding: '14px', background: `${cs[i%cs.length]}10`,
                          borderRadius: '12px', border: `1.5px solid ${cs[i%cs.length]}25` }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: cs[i%cs.length], marginBottom: '4px' }}>
                          Project {i+1}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: textPri, fontWeight: '600' }}>{p}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── SIMILAR CAREERS ───────────────────────── */}
            {card(
              <>
                {sectionTitle('🔀 Similar Careers to Explore')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {(db.similarCareers || []).map((c, i) => {
                    const cs = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6'];
                    return (
                      <motion.span key={i} whileHover={{ scale: 1.05 }}
                        style={{ padding: '8px 18px', borderRadius: '20px',
                          background: `${cs[i%cs.length]}12`, color: cs[i%cs.length],
                          fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                          border: `1.5px solid ${cs[i%cs.length]}30` }}>
                        → {c}
                      </motion.span>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── RESPONSIBILITIES ──────────────────────── */}
            {card(
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  {sectionTitle('📋 Day-to-Day Responsibilities')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(db.responsibilities || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 12px',
                        background: inputBg, borderRadius: '8px', fontSize: '0.83rem', color: textSec,
                        border: `1px solid ${border}` }}>
                        <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>→</span> {r}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {sectionTitle('🤝 Required Soft Skills')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(db.softSkills || []).map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', background: dark ? '#1e1b4b' : '#f5f3ff',
                        borderRadius: '10px', border: `1px solid ${dark ? '#312e81' : '#ddd6fe'}`,
                        fontSize: '0.83rem', color: dark ? '#c4b5fd' : '#4c1d95', fontWeight: '500' }}>
                        <span style={{ color: '#8b5cf6' }}>★</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CAREER DESCRIPTION ────────────────────── */}
            {card(
              <>
                {sectionTitle(`📖 About ${career}`)}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>{db.icon}</span>
                  <p style={{ color: textSec, lineHeight: '1.8', fontSize: '0.92rem', margin: 0 }}>
                    {db.description}
                  </p>
                </div>
              </>
            )}

            {/* ── BUTTONS ───────────────────────────────── */}
            {card(
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a whileHover={{ scale: 1.04 }} href={getPdfUrl(id)} target="_blank" rel="noreferrer"
                  className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  📄 Download PDF Report
                </motion.a>
                {comparison && Object.keys(allPredictions).length > 0 && (
                  <motion.button whileHover={{ scale: 1.04 }} onClick={() => setShowComparison(!showComparison)}
                    className="btn btn-secondary">
                    📊 {showComparison ? 'Hide' : 'View'} All Model Comparisons
                  </motion.button>
                )}
                <Link to="/history" className="btn btn-secondary">🕐 History</Link>
                <Link to="/assessment" className="btn btn-secondary">🔄 New Assessment</Link>
              </div>
            )}

            {/* ── MODEL COMPARISON ──────────────────────── */}
            <AnimatePresence>
              {showComparison && comparison && (
                <motion.div key="cmp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px',
                    padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '0.4rem', color: textPri }}>
                    📊 All 4 Models — Individual Performance
                  </h3>
                  <p style={{ textAlign: 'center', color: textSec, fontSize: '0.82rem', marginBottom: '1.2rem' }}>
                    Each model predicts independently — bar charts show training performance on test data
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {Object.entries(allPredictions).map(([name, pred]) => (
                      <ModelCard key={name} modelName={name} prediction={pred}
                        metricsData={comparison[name]} isSelected={name === modelUsed} dark={dark} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultPage;