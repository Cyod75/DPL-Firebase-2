// controllers/authController.js
const admin = require('firebase-admin');
const axios = require('axios');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
if (!FIREBASE_API_KEY) {
  console.warn('Aviso: FIREBASE_API_KEY no está definido en .env. Login con REST no funcionará.');
}

// Llamada REST para signInWithPassword
const signInWithEmailAndPassword = async (email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const payload = { email, password, returnSecureToken: true };
  const resp = await axios.post(url, payload);
  return resp.data;
};

// Validación mínima de email/password
const validateCredentials = (email, password) => {
  if (!email || !password) return 'Email y password son obligatorios';
  if (typeof password !== 'string' || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
};

module.exports = {
  // POST /register
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      const validationError = validateCredentials(email, password);
      if (validationError) return res.status(400).json({ error: validationError });

      // Crear usuario con Admin SDK
      const userRecord = await admin.auth().createUser({ email, password });

      // Iniciar sesión inmediatamente (REST) para obtener idToken
      let loginData;
      try {
        loginData = await signInWithEmailAndPassword(email, password);
      } catch (e) {
        // Si no tenemos API_KEY o falla la REST, aún devolvemos éxito de creación
        req.session.user = { uid: userRecord.uid, email: userRecord.email };
        return res.json({ success: true, warning: 'Usuario creado pero no se pudo iniciar sesión automáticamente' });
      }

      const decoded = await admin.auth().verifyIdToken(loginData.idToken);

      req.session.user = {
        uid: decoded.uid,
        email: decoded.email,
        idToken: loginData.idToken
      };

      return res.json({ success: true });
    } catch (err) {
      let message = 'Error en el registro';
      if (err.code === 'auth/email-already-exists') message = 'El correo ya está registrado';
      else if (err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
        message = err.response.data.error.message;
      } else if (err.message) {
        message = err.message;
      }
      return res.status(400).json({ error: message });
    }
  },

  // POST /login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const validationError = validateCredentials(email, password);
      if (validationError) return res.status(400).json({ error: validationError });

      const loginData = await signInWithEmailAndPassword(email, password);
      const decoded = await admin.auth().verifyIdToken(loginData.idToken);

      req.session.user = {
        uid: decoded.uid,
        email: decoded.email,
        idToken: loginData.idToken
      };

      return res.json({ success: true });
    } catch (err) {
      let message = 'Credenciales inválidas';
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
        // Mensajes de la REST API (e.g. EMAIL_NOT_FOUND, INVALID_PASSWORD)
        message = err.response.data.error.message;
      } else if (err.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado';
      } else if (err.message) {
        message = err.message;
      }
      return res.status(401).json({ error: message });
    }
  },

  // GET /logout
  logout: (req, res) => {
    req.session.destroy(err => {
      // Si hay error, aún redirigimos a login
      res.redirect('/login.html');
    });
  }
};
