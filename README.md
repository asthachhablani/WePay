# WePay 💰

**WePay** is a full-stack digital lending platform where users can register, complete KYC verification, apply for loans, track repayments, and make payments — with a dedicated admin panel for reviewing and approving loan/KYC requests.

🔗 **Live App:** [wepay-1.onrender.com](https://wepay-1.onrender.com)
🔗 **Backend API:** [wepay-0wrl.onrender.com](https://wepay-0wrl.onrender.com)

---

## ✨ Features

- 🔐 **User Authentication** — Register/Login with JWT-based auth
- 🪪 **KYC Verification** — Users submit KYC documents for admin review
- 💵 **Loan Application** — Apply for loans and track application status
- 📊 **Dashboard** — View loan status, disbursed amount, interest, and due dates
- 💳 **Repayments** — Track repayment progress and make payments
- 🛠️ **Admin Panel** — Approve/reject loans and verify/reject KYC submissions
- 📄 **Document Upload** — Attach supporting documents to KYC/loan applications

---

## 🧱 Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM
- ESLint

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- Multer for file uploads
- CORS

**Deployment**
- Frontend & Backend hosted on [Render](https://render.com)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 📂 Project Structure

```
WePay/
├── backend/
│   ├── controllers/     # Route logic (auth, loans, kyc, repayments, admin)
│   ├── middleware/       # Auth middleware (JWT verification)
│   ├── models/            # Mongoose schemas (User, Loan, KYC, Repayment, etc.)
│   ├── routes/            # Express route definitions
│   └── server.js          # App entry point
│
└── frontend/
    ├── src/
    │   ├── pages/          # Login, Register, Dashboard, KYC, ApplyLoan, Payment, Admin, Home
    │   └── assets/
    └── vite.config.js
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repo
```bash
git clone https://github.com/asthachhablani/WePay.git
cd WePay
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT token |

### KYC (`/api/kyc`)
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/submit` | Submit KYC details (auth required) |

### Documents (`/api/documents`)
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/add` | Upload a document (auth required) |

### Loans (`/api/loans`)
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/apply` | Apply for a loan (auth required) |
| GET | `/my-loans` | Get logged-in user's loans (auth required) |
| GET | `/:id` | Get a specific loan by ID (auth required) |

### Repayments (`/api/repayments`)
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/create` | Create a repayment record (auth required) |
| POST | `/pay` | Make a repayment (auth required) |
| GET | `/my-repayments` | Get logged-in user's repayments (auth required) |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/loans` | View all loan applications (admin only) |
| GET | `/kyc` | View all KYC submissions (admin only) |
| PATCH | `/loans/:id/approve` | Approve a loan (admin only) |
| PATCH | `/loans/:id/reject` | Reject a loan (admin only) |
| PATCH | `/kyc/:id/verify` | Verify a user's KYC (admin only) |
| PATCH | `/kyc/:id/reject` | Reject a user's KYC (admin only) |

---

## 🌍 Deployment Notes

Both frontend and backend are deployed as separate services on **Render**.

- **Frontend** needs `VITE_API_URL` set to the backend's live URL as a build-time environment variable (Vite bakes this in at build time, so redeploy after changing it).
- **Backend** needs `MONGODB_URI`, `JWT_SECRET`, and `PORT` set in Render's Environment tab.
- **MongoDB Atlas** must have Render's traffic allowed under **Network Access → IP Access List** (since Render uses dynamic IPs, `0.0.0.0/0` is used to allow access from anywhere).
- Backend CORS is configured to allow requests only from the whitelisted frontend origin(s) in `server.js`.

---

## 📝 License

This project is for educational/personal use.
