# Berserk Armory API

Backend API for the Berserk Armory e-commerce platform, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication:** Register, login, and logout with JWT authentication
- **Products:** CRUD operations, search, filter, ratings, and reviews
- **Categories:** Organize products into categories 
- **Orders:** Shopping cart and order processing
- **Image Uploads:** Product and category image upload functionality
- **Admin Dashboard:** Secure admin routes for managing products, orders, and users

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Products
- `GET /api/products` - Get all products (with filtering, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/myorders` - Get orders of logged in user
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/pay` - Update order to paid

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/products/:id/featured` - Set product as featured
- `PUT /api/admin/products/:id/new` - Set product as new arrival

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/berserk_armory
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the server:
   ```
   npm run server
   ```
   
### Running with Frontend
To run both frontend and backend concurrently:
```
npm run dev
```

## Database Models

- **User** - User accounts with role-based permissions
- **Product** - Products with details, images, and specifications
- **Category** - Product categories
- **Order** - Customer orders with status tracking

## Admin Panel

The API includes an admin panel with the following features:

1. **Dashboard**
   - User statistics
   - Product statistics
   - Order statistics
   - Revenue tracking
   - Low stock alerts

2. **Product Management**
   - Add/remove products
   - Update product details
   - Set products as featured
   - Set products as new arrivals
   - Manage product images (3-6 images per product)

3. **Category Management**
   - Add/remove categories
   - Update category details

4. **User Management**
   - View all users
   - Update user roles
   - Delete users

5. **Order Management**
   - View all orders
   - Update order status
   - Track order fulfillment 