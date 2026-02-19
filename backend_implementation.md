
# Backend Implementation Guide (Node.js + Express + PostgreSQL)

## 1. Database Schema (PostgreSQL)
```sql
CREATE TABLE lokasi (
    id SERIAL PRIMARY KEY,
    kode_lokasi VARCHAR(50) UNIQUE NOT NULL,
    nama_lokasi VARCHAR(255) NOT NULL
);

CREATE TABLE barang (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    nama_barang VARCHAR(255) NOT NULL,
    kategori VARCHAR(100),
    stok INT DEFAULT 0,
    poto_barang TEXT,
    lokasi_id INT REFERENCES lokasi(id) ON DELETE SET NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin'
);
```

## 2. Express Server (`server.js`) - New Endpoints Added
```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

// Middleware: Auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- USER MANAGEMENT ROUTES ---

// List Users
app.get('/api/users', authenticateToken, async (req, res) => {
    const result = await pool.query('SELECT id, username, role FROM users');
    res.json(result.rows);
});

// Add New User
app.post('/api/users', authenticateToken, async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
            [username, hashedPassword, role || 'admin']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ message: 'User already exists' });
    }
});

// Change Password
app.put('/api/users/change-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
});

// Delete User
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.params.id == req.user.id) return res.status(400).json({ message: 'Cannot delete self' });
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
});

// --- EXISTING ROUTES (BARANG & LOKASI) ---
// ... refer to previous backend_implementation.md for Item and Location endpoints ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
