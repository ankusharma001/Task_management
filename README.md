# Tech Stack

## Frontend
- React
- Vite
- JavaScript
- CSS / Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## Deployment
- Vercel (Frontend)
- Render (Backend)

---

# Project Structure

```bash
project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── package.json
│
└── README.md

Installation
Clone Repository
git clone <repository-url>
cd project
Frontend Setup
cd frontend
npm install
npm run dev
Backend Setup
cd backend
npm install
npm start
Environment Variables

Create a .env file inside the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
