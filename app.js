require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const db = require('./database.js');

const app = express();
app.use('/uploads', express.static('uploads'));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Your provided index.html goes in /public)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- API ROUTES ---

// Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin login (Simple hardcoded auth for demonstration)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, message: "Logged in successfully" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Add new product
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, category } = req.body;
    const img = req.file ? `/uploads/products/${req.file.filename}` : '';

    const sql = "INSERT INTO products (name, price, category, img) VALUES (?, ?, ?, ?)";
    db.run(sql, [name, price, category, img], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, name, price, category, img });
    });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel running at http://localhost:${PORT}/admin/login.html`);
});