# 🧠 AI-Powered Interview Assistant

A real-time, resume-aware interview platform built with React. Designed to simulate full-stack technical interviews using AI, this app features a dual-tab interface for candidates and interviewers, dynamic question generation, and persistent session management.

## 🚀 Features

### 👤 Interviewee Tab
- Upload resume (PDF required, DOCX optional)
- Auto-extract Name, Email, Phone from resume
- Chatbot prompts for missing info before starting
- Timed interview with 6 AI-generated questions:
  - 2 Easy (20s each)
  - 2 Medium (60s each)
  - 2 Hard (120s each)
- Auto-submit answers on timeout
- Final AI-generated score and summary

### 🧑‍💼 Interviewer Tab (Dashboard)
- View list of candidates sorted by score
- Access full chat history, profile, and AI summary
- Search and sort candidates
- Detailed view of each candidate’s performance

### 💾 Persistence
- All progress, timers, and answers stored locally
- Session resumes on refresh or reopen
- “Welcome Back” modal for unfinished interviews

## 🛠️ Tech Stack

- **Frontend**: React
- **State Management**: Redux + redux-persist / IndexedDB
- **UI Library**: Ant Design / shadcn / any modern UI
- **AI Integration**: OpenAI-compatible APIs (recommended)

## 📦 Installation

```bash
git clone https://github.com/your-username/ai-interview-assistant.git
cd ai-interview-assistant
npm install
npm start