export interface ProjectTemplate {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string[];
  desc: string;
  careerImpact: string;
  resumeValue: number;
  features: string[];
}

export interface CareerPath {
  id: string;
  title: string;
  skills: string[];
  projects: ProjectTemplate[];
}

export const CAREER_PATHS: Record<string, CareerPath> = {
  'frontend': {
    id: 'frontend',
    title: 'Frontend Developer',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Redux', 'Zustand', 'Framer Motion'],
    projects: [
      {
        title: 'Portfolio Website',
        difficulty: 'Beginner',
        focus: ['HTML', 'CSS', 'JavaScript', 'React'],
        desc: 'A personal portfolio website to showcase your skills and projects.',
        careerImpact: 'Essential for any frontend developer to demonstrate their capabilities.',
        resumeValue: 50,
        features: ['Responsive design', 'CSS animations', 'Contact form']
      },
      {
        title: 'Weather Dashboard',
        difficulty: 'Beginner',
        focus: ['React', 'APIs', 'JavaScript'],
        desc: 'A weather dashboard that fetches data from a public API.',
        careerImpact: 'Proves you can integrate with third-party REST APIs and handle async data.',
        resumeValue: 60,
        features: ['API Integration', 'State Management', 'Dynamic UI updates']
      },
      {
        title: 'Kanban Task Manager',
        difficulty: 'Intermediate',
        focus: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand'],
        desc: 'A Kanban board for task management with drag-and-drop functionality.',
        careerImpact: 'Demonstrates ability to build complex interactive UIs and manage state.',
        resumeValue: 75,
        features: ['Drag and drop', 'Complex state management', 'Local storage persistence']
      },
      {
        title: 'E-Commerce Website',
        difficulty: 'Advanced',
        focus: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
        desc: 'A full frontend clone of an e-commerce platform with a shopping cart.',
        careerImpact: 'Shows you can build production-ready, scalable frontend applications.',
        resumeValue: 85,
        features: ['Shopping cart state', 'Product filtering', 'Simulated checkout']
      },
      {
        title: 'Chat Application',
        difficulty: 'Advanced',
        focus: ['Next.js', 'React', 'WebSockets', 'Tailwind CSS'],
        desc: 'A real-time chat application frontend interface.',
        careerImpact: 'Proves capability with real-time data rendering and complex layouts.',
        resumeValue: 90,
        features: ['Real-time updates', 'Message history', 'User presence UI']
      }
    ]
  },
  'backend': {
    id: 'backend',
    title: 'Backend Developer',
    skills: ['Node.js', 'Express', 'Python', 'Django', 'PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL', 'Docker', 'Redis'],
    projects: [
      {
        title: 'URL Shortener',
        difficulty: 'Beginner',
        focus: ['Node.js', 'Express', 'MongoDB'],
        desc: 'A simple API that takes a long URL and returns a short alias.',
        careerImpact: 'Basic understanding of routing, database operations, and API design.',
        resumeValue: 60,
        features: ['URL redirection', 'Database integration', 'Basic analytics']
      },
      {
        title: 'REST API',
        difficulty: 'Beginner',
        focus: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs'],
        desc: 'A fully functional CRUD API for managing a resource (e.g., books, users).',
        careerImpact: 'Fundamental requirement for backend developers.',
        resumeValue: 65,
        features: ['CRUD operations', 'Input validation', 'Error handling']
      },
      {
        title: 'Authentication System',
        difficulty: 'Intermediate',
        focus: ['Node.js', 'Express', 'JWT', 'PostgreSQL'],
        desc: 'A robust authentication API supporting JWT, password hashing, and email verification.',
        careerImpact: 'Critical skill for building secure applications.',
        resumeValue: 80,
        features: ['JWT Auth', 'Password hashing (bcrypt)', 'Middleware protection']
      },
      {
        title: 'Inventory Management System',
        difficulty: 'Intermediate',
        focus: ['Node.js', 'SQL', 'Docker', 'REST APIs'],
        desc: 'A complex backend system handling inventory transactions and concurrency.',
        careerImpact: 'Shows understanding of complex SQL queries and transaction management.',
        resumeValue: 85,
        features: ['Database transactions', 'Complex querying', 'Dockerized deployment']
      },
      {
        title: 'Banking API',
        difficulty: 'Advanced',
        focus: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis'],
        desc: 'A highly secure and concurrent banking API handling money transfers.',
        careerImpact: 'Demonstrates enterprise-level backend skills and concurrency control.',
        resumeValue: 95,
        features: ['ACID transactions', 'Rate limiting', 'Caching with Redis']
      }
    ]
  },
  'fullstack': {
    id: 'fullstack',
    title: 'Full Stack Developer',
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker'],
    projects: [
      {
        title: 'Social Media Application',
        difficulty: 'Beginner',
        focus: ['React', 'Node.js', 'PostgreSQL'],
        desc: 'A basic social media app with posts and comments.',
        careerImpact: 'Shows basic end-to-end integration skills.',
        resumeValue: 65,
        features: ['User auth', 'CRUD posts', 'Relational database']
      },
      {
        title: 'Project Management Platform',
        difficulty: 'Intermediate',
        focus: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
        desc: 'A platform to manage tasks and projects (like Jira).',
        careerImpact: 'Demonstrates ability to build complex, full-stack SaaS applications.',
        resumeValue: 80,
        features: ['Server Actions', 'Complex UI state', 'Database relations']
      },
      {
        title: 'Learning Management System',
        difficulty: 'Intermediate',
        focus: ['Next.js', 'Prisma', 'PostgreSQL'],
        desc: 'An LMS for creating courses and tracking student progress.',
        careerImpact: 'Proves capability in building data-heavy, multi-role platforms.',
        resumeValue: 85,
        features: ['Role-based access', 'Video uploading', 'Progress tracking']
      },
      {
        title: 'Food Delivery Platform',
        difficulty: 'Advanced',
        focus: ['Next.js', 'Node.js', 'PostgreSQL', 'WebSockets'],
        desc: 'A complex platform for ordering food with real-time tracking.',
        careerImpact: 'Shows enterprise-level full-stack skills and real-time data handling.',
        resumeValue: 90,
        features: ['Real-time updates', 'Payment integration', 'Geolocation']
      },
      {
        title: 'CRM Dashboard',
        difficulty: 'Advanced',
        focus: ['React', 'Node.js', 'Prisma', 'Docker'],
        desc: 'A Customer Relationship Management dashboard with analytics.',
        careerImpact: 'Highly sought-after skill for building internal tools and B2B software.',
        resumeValue: 95,
        features: ['Data visualization', 'Complex filtering', 'Data export']
      }
    ]
  },
  'ai_engineer': {
    id: 'ai_engineer',
    title: 'AI/ML Engineer',
    skills: [
      'Python', 'NumPy', 'Pandas', 'Machine Learning', 'Deep Learning',
      'APIs', 'LLMs', 'LangChain', 'RAG', 'Vector Databases',
      'FastAPI', 'AI Deployment', 'Prompt Engineering', 'Transformers',
      'OpenAI APIs', 'Hugging Face', 'Data Processing'
    ],
    projects: [
      {
        title: 'Resume Screening System',
        difficulty: 'Beginner',
        focus: ['Python', 'Data Processing', 'Prompt Engineering'],
        desc: 'An AI tool that parses PDF resumes and scores them against job descriptions using targeted prompts.',
        careerImpact: 'Demonstrates practical NLP applications and structured data extraction from unstructured text.',
        resumeValue: 70,
        features: ['PDF text extraction', 'LLM-based structured output parsing', 'Similarity scoring logic']
      },
      {
        title: 'AI Chatbot',
        difficulty: 'Beginner',
        focus: ['Python', 'APIs', 'Prompt Engineering', 'OpenAI APIs'],
        desc: 'A robust conversational assistant using OpenAI APIs to process user input and maintain context.',
        careerImpact: 'Proves you can integrate third-party LLMs and handle prompt engineering fundamentals.',
        resumeValue: 65,
        features: ['Context window management', 'System prompts for persona control', 'API key security and rate limiting']
      },
      {
        title: 'Image Classification Model',
        difficulty: 'Intermediate',
        focus: ['Machine Learning', 'Deep Learning', 'Python', 'NumPy'],
        desc: 'A custom CNN model to classify images into different categories.',
        careerImpact: 'Shows strong understanding of classic ML algorithms and computer vision.',
        resumeValue: 80,
        features: ['Data augmentation', 'Model training pipeline', 'Evaluation metrics']
      },
      {
        title: 'Sentiment Analysis Tool',
        difficulty: 'Intermediate',
        focus: ['Python', 'Transformers', 'Hugging Face', 'FastAPI'],
        desc: 'An API that analyzes the sentiment of text using pre-trained transformer models.',
        careerImpact: 'Proves ability to work with modern NLP models and serve them via API.',
        resumeValue: 85,
        features: ['Transformer model usage', 'API deployment', 'Batch processing']
      },
      {
        title: 'RAG-based Question Answering System',
        difficulty: 'Advanced',
        focus: ['RAG', 'Vector Databases', 'LangChain', 'LLMs'],
        desc: 'A retrieval-augmented generation system that ingests corporate documents and answers questions accurately without hallucinations.',
        careerImpact: 'Extremely high demand skill. Proves you can ground LLMs in factual, private datasets.',
        resumeValue: 95,
        features: ['Document chunking & embedding', 'Pinecone/Chroma vector search', 'LangChain orchestration']
      }
    ]
  }
};

export function getCareerData(careerGoal?: string): CareerPath {
  if (!careerGoal) return CAREER_PATHS['fullstack'];
  
  const normalized = careerGoal.toLowerCase().replace(/[^a-z]/g, '');
  
  if (normalized.includes('frontend')) return CAREER_PATHS['frontend'];
  if (normalized.includes('backend')) return CAREER_PATHS['backend'];
  if (normalized.includes('ai') || normalized.includes('ml') || normalized.includes('machinelearning')) return CAREER_PATHS['ai_engineer'];
  
  return CAREER_PATHS['fullstack'];
}
