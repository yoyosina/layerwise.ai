# 🚀 LayerWise (LayerWise.ai)

Welcome to **LayerWise** (part of the Likewise.ai platform) — your ultimate learning and progression tracking application! LayerWise is designed to provide an interactive, structured, and engaging way to consume educational content, track video progress, take quizzes, and visualize your learning journey through a unique Zig-Zag Roadmap.

---

## 🛠 Tech Stack

Our platform leverages a modern, robust, and scalable technology stack to ensure a seamless experience across all devices.

### Frontend
* **Framework:** React Native with Expo
* **Language:** TypeScript / JavaScript
* **Routing:** Expo Router

### Backend
* **Framework:** Python FastAPI
* **Language:** Python 3.10+
* **Database:** SQLite

---

## 🗺 Pages & Features Map

LayerWise provides a rich set of features divided into logical pages:

1. **🔐 Authentication**
   - Secure login and registration.
   - Session management to keep your progress safe.
   
2. **🛣️ Zig-Zag Roadmap**
   - A beautifully animated, interactive zig-zag path representing your learning journey.
   - Unlock new nodes as you complete previous milestones.
   
3. **📺 Video Tracking**
   - Watch educational videos directly within the app.
   - Progress tracking: The app remembers where you left off.
   - Auto-mark as completed when you finish watching.

4. **📝 Quizzes**
   - Test your knowledge with interactive quizzes at the end of each module.
   - Immediate feedback and scoring.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup (FastAPI + SQLite)
1. Navigate to the backend directory (if separated) or root:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will be available at `http://localhost:8000`*

### Frontend Setup (Expo React Native)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with the Expo Go app on your phone, or press `a` to run on an Android emulator, or `i` for an iOS simulator.

---

## 🚀 Deployment Instructions

### Deploying the Backend (Render)
Render is an excellent choice for deploying Python FastAPI applications with SQLite.
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set the Build Command:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the Start Command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. *(Optional)* Since SQLite is file-based, note that Render's free tier uses ephemeral file systems. For persistent data, attach a Render Disk to your Web Service and configure your database URL to point to that disk.

### Deploying the Frontend (Vercel)
If you are exporting the Expo app for the web:
1. Ensure your `app.json` is configured for web.
2. Build the web app:
   ```bash
   npx expo export:web
   ```
3. Push your code to GitHub.
4. Log into [Vercel](https://vercel.com/) and Import your project.
5. Set the Framework Preset to **Create React App** or **Other** and the Build Command to `npx expo export:web`.
6. Set the Output Directory to `web-build`.
7. Deploy!

---
*LayerWise - Empowering your learning journey, one layer at a time.*
