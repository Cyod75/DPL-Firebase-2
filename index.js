// index.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const admin = require('firebase-admin');

const app = express();

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // cambiar a true en producción con HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Servir archivos estáticos desde public/
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API (autenticación)
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Endpoint para obtener información del usuario autenticado (JSON)
app.get('/api/user', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.status(401).json({ authenticated: false, error: 'No autenticado' });
});

// Health-check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
