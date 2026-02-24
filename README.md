# 💰 MoneyMap – Smart Budget Planner

MoneyMap is a full-stack web application that helps users manage their income, expenses, and budgets efficiently.  
It provides categorized expense tracking, financial insights, and a clean dashboard for better money management.

---

## 🚀 Features

- User Registration & Login
- Add / Edit / Delete Income
- Add / Edit / Delete Expenses
- Categorized Transactions
- Monthly Budget Tracking
- Dashboard Overview
- Clean and Responsive UI

---

## 🛠 Tech Stack

### Frontend
- HTML / CSS / JavaScript (or React if used)

### Backend
- Node.js / Express (or Python Flask if used)

### Database
- MySQL / MongoDB (replace with your DB)

### DevOps & Deployment
- Git & GitHub
- Docker
- AWS EC2
- Nginx (Reverse Proxy)

---

## 📂 Project Structure

MoneyMap-Smart-Budget-Planner/
│
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json
│
├── backend/
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── app.js (or server.js)
│ └── package.json
│
├── docker-compose.yml
└── README.md




---

## ⚙️ Installation & Setup (Local)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Kaushall12/Moneymap-Smart-Budget-Planner.git
cd Moneymap-Smart-Budget-Planner



Backend Setup

cd backend
npm install
npm start


Frontend Setup

cd frontend
npm install
npm start



Environment Variables

Create a .env file inside backend folder:

PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key


Docker Deployment
Build & Run Using Docker Compose

docker compose up -d --build

To stop:

docker compose down



☁️ AWS EC2 Deployment

Launch Ubuntu EC2 instance

Install Docker

Clone repository

Run:

docker compose up -d --build

Configure Nginx reverse proxy (optional for production)



Future Improvements

Add financial analytics charts

Add email notifications

Add role-based access control

Add CI/CD pipeline using GitHub Actions

Add HTTPS with SSL




👨‍💻 Author

Kaushal Patel
MSc IT Student | DevOps Enthusiast
GitHub: https://github.com/Kaushall12
