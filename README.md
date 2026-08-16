🤖 AURA — AI Customer Support Console
Aura is a production-ready, high-performance customer support agent console built with Next.js, React, Tailwind CSS, and Anthropic Claude.

It features real-time ticket auto-triage, dual operating modes (Copilot and Auto-Pilot), zero-error JSON response parsing, and native multilingual support tailored for both global and local e-commerce workflows.

✨ Key Features
Dual Agent Modes:

Copilot Mode (Human-in-the-Loop): Generates AI draft replies into the response input for review, editing, and manual sending.

Auto-Pilot Mode: Automatically responds to customer tickets and updates metadata in real time.

Auto-Triage & Live Metadata: Automatically extracts category, priority, customer sentiment, required action, and language.

Multilingual & Cultural Context: Native handling of English, French, Modern Standard Arabic, and Tunisian Arabic (Darija / Franco-Arabe).

E-Commerce Ready: Built-in flows for order tracking, refunds, payment on delivery (Cash on Delivery), and account resets.

Fail-Safe Response Parsing: Resilient JSON extraction and regex sanitization to guarantee zero dashboard crashes.

🛠️ Tech Stack
Framework: Next.js / React

AI Integration: Anthropic SDK (claude-3-5-sonnet / claude-3-haiku)

Styling & UI: Tailwind CSS + Lucide React Icons

Language: TypeScript / JavaScript

🚀 Quick Start
Prerequisites
Make sure you have Node.js (v18 or higher) installed on your system.

Setup Instructions
Clone the repository

Bash
git clone https://github.com/moslemichaoui/AURA.git
cd AURA
Install dependencies

Bash
npm install
Configure environment variables
Create a .env.local file in the root directory and add your Anthropic API key:

Extrait de code
ANTHROPIC_API_KEY=your_anthropic_api_key_here
Run the development server

Bash
npm run dev
Open http://localhost:3000 in your browser.

📦 Production Deployment
Build the optimized application for production:

Bash
npm run build
Start the production server:

Bash
npm start
