# 🦁 EcoLion - Sustainability App

EcoLion is a gamified sustainability application designed to motivate users to reduce their carbon footprint. By tracking eco-friendly activities like walking, biking, and using public transport, users earn CO2 savings and coins to customize their own lion mascot.

## ✨ Features

- **Activity Tracking**: Log walking, biking, and public transport trips to calculate CO2 savings.
- **Mascot Customization**: Use earned coins to buy hats, glasses, scarfs, and backgrounds for your lion.
- **Emotion System**: The Lion reacts to your progress! It gets sad if you're inactive and happy when you save CO2.
- **Leaderboards**: Compete with other users and neighborhoods ("Quartiere") for the top spot.
- **Chatbot**: Get sustainability tips and motivation from the built-in AI assistant (powered by OpenAI).
- **Dark Mode**: Fully adaptive UI for day and night.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, PWA support.
- **Backend**: Fastify (Node.js), SQLite.
- **Styling**: Vanilla CSS with a token-based design system (`tokens.css`, `index.css`).
- **Infrastructure**: Docker & Docker Compose.

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- Node.js (for local development without Docker)

### Quick Start (Docker)

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd EcoLion
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root directory (see [Configuration](#configuration) below).

3.  **Run with Docker**:
    ```bash
    docker compose up --build
    ```
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:8080`

### Local Development

1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```

2.  **Frontend**:
    ```bash
    cd eco-loewe-pwa
    npm install
    npm run dev
    ```

3.  **API Tests**:
    ```bash
    cd api-tests
    npm install
    npm test
    ```
    *Note: API tests in Docker are disabled by default to prevent database resets during development.*

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Backend
PORT=8080
DATABASE_PATH=/app/data/eco-loewe.db
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080

# OpenAI (Required for Chatbot)
OPENAI_API_KEY=your_openai_api_key_here

# Frontend
VITE_API_BASE_URL=http://localhost:8080

# Database Persistence (Optional)
# Set to 1 to wipe the DB on every restart (useful for dev)
PURGE_DB_ON_START=0
```

## 🦁 Mascot System

The lion's state depends on two factors:
1.  **Mood**: Determined by recent CO2 savings.
    - Low savings = `sad`
    - High savings = `happy`
2.  **Outfit**: Items purchased from the Shop.

## 🧪 Testing

We use **Vitest** for API testing.
- Tests are located in `api-tests/src/tests`.
- Use `npm test` in the `api-tests` directory to run them.

## 📜 License

This project is for educational purposes.
