# Digital Wallet Web App

Full-stack digital wallet with peer-to-peer transfers, JWT auth, and atomic transactions.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (Access + Refresh tokens, HttpOnly cookies)

## Quick Start

### 1. Backend
```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT secrets
npm install
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:5000

## Features
- Register / Login / Auto token refresh
- Wallet: Deposit, Withdraw, Transfer (peer-to-peer)
- Transaction history with filters + CSV export
- Idempotency keys (prevents duplicate charges)
- Atomic MongoDB transactions (no money lost on errors)
- Rate limiting + input validation + security headers

## Deployment
- **Backend**: Deploy `server/` to Render or Railway
- **Frontend**: Deploy `client/` to Vercel
- Set `CORS_ORIGIN` in backend env to your Vercel URL

## Test Flow
1. Register two users (alice@test.com, bob@test.com)
2. Login as Alice → Deposit ₹5000
3. Transfer ₹1000 to bob@test.com
4. Check transactions for both users
5. Export CSV
