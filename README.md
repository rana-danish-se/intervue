# Intervue — AI-Powered Mock Interview Platform

Intervue is an intelligent mock interview platform that helps users prepare for technical interviews through AI-generated questions, real-time evaluation, and detailed performance reports.

## Features

- **AI-Generated Interview Questions** — Tailored questions based on role, experience level, and tech stack using Gemini & Groq LLMs
- **Real-Time Answer Evaluation** — Instant AI-powered feedback on confidence, knowledge, relevance, fluency, and clarity
- **Session Reports** — Comprehensive performance reports with actionable improvement suggestions
- **Speech-to-Text** — Answer questions verbally with audio transcription support
- **Google OAuth & Email Authentication** — Secure login with multiple auth options
- **Dashboard & Analytics** — Track interview history and performance metrics over time

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js, React, Tailwind CSS, Framer Motion |
| Backend    | Express.js, Node.js                     |
| Database   | MongoDB (Mongoose)                      |
| AI / LLM   | Google Gemini, Groq                     |
| Auth       | JWT, Passport.js (Google OAuth 2.0)     |
| Storage    | Cloudinary                              |
| Deployment | Vercel                                  |

## Project Structure

```
intervue/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # Reusable React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities & API client
│   │   ├── services/    # API service functions
│   │   └── store/       # Zustand state management
│   └── public/          # Static assets
│
├── server/          # Express.js backend API
│   ├── src/
│   │   ├── configs/     # Database & Passport config
│   │   ├── controllers/ # Route handlers
│   │   ├── middlewares/ # Auth & error middleware
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API route definitions
│   │   ├── services/    # Business logic & LLM integration
│   │   └── utils/       # Helpers & prompt templates
│   └── server.js        # Entry point
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Cloud OAuth credentials
- Gemini / Groq API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/intervue.git
   cd intervue
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Fill in your environment variables in .env
   ```

3. **Set up the client**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Fill in your environment variables in .env
   ```

4. **Run the development servers**
   ```bash
   # Terminal 1 — Backend
   cd server
   npm run dev

   # Terminal 2 — Frontend
   cd client
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Both the client and server are deployed separately on **Vercel**.

- **Client**: Deployed as a Next.js application (auto-detected by Vercel)
- **Server**: Deployed as a Node.js serverless function via `vercel.json`

> Set all environment variables from `.env.example` in each project's Vercel dashboard under **Settings → Environment Variables**.

## Team Members

| #  | Name              | Roll Number    |
|----|-------------------|----------------|
| 1  | Rana Danish        | SP24-BSE-139   |
| 2  | Uswa Maryam        | SP24-BSE-121   |
| 3  | Muhammad Waqar     | SP24-BSE-091   |
| 4  | Fatima Chaudry     | SP24-BSE-024   |

## License

This project is developed as a university course project.
