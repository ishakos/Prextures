# Prextures – Frontend

Prextures is a full-stack web application that allows users to predict **Premier League match results for the entire 2023–2024 season**.

This repository contains the **frontend client** of the application.  
The backend API and the admin panel are maintained in separate repositories.

---

## 🏆 About Prextures

Prextures is a game-like prediction platform where users:

- Submit predictions for Premier League matches
- Have their predictions securely saved
- See whether their predictions were **correct or incorrect** once official match results are available

The goal is to provide a clean, interactive experience for football fans while demonstrating a real-world **client–server architecture**.

---

## 🖥 Frontend Responsibilities

The frontend application is responsible for:

- User authentication (login / register)
- Displaying Premier League fixtures
- Allowing users to submit match predictions
- Showing prediction status (correct / incorrect) after results
- Communicating with the backend via REST APIs
- Providing a responsive and user-friendly UI

---

## 🧱 Architecture Overview

- **Frontend**: This repository (user-facing web app)
- **Backend**: REST API (authentication, predictions, results, persistence)
- **Admin Panel**: Separate isolated application used to manage matches and results

This separation ensures scalability, maintainability, and clear responsibility boundaries.

---

## 🛠 Tech Stack

- JavaScript
- React
- HTML5 & CSS3
- REST API communication
- JWT-based authentication

---

## 🚀 Run Locally

> ⚠️ Note: A running backend is required for full functionality.

```bash
# Clone the repository
git clone https://github.com/your-username/Prextures.git

# Navigate into the project
cd Prextures

# Install dependencies
npm install

# Start development server
npm run dev
