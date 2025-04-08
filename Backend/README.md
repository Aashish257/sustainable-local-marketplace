# 🌿 Sustainable Local Produce Marketplace – FarmNest

FarmNest is a full-fledged, scalable web application designed to seamlessly connect local farmers with consumers through a modern, technology-driven marketplace. The platform promotes sustainability, transparency, and efficiency in the fresh produce supply chain by enabling direct farmer-to-consumer interactions.

By eliminating middlemen, FarmNest empowers local farmers to earn fair profits while providing buyers with access to fresh, organic, and locally sourced produce. The application integrates real-time features such as dynamic bidding, instant messaging, order tracking, and personalized product recommendations to enhance the overall user experience.

Built with a focus on innovation, scalability, and industry relevance, the platform serves as a digital ecosystem that supports ethical agriculture, local economies, and environmentally responsible food sourcing.

---

## 🚀 Features

- 👤 Multi-role access: Farmers, Buyers, Delivery Agents, Admin
- 🛒 Product Listings: Add, update, browse fresh produce
- 🛍️ Dynamic Bidding System for Auctions
- 🧾 Secure Order Placement & Payment System
- 💬 Real-time Chat between Buyers and Sellers
- 🧠 AI-driven Personalized Recommendations
- 🔐 JWT Authentication & Role-based Access Control
- 📊 Admin Dashboard for Monitoring & Management
- 📦 Order Tracking with Status Updates

---

## 🧱 Tech Stack

### 🔹 Frontend
- React.js + Tailwind CSS
- Axios for API integration
- React Router & Context API

### 🔹 Backend
- Node.js with Express.js 
- JWT for secure authentication
- WebSocket (Socket.io) for real-time chat
- RESTful API structure

### 🔹 Databases
- **MongoDB** – Unstructured data (chat, recommendations)

### 🔹 Other Tools
- Postman (API testing)

---

## 📂 Project Structure

```plaintext
backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── services/
├── tests/
├── app.js
├── config/
└── utils/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── App.js
│   └── index.js
```


⚙️ Setup Instructions
🔧 Prerequisites
Node.js / Java (Spring Boot)

PostgreSQL & MongoDB

Git

```
cd backend
npm install         # or mvn clean install for Spring Boot
npm start           # or mvn spring-boot:run
```

Create .env file in backend:
```
PORT=5000
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_uri
POSTGRES_URL=your_postgres_connection_url
```

 Frontend Setup
```
cd frontend
npm install
npm start
```
