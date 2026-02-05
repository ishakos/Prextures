# Prextures – Frontend ⚽

Prextures is a full-stack web application that allows users to predict **Premier League match results for the entire 2023–2024 season**.

This repository contains the **frontend client** of the application.  
The backend API and the admin panel are maintained in separate repositories.

---

## 🏆 About Prextures

Prextures is a football prediction game where users:

- Create an account
- Submit predictions for Premier League matches
- Have their predictions securely saved
- **Cannot modify predictions once the match starts (deadline lock)**
- See whether their predictions were **correct or incorrect** after official match results
- Compete with other users through a **dynamic standings table**

The application combines football enthusiasm with real-world **client–server architecture** principles.

---

## 🖥 Frontend Responsibilities

The frontend application is responsible for:

- User authentication (registration & login)
- Displaying Premier League fixtures
- Allowing users to submit match predictions
- Enforcing prediction deadlines (locked at real match kickoff time)
- Displaying prediction outcomes (correct / incorrect)
- Showing league **standings based on user prediction performance**
- Communicating with the backend via REST APIs
- Providing a responsive and intuitive user interface

---

## 🧱 Architecture Overview

- **Frontend**: This repository (user-facing web application)
- **Backend**: REST API (authentication, predictions, results, scoring logic)
- **Admin Panel**: Separate isolated application used to manage fixtures, results, and system data

This separation improves scalability, maintainability, and security.

---

## 🎮 Core Features

- 🔐 Secure user authentication
- 📅 Full Premier League 2023–24 fixtures
- ⏱ Prediction deadline enforcement (locked at match start)
- ✅ Automatic validation of predictions after results
- 🏅 Live-updated standings / leaderboard
- 📊 Clear visualization of user performance

---

## 🛠 Tech Stack

- React.js
- HTML5 & CSS3
- REST API communication
- JWT-based authentication

---

## 🚀 Run Locally

> ⚠️ A running backend server is required for full functionality.

```bash
# Clone the repository
git clone https://github.com/your-username/Prextures.git

# Navigate into the project
cd Prextures

# Install dependencies
npm install

# Start development server
npm run dev
