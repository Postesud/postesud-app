const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('/tmp/database.sqlite');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'postesud-segreto',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware autenticazione
function checkAuth(req, res, next) {
  if (req.session && req.session.user === 'admin') {
    return next();
  } else {
    res.redirect('/login');
  }
}

// ROUTES
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM utenti WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (row) {
      req.session.user = row.username;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Credenziali non valide' });
    }
  });
});

app.get('/dashboard', checkAuth, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
