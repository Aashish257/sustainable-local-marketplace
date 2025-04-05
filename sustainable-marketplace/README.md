# Sustainable Local Marketplace

## Project Description
A sustainable marketplace platform connecting local producers with consumers, featuring product listings, bidding system, and messaging functionality.

## Current Features Implemented
- **User Management**: Registration, authentication, and profile management
- **Product Management**: Create, view, update, and delete product listings
- **Bidding System**: Place and manage bids on products
- **Order Processing**: Create and track orders
- **Messaging System**: User-to-user communication
- **Chat Functionality**: Real-time messaging between users

## Technology Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB (configured in config/database.js)
- **Authentication**: JWT (implemented in middleware/authMiddleware.js)

## File Structure
```
sustainable-marketplace/
├── config/
│   └── database.js       # Database configuration
├── controllers/
│   ├── bidController.js  # Bid management logic
│   ├── messageController.js # Message handling
│   ├── orderController.js # Order processing
│   ├── productController.js # Product operations
│   └── userController.js # User operations
├── middleware/
│   └── authMiddleware.js # Authentication middleware
├── models/
│   ├── Bids.js           # Bid data model
│   ├── chat.js           # Chat model
│   ├── Messages.js       # Message model
├── routes/
│   ├── productRoutes.js  # Product-related routes
│   └── userRoutes.js     # User-related routes
├── test/                 # Test files
├── package.json          # Project dependencies
├── package-lock.json     # Lock file
└── server.js             # Main server file
```

## Setup Instructions
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure database connection in `config/database.js`
4. Start the server: `npm start`

## Next Steps
- Implement frontend interface
- Add testing coverage
- Deploy to production environment
