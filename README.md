# 🌱 Sustainable Local Marketplace

> A full-stack web application to browse, buy, and sell **local sustainable products**.  
Includes features like user authentication, product listings, bidding, reviews, orders, and payments — all built with a modern tech stack.

![Platform](https://img.shields.io/badge/platform-Web-brightgreen)
![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express.js-yellow)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite-blue)
![Database](https://img.shields.io/badge/database-MongoDB-green)

---

## 🚀 Tech Stack

### 🔥 Backend
- **Node.js** with **Express.js**
- **MongoDB** & Mongoose
- JWT-based Authentication
- File uploads with **Multer**
- Environment config via **dotenv**

### ⚡ Frontend
- **React 19** + **Vite**
- **React Router DOM** for routing
- **TailwindCSS** for responsive UI
- **Axios** for HTTP requests
- **Recharts** for analytics & charts

---

## 📦 Installation & Setup

### 🔧 Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory with:

```env
PORT=6000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 🎨 Frontend

```bash
cd Frontend
npm install
```

---

## 🚀 Running the Project

### 🔥 Backend

```bash
npm run dev
```
Runs on: [http://localhost:6000](http://localhost:6000)

### ⚡ Frontend

```bash
npm run dev
```
Runs on: Vite default port, e.g., [http://localhost:5173](http://localhost:5173)

---

## 🗂 Project Structure

### 🛠 Backend

```
Backend/
├── server.js             # Entry point
├── config/               # Database config
├── controllers/          # Business logic handlers
├── models/               # Mongoose schemas
├── routes/               # API endpoints
├── middleware/           # Auth & upload middlewares
├── utils/                # Helper functions
└── uploads/              # Uploaded files
```

### 🎨 Frontend

```
Frontend/src/
├── components/           # Navbar, Footer, ProductCard, etc.
├── contexts/             # AuthContext, etc.
├── pages/                # Home, Login, Products, Admin
├── services/             # Axios API handlers
├── assets/               # Images & static files
├── App.jsx               # Main app + routing
└── index.css             # Global styles
```

---

## 🔗 API Routes (Backend)

| Endpoint           | Description                     |
|---------------------|--------------------------------|
| `/api/auth`         | Login & Register               |
| `/api/users`        | User management                |
| `/api/products`     | CRUD for products              |
| `/api/orders`       | Order processing               |
| `/api/payments`     | Payment integrations           |
| `/api/reviews`      | Product reviews                |
| `/api/bids`         | Bidding features (planned)     |
| `/uploads`          | Access uploaded files          |

---

## 🌟 Frontend Features

✅ User Authentication & Authorization  
✅ Browse products & detailed views  
✅ Shopping cart & order checkout  
✅ Payment integration  
✅ Leave reviews & ratings  
✅ Admin dashboard for managing products & orders  
✅ Responsive UI with TailwindCSS

---

## 🚀 Upcoming Features

🚧 **Future enhancements planned:**  
- ✅ Bidding workflow on products with real-time updates  
- ✅ Live chat between buyers & sellers  
- ✅ Notification system (email & SMS)  
- ✅ Advanced filtering & search for products  
- ✅ Sales & traffic analytics dashboard for sellers  
- ✅ Wishlist & save-for-later functionality  
- ✅ Coupon & discount system  
- ✅ Multi-vendor support with shop profiles

---

## ⚙ Environment Variables

### 📝 Backend `.env`

```env
PORT=6000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 🌐 Frontend
Optional for API base URL or other configs:

```env
VITE_API_URL=http://localhost:6000/api
```

---

## 📌 Notes

- Bidding logic exists in models/controllers; routes are being built out.
- Designed to promote eco-friendly, local products through a seamless marketplace experience.

---

🎉 **Thank you for checking out this project!**  
This README provides everything you need to get started with the Sustainable Local Marketplace.
