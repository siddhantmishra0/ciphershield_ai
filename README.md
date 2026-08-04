# CipherShield AI 🔐

A production-ready full-stack MERN application implementing an **Enhanced Dynamic Hill Cipher** with SPN (Substitution-Permutation Network) architecture, dual S-Box layers, image encryption, ML-based security prediction, and a professional cybersecurity dashboard.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Setup

```bash
# Server setup
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm install
npm run dev

# Client setup (new terminal)
cd client
npm install
npm run dev
```

### 2. Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health check**: http://localhost:5000/api/health

---

## 🗂 Project Structure

```
ciphershield-ai/
├── client/                    # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── pages/             # 11 application pages
│   │   ├── components/        # Shared UI components
│   │   ├── store/             # Zustand state management
│   │   └── lib/               # API client + utils
│   └── package.json
│
└── server/                    # Node.js + Express backend
    ├── src/
    │   ├── crypto/
    │   │   ├── hillCipher.js      # Enhanced Hill Cipher engine
    │   │   ├── securityAnalysis.js # Entropy, avalanche, NPCR/UACI
    │   │   └── mlPredictor.js     # JS-based ML classifier
    │   ├── models/            # MongoDB schemas
    │   ├── routes/            # REST API routes
    │   ├── middleware/        # JWT auth
    │   └── index.js
    └── package.json
```

---

## 🔐 Cryptographic Architecture

### Enhanced Hill Cipher Engine
1. **Dynamic Key Generation** — `K = SHA-512(masterKey + timestamp + nonce + salt)` → invertible matrix (mod 257)
2. **Dual S-Box Substitution** — High/Low byte substitution before matrix multiplication
3. **Matrix Multiplication** — Hill cipher with prime modular arithmetic (mod 257)
4. **SPN Diffusion** — N configurable rounds of: Substitution → Permutation → Matrix Transform → Byte Mixing
5. **ML Prediction** — Weighted classifier predicts Weak/Moderate/Strong/Very Strong with confidence

### Supported Matrix Sizes
- 2×2, 3×3, 4×4, 8×8

### Configurable Rounds
- 2, 4, 8, 16

---

## 📊 Security Metrics

| Metric | Description |
|--------|-------------|
| Shannon Entropy | Measures randomness (ideal: 8.0 bits/byte) |
| Avalanche Effect | Bit change % when one input bit flips (ideal: 50%) |
| NPCR | Number of Pixel Change Rate for images |
| UACI | Unified Average Changing Intensity for images |
| PSNR | Peak Signal-to-Noise Ratio |
| Correlation | Adjacent pixel/byte correlation (ideal: ~0) |

---

## 🛠 Tech Stack

**Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, Axios, React Router, Lucide React

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Login + JWT |
| POST | `/api/encrypt/text` | Text encryption |
| POST | `/api/encrypt/decrypt-text` | Text decryption |
| POST | `/api/encrypt/file` | File encryption |
| POST | `/api/encrypt/image` | Image encryption |
| POST | `/api/analysis/avalanche` | Avalanche test |
| POST | `/api/analysis/entropy` | Entropy calculation |
| POST | `/api/analysis/key-sensitivity` | Key sensitivity |
| POST | `/api/compare/algorithms` | Algorithm benchmark |
| POST | `/api/ml/predict` | ML strength prediction |
| GET  | `/api/admin/stats` | Admin statistics |
| GET  | `/api/admin/users` | User management |

---

## 🎓 Academic Reference

This project implements concepts from:
- Hill Cipher (L.S. Hill, 1929)
- SPN Architecture (modern block cipher design)
- NPCR/UACI image encryption analysis standards
- Shannon entropy theory

**Suitable for**: B.Tech/MCA Final Year Project, Hackathons, Research Demonstrations, Portfolio
