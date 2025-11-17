// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas que reciben JSON (fetch desde public/)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Logout (redirige a login estático)
router.get('/logout', authController.logout);

// Root: si está autenticado redirige a home, si no a login
router.get('/', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/home.html');
  res.redirect('/login.html');
});

module.exports = router;
