# ProjectPilot AI 🚀

## Project Overview
ProjectPilot AI is an advanced, AI-powered project management and developer productivity platform built with Next.js. It helps developers plan, track, and execute their projects efficiently while providing a personalized career roadmap and smart AI mentoring.

## Problem Statement
Developers often struggle with managing multiple projects, keeping track of their career progression, and finding reliable mentorship tailored to their specific technology stack and goals. Traditional project management tools lack context about a developer's career roadmap, and standard learning platforms are disjointed from everyday coding tasks.

## Solution
ProjectPilot AI bridges this gap by integrating a smart developer dashboard with AI-assisted project planning and career roadmaps. It serves as an all-in-one workspace where developers can plan sprints, track their technical growth, and receive context-aware mentorship to level up their skills efficiently.

## Features
- **AI-Powered Project Planning:** Generate and manage project timelines and milestones automatically.
- **Smart Developer Dashboard:** A centralized view for all your active projects and progress metrics.
- **Career Roadmap Tracking:** Adaptive engines track your skills and recommend personalized growth paths.
- **AI Mentor Assistance:** Receive actionable insights and guidance tailored to your current tasks.
- **GitHub Integration:** Seamlessly connect and sync with your GitHub repositories.
- **Authentication System:** Secure and reliable user authentication powered by Clerk.
- **Modern Responsive UI:** A beautifully crafted, responsive interface utilizing Tailwind CSS and Framer Motion.

## Architecture Diagram
```mermaid
graph TD
    Client[Next.js Client] --> Auth[Clerk Authentication]
    Client --> Server[Next.js API Routes / Server Actions]
    Server --> DB[(PostgreSQL Database)]
    Server --> Prisma[Prisma ORM]
    Prisma --> DB
    Server --> AI[AI Engine / Mentorship]
    Client --> State[Zustand State Management]
```

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** Clerk
- **State Management:** Zustand
- **Form Handling:** React Hook Form & Zod
- **Icons & Charts:** Lucide React, Recharts

## Project Folder Structure
```bash
project-pilot/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
├── components/           # Reusable React UI Components
│   ├── layout/           # Layout-specific components
│   └── ui/               # Base UI elements (Buttons, Cards, Inputs, etc.)
├── lib/                  # Utility functions, Prisma client, and business logic (AI Engine)
├── prisma/               # Prisma schema and configuration
├── public/               # Static assets (images, icons)
├── store/                # Zustand global state management
└── types/                # TypeScript type definitions and interfaces
```

## Installation & Setup Guide

### Prerequisites
- Node.js 20+
- npm (or yarn/pnpm)
- PostgreSQL database (local or cloud like Supabase/Neon)
- Clerk account for authentication

## Environment Variables
Create a `.env` or `.env.local` file in the root of the project and add the following variables:
```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
```

## Steps to Run the Project Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jivan-Patel/project-pilot.git
   cd project-pilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Push Database Schema (if needed):**
   ```bash
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Navigate to `http://localhost:3000` in your web browser.

## Contributing Guidelines
We welcome contributions to ProjectPilot AI! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature-name`
3. Commit your changes with clear, descriptive messages: `git commit -m "Add some feature"`
4. Push to your branch: `git push origin feature-name`
5. Open a Pull Request detailing your changes.

Please ensure your code passes linting (`npm run lint`) and follows the project's coding standards before submitting a PR.

## 🤝 Contributors

Thanks to everyone who has contributed to ProjectPilot AI. Your contributions help make this project better for the community!

<a href="https://github.com/Yogender-verma/project-pilot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Yogender-verma/project-pilot"
  alt="Project contributors"
   />
</a>




## Author
**Yogender Verma**

## License
This project is licensed under the MIT License.
