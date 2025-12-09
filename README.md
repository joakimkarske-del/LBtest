# PawShop Inventory Management System

A modern web application for managing dog product inventory. Browse, add, delete, and update quantities of dog products like ropes, leashes, toys, and more.

## Features

- 🐾 Browse all dog products in your inventory
- ➕ Add new products with name, description, quantity, price, and category
- 🔢 Update product quantities easily
- 🗑️ Delete products from inventory
- 🔍 Search products by name, description, or category
- 📊 View inventory statistics (total products, items, and value)
- 📱 Responsive, modern UI design
- 💾 Local SQLite database with 20 pre-populated dog products

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LBtest
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

The application will automatically create and seed a local SQLite database with 20 dog products on first run.

## Usage

### Browse Products
- All products are displayed as cards on the main page
- Each card shows product name, category, description, quantity, and price

### Add a Product
1. Click the "+ Add New Product" button
2. Fill in the product details:
   - Name (required)
   - Description
   - Quantity (required)
   - Price (required)
   - Category
3. Click "Save Product"

### Update Quantity
1. Click "Update Qty" on any product card
2. Enter the new quantity
3. Click "Update"

### Delete a Product
1. Click "Delete" on any product card
2. Confirm the deletion

### Search Products
- Use the search box to filter products by name, description, or category

## Product Categories

The system supports the following dog product categories:
- Toys
- Leashes & Collars
- Feeding
- Beds & Furniture
- Clothing
- Training
- Treats & Health
- Grooming
- Waste Management
- Travel
- Other

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **UI**: Modern, responsive design with custom CSS

## Project Structure

```
LBtest/
├── server.js           # Express server and API endpoints
├── public/             # Frontend files
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Styles
│   └── app.js          # Frontend JavaScript
├── package.json        # Dependencies and scripts
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product quantity
- `DELETE /api/products/:id` - Delete product

## License

ISC