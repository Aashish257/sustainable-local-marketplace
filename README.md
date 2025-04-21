# Sustainable Local Marketplace

This project is a full-stack sustainable local marketplace application consisting of a backend API and a frontend web client. It enables users to browse, buy, and sell local sustainable products with features like user authentication, product management, bidding, reviews, and payments.

---

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Authentication with JWT
- File uploads with Multer
- Environment variables with dotenv

### Frontend
- React 19
- Vite build tool
- React Router DOM for routing
- TailwindCSS for styling
- Axios for API requests
- Recharts for data visualization

---

## Installation

### Backend

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Backend` directory with the following variables:
   ```
   PORT=6000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Frontend

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Project

### Backend

Start the backend server in development mode with nodemon:
```bash
npm run dev
```
The backend server will run on `http://localhost:6000` by default.

### Frontend

Start the frontend development server:
```bash
npm run dev
```
The frontend will run on a port specified by Vite (usually `http://localhost:5173`).

---

## Project Structure

### Backend

- `server.js` - Main server entry point
- `config/` - Database connection and configuration
- `controllers/` - Route handlers for business logic
- `models/` - Mongoose schemas and models
- `routes/` - Express route definitions
- `middleware/` - Custom middleware (authentication, file upload)
- `utils/` - Utility functions
- `uploads/` - Static folder for uploaded files

### Frontend

- `src/`
  - `components/` - Reusable React components (Navbar, Footer, ProductCard, etc.)
  - `contexts/` - React context providers (e.g., AuthContext)
  - `pages/` - Page components (Home, Login, Products, ProductDetail, Admin)
  - `services/` - API service functions using Axios
  - `assets/` - Static assets like images
  - `index.css` - Global styles
  - `App.jsx` - Main app component with routing

---

## API Routes Summary (Backend)

- `/api/auth` - Authentication (login, register)
- `/api/users` - User management
- `/api/products` - Product listing, creation, updates
- `/api/orders` - Order processing
- `/api/payments` - Payment handling
- `/api/reviews` - Product reviews
- `/api/bids` - Bidding on products (in models/controllers but routes not explicitly listed)
- `/uploads` - Static access to uploaded files

---

## Frontend Features

- User authentication and authorization
- Product browsing and detailed views
- Shopping cart and order placement
- Payment integration
- User reviews and ratings
- Admin dashboard for managing products and orders
- Responsive design with TailwindCSS

---

## Environment Variables

Backend `.env` file should include:
```
PORT=6000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Frontend environment variables can be added as needed for API base URLs or other configs.

---

## Contact

For questions or support, please contact the project maintainer.

---

This README provides an overview and instructions to get started with the Sustainable Local Marketplace project.
