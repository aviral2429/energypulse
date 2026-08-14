# ⚡ EnergyPulse
### Campus Energy Consumption Monitoring Dashboard with Cloud Analytics

<div align="center">

![EnergyPulse Banner](https://img.shields.io/badge/EnergyPulse-Campus%20Energy%20Monitor-00e676?style=for-the-badge&logo=firebase&logoColor=white)

[![Firebase](https://img.shields.io/badge/Firebase-PaaS-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Apache ECharts](https://img.shields.io/badge/Apache-ECharts-AA344D?style=flat-square&logo=apache&logoColor=white)](https://echarts.apache.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A real-time, cloud-powered dashboard for monitoring campus energy consumption, built with Firebase and Apache ECharts.**

[🚀 Live Demo](https://energypulse-680db.web.app) · [📄 Report](#) · [🎥 Demo Video](#)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Cloud Architecture](#-cloud-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Firebase Setup](#-firebase-setup)
- [Running the IoT Simulator](#-running-the-iot-simulator)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 🎯 About the Project

Most educational institutions have **zero real-time visibility** into their campus electricity consumption. Facilities managers cannot determine which buildings are consuming the most power, when peaks occur, or what the resulting CO₂ emissions are — leading to energy waste and unpredictable bills.

**EnergyPulse** solves this by:
- Collecting energy data from IoT sensors across campus buildings
- Storing it in **Google Cloud Firestore** in real time
- Displaying live analytics through an interactive **web dashboard**
- Alerting administrators when thresholds are breached

> 🏫 Built as a **Cloud Computing Vibe Coding Activity** project demonstrating real-world PaaS, serverless, and real-time cloud concepts.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Firebase Authentication** | Email/Password + Google OAuth sign-in |
| 📊 **Real-Time Power Chart** | Live area chart updating every 5 seconds |
| 🍩 **Device Breakdown** | Donut chart — energy split by category (HVAC, IT, Lighting) |
| 🟩 **Usage Heatmap** | 24h × 7-day energy intensity grid |
| 📈 **Daily Comparison** | Bar chart — this week vs last week |
| 💰 **Cost Trend** | 30-day electricity cost line chart |
| 🌍 **Carbon Tracker** | Gauge chart with CO₂ quota and tree/car equivalencies |
| 🔧 **Device Management** | Full CRUD operations synced to Firestore |
| 🔔 **Smart Alerts** | Notifications for offline devices and power spikes |
| 📅 **Historical Analytics** | 12-month energy trend bar chart |
| 💡 **AI Energy Tips** | Smart recommendations based on usage patterns |
| 📥 **CSV Export** | Download energy data for offline analysis |
| 🌙 **Dark / Light Mode** | Theme toggle saved to localStorage + Firestore |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| 🤖 **Python IoT Simulator** | 15 devices, 5 buildings, realistic campus patterns |

---

## 🛠 Tech Stack

```
Frontend       → HTML5, CSS3, JavaScript (ES6+)
Visualisation  → Apache ECharts 5.5
Cloud Platform → Google Firebase (PaaS)
Authentication → Firebase Auth (Email/Password + Google OAuth)
Database       → Cloud Firestore (NoSQL, real-time)
Hosting        → Firebase Hosting (Global CDN)
IoT Simulator  → Python 3 + firebase-admin SDK
Security       → Firestore Security Rules
```

---

## ☁️ Cloud Architecture

```
┌──────────────────────────────────────────────────┐
│              USER (Campus Admin)                 │
│         Browser → EnergyPulse Dashboard          │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────┐
│           PRESENTATION LAYER                     │
│  index.html  |  login.html  |  dashboard.html    │
│  Apache ECharts  |  Vanilla JS  |  CSS Modules   │
└────────────────────┬─────────────────────────────┘
                     │ Firebase SDK (onSnapshot)
┌────────────────────▼─────────────────────────────┐
│        FIREBASE CLOUD BACKEND (PaaS)             │
│                                                  │
│  Firebase Auth  |  Cloud Firestore  |  Hosting   │
│  JWT Tokens     |  /users           |  CDN       │
│  Google OAuth   |  /devices         |            │
│                 |  /alerts          |            │
│                 |  Security Rules   |            │
└────────────────────▲─────────────────────────────┘
                     │ Firebase Admin SDK
┌────────────────────┴─────────────────────────────┐
│          DATA COLLECTION LAYER                   │
│  Python IoT Simulator                            │
│  15 devices · 5 buildings · 5s intervals         │
│  Campus demand patterns + anomaly generation     │
└──────────────────────────────────────────────────┘
```

**Cloud Concepts Demonstrated:**
- ✅ Platform-as-a-Service (PaaS)
- ✅ Public Cloud Deployment
- ✅ Serverless Architecture
- ✅ NoSQL Real-Time Database
- ✅ Cloud Identity & Access Management
- ✅ Auto-scaling & Elasticity
- ✅ CDN-based Hosting
- ✅ IoT + Cloud Integration

---

## 📁 Project Structure

```
energypulse/
│
├── index.html              # Landing page (parallax, animations)
├── login.html              # Authentication page
├── dashboard.html          # Main dashboard
│
├── css/
│   ├── variables.css       # Design tokens (colors, fonts, spacing)
│   ├── base.css            # Global reset and shared styles
│   ├── landing.css         # Landing page styles
│   ├── auth.css            # Login/signup page styles
│   └── dashboard.css       # Dashboard layout and components
│
├── js/
│   ├── firebase-config.js  # Firebase initialization & config
│   ├── landing.js          # Parallax, typewriter, scroll animations
│   ├── auth.js             # Sign-up, sign-in, Google OAuth logic
│   ├── dashboard.js        # Main controller, auth guard, navigation
│   ├── charts.js           # All 7 ECharts instances
│   ├── devices.js          # Device CRUD operations
│   ├── alerts.js           # Alert rendering and management
│   ├── analytics.js        # Analytics view logic
│   ├── theme.js            # Dark/light theme toggle
│   └── utils.js            # Formatters, demo data generator
│
├── simulator/
│   ├── sensor_simulator.py # Python IoT sensor simulator
│   └── requirements.txt    # Python dependencies
│
├── firebase.json           # Firebase Hosting configuration
├── firestore.rules         # Firestore Security Rules
├── .firebaserc             # Firebase project binding
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome recommended)
- Python 3.x installed
- A Firebase account (free Spark plan)
- Node.js + npm (for Firebase CLI deployment only)

### 1. Clone the Repository

```bash
git clone https://github.com/aviral2429/energypulse.git
cd energypulse
```

### 2. Configure Firebase

Open `js/firebase-config.js` and replace with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Run Locally

```bash
python -m http.server 3000
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. Create **Firestore Database** → Start in test mode → Region: `asia-south1`
5. Go to **Project Settings** → Add Web App → Copy `firebaseConfig`
6. Paste config into `js/firebase-config.js`

---

## 🤖 Running the IoT Simulator

The Python simulator generates realistic campus energy data and pushes it to Firestore every 5 seconds.

```bash
cd simulator
pip install -r requirements.txt
python sensor_simulator.py
```

> **Note:** You need a Firebase service account key for the simulator.  
> Go to Firebase Console → Project Settings → Service Accounts → Generate new private key  
> Save it as `simulator/serviceAccountKey.json`

The simulator models:
- **15 smart meters** across **5 campus buildings**
- Higher consumption from **8 AM – 6 PM** on weekdays
- **2% anomaly probability** to generate alert events

---

## 🌐 Deployment

Deploy to Firebase Hosting (free):

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## 📸 Screenshots

> *(Add screenshots here after recording)*

| Page | Description |
|------|-------------|
| Landing Page | Parallax hero with animated counters |
| Login Page | Firebase Auth with Google OAuth |
| Dashboard | KPI cards + 7 interactive charts |
| Devices | IoT device management with CRUD |
| Analytics | Historical trends + AI tips |
| Alerts | Smart notification system |

---

## 👤 Author

**Aviral Pandey**  
Register Number: RA2311028010105  

[![GitHub](https://img.shields.io/badge/GitHub-aviral2429-181717?style=flat-square&logo=github)](https://github.com/aviral2429)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Built with ❤️ using Google Gemini AI + Firebase + Apache ECharts
</div>
