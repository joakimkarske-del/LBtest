const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create table and seed data
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    category TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      // Check if table is empty
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          console.error('Error checking products:', err);
        } else if (row.count === 0) {
          seedDatabase();
        }
      });
    }
  });
}

// Seed database with 20 products
function seedDatabase() {
  const products = [
    { name: 'Braided Rope Toy', description: 'Durable cotton rope for tug-of-war', quantity: 45, price: 12.99, category: 'Toys' },
    { name: 'Heavy Duty Dog Leash', description: '6ft nylon leash with padded handle', quantity: 60, price: 18.99, category: 'Leashes & Collars' },
    { name: 'Reflective Dog Collar', description: 'Adjustable collar with reflective stitching', quantity: 55, price: 15.99, category: 'Leashes & Collars' },
    { name: 'Stainless Steel Food Bowl', description: 'Non-slip base, dishwasher safe', quantity: 40, price: 14.99, category: 'Feeding' },
    { name: 'Automatic Water Fountain', description: 'Filtered water dispenser for dogs', quantity: 25, price: 34.99, category: 'Feeding' },
    { name: 'Orthopedic Dog Bed', description: 'Memory foam bed for large dogs', quantity: 20, price: 79.99, category: 'Beds & Furniture' },
    { name: 'Waterproof Dog Coat', description: 'All-weather jacket with reflective strips', quantity: 35, price: 29.99, category: 'Clothing' },
    { name: 'Chew Resistant Ball', description: 'Natural rubber bouncing ball', quantity: 80, price: 9.99, category: 'Toys' },
    { name: 'Retractable Leash', description: '16ft extendable leash with brake', quantity: 30, price: 24.99, category: 'Leashes & Collars' },
    { name: 'Dog Training Clicker', description: 'Professional training tool with wrist strap', quantity: 70, price: 6.99, category: 'Training' },
    { name: 'Dental Chew Sticks', description: 'Natural ingredients for oral health', quantity: 100, price: 16.99, category: 'Treats & Health' },
    { name: 'Grooming Brush Set', description: 'Professional deshedding tools', quantity: 50, price: 22.99, category: 'Grooming' },
    { name: 'Dog Waste Bags', description: 'Biodegradable bags, 300 count', quantity: 150, price: 12.99, category: 'Waste Management' },
    { name: 'Travel Water Bottle', description: 'Portable water dispenser with bowl', quantity: 45, price: 14.99, category: 'Travel' },
    { name: 'Dog Training Pads', description: 'Super absorbent puppy pads, 50 pack', quantity: 65, price: 19.99, category: 'Training' },
    { name: 'Interactive Puzzle Toy', description: 'Treat-dispensing brain game', quantity: 38, price: 21.99, category: 'Toys' },
    { name: 'Elevated Food Stand', description: 'Adjustable height feeding station', quantity: 28, price: 39.99, category: 'Feeding' },
    { name: 'Dog Car Seat Cover', description: 'Waterproof backseat protector', quantity: 42, price: 29.99, category: 'Travel' },
    { name: 'Flea & Tick Collar', description: '8-month protection collar', quantity: 55, price: 26.99, category: 'Treats & Health' },
    { name: 'Plush Squeaky Toy Set', description: 'Soft toys with squeakers, 3-pack', quantity: 90, price: 17.99, category: 'Toys' }
  ];

  const stmt = db.prepare('INSERT INTO products (name, description, quantity, price, category) VALUES (?, ?, ?, ?, ?)');
  
  products.forEach(product => {
    stmt.run(product.name, product.description, product.quantity, product.price, product.category);
  });
  
  stmt.finalize(() => {
    console.log('Database seeded with 20 products');
  });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(row);
    }
  });
});

// Add new product
app.post('/api/products', (req, res) => {
  const { name, description, quantity, price, category } = req.body;
  
  if (!name || quantity === undefined || price === undefined) {
    return res.status(400).json({ error: 'Name, quantity, and price are required' });
  }

  db.run(
    'INSERT INTO products (name, description, quantity, price, category) VALUES (?, ?, ?, ?, ?)',
    [name, description || '', quantity, price, category || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, description, quantity, price, category });
      }
    }
  );
});

// Update product quantity
app.put('/api/products/:id', (req, res) => {
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({ error: 'Quantity is required' });
  }

  db.run(
    'UPDATE products SET quantity = ? WHERE id = ?',
    [quantity, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ id: req.params.id, quantity });
      }
    }
  );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
