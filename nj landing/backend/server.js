const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = 3003;

// Middleware
app.use(bodyParser.json());

// PostgreSQL Pool
const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'nutrijewel',
  password: 'your_password',
  port: 5432,
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to NutriJewel Backend!');
});

// Authentication Routes
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );
    res.status(201).json({ userId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Cart Routes
app.post('/cart/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id',
      [userId, productId, quantity]
    );
    res.status(201).json({ cartId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Error adding to cart' });
  }
});

app.put('/cart/update', async (req, res) => {
  const { cartId, quantity } = req.body;

  try {
    await pool.query('UPDATE cart SET quantity = $1 WHERE id = $2', [quantity, cartId]);
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating cart' });
  }
});

app.get('/cart/view', async (req, res) => {
  const { userId } = req.query;

  try {
    const result = await pool.query(
      'SELECT c.id, p.name, p.price, c.quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart items' });
  }
});

// Checkout Route
app.post('/checkout', async (req, res) => {
  const { userId, total, status = 'Pending' } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, total, status]
    );
    res.status(201).json({ orderId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Error processing checkout' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
