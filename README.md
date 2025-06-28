
# 🍳 Voice-Controlled Smart Kitchen Assistant

A full-stack AI-powered kitchen assistant that lets you **speak to search recipes**, reads out **step-by-step cooking instructions with timers**, and allows **saving favorite recipes** — all controlled by voice!

---

## 🔗 Live Demo

🌐 Frontend (Vercel): [https://voice-controlled-kitchen-assistant.vercel.app](https://voice-controlled-kitchen-assistant.vercel.app)  
🖥️ Backend (Render): [https://voice-controlled-kitchen-assistant.onrender.com](https://voice-controlled-kitchen-assistant.onrender.com)

---

## 🔧 Tech Stack

### ⚛️ Frontend

- React + Vite
- Tailwind CSS for elegant UI
- Axios for API calls
- Web Speech API (speech recognition + synthesis)

### 🌐 Backend

- Node.js + Express
- MongoDB + Mongoose
- Spoonacular API (for live recipe data)
- JWT for secure authentication

---

## 🔐 Security & Voice Integration

- 🔒 JWT-based auth for login/signup
- 🎤 Web Speech API for voice command recognition
- 🗣️ Speech synthesis to read out cooking instructions
- 🔁 Command support: start, pause, resume, next, repeat, stop
- 💾 Save recipe using voice: “save this recipe”

---

## 🚀 Features

- 🔎 Voice-based recipe search (e.g., "Find recipe for pasta")
- 📃 Display of full ingredients and steps
- 🎙️ Step-by-step instructions spoken aloud
- ⏲️ Timer set automatically from instruction durations
- 🛑 Control with commands: pause, resume, stop, next, repeat
- 💾 Save recipes to user account
- 🧑 Authenticated user sessions
- 🗂️ View saved recipes anytime

---

## 🎤 Voice Commands Supported

| Command                 | Action                              |
|-------------------------|--------------------------------------| 
| “Find recipe for pasta” | Fetches a new recipe                 |
| “Start”                 | Begins step-by-step instruction      |
| “Pause”                 | Pauses timer and voice               |
| “Resume”                | Resumes the current instruction      |
| “Next”                  | Moves to next step                   |
| “Repeat”                | Repeats the current step             |
| “Stop”                  | Stops the assistant                  |
| “Save recipe”           | Saves current recipe to user profile |

---

## 🧪 Environment Variables

Create a `.env` file inside `/backend`:

```env
PORT=3000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
SPOONACULAR_API_KEY=your_api_key
```

---

## 💻 Getting Started

### 🔙 Backend Setup

```bash
cd backend
npm install
npm start
```

### 🔜 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Folder Structure

```
.
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── server.js
└── frontend
    ├── src
        ├── components
        ├── pages
        └── App.jsx
```

---

## 📜 License

MIT © 2025 [Aryan Nehra](https://github.com/AryanNehra)

---

## 🙌 Acknowledgments

- [Vercel](https://vercel.com) & [Render](https://render.com) for free hosting  
- [Tailwind CSS](https://tailwindcss.com) for elegant UI
