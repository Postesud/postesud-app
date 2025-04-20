const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Modifica: salva il database nella cartella temporanea di Render
const db = new sqlite3.Database('/tmp/database.sqlite');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/dashboard', (req, res) => {
  // Simulazione login: accetta qualsiasi utente/password
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
