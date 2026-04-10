# Sustainable Local Marketplace - API Backend

This directory contains the source code for the backend API.

## Quick Start

1. Install dependencies: `npm install`
2. Configure `.env` with `MONGO_URI` and `JWT_SECRET`.
3. Run development server: `npm run dev`
4. Run tests: `node tests/product-tests.js`

## Module Overview

### Auth Module
Handles user registration and login. Supports role-based registration (`buyer`, `seller`).

### Product Module
Main marketplace logic.
- **REST endpoints** for CRUD.
- **Filtering** by category and price.
- **Pagination** for search results.
- **Security** middleware for seller authorization and product ownership.

## Architecture
This project uses a **Service-Repository** pattern:
- **Controllers**: Handle HTTP requests/responses.
- **Services**: Contain business logic and security checks.
- **Repositories**: Handle database queries.
- **Validation**: Zod schemas for data integrity.
