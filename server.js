const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('/tmp/database.sqlite');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'postesud-segreto', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

function checkAuth(req, res, next) {
  if (req.session && req.session.user === 'admin') return next();
  res.redirect('/login');
}

// Login
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM utenti WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (row) {
      req.session.user = row.username;
      res.redirect('/clienti');
    } else {
      res.render('login', { error: 'Credenziali non valide' });
    }
  });
});
app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

// Clienti
app.get('/clienti', checkAuth, (req, res) => {
  db.all("SELECT * FROM clienti", (err, clienti) => {
    res.render('clienti', { clienti });
  });
});
app.get('/clienti/nuovo', checkAuth, (req, res) => res.render('nuovo_cliente'));
app.post('/clienti/nuovo', checkAuth, (req, res) => {
  const { nome, indirizzo, pec, sdi } = req.body;
  db.run("INSERT INTO clienti (nome, indirizzo, pec, sdi) VALUES (?, ?, ?, ?)", [nome, indirizzo, pec, sdi], () => {
    res.redirect('/clienti');
  });
});

// Distinta e spedizioni
app.get('/distinta/:id', checkAuth, (req, res) => {
  const distinta_id = req.params.id;
  db.get("SELECT * FROM clienti WHERE id = ?", [distinta_id], (err, cliente) => {
    db.all("SELECT * FROM spedizioni WHERE distinta_id = ?", [distinta_id], (err2, spedizioni) => {
      res.render('distinta', { cliente, spedizioni, distinta_id });
    });
  });
});
app.post('/distinta/:id/spedizione', checkAuth, (req, res) => {
  const { destinatario, tipo } = req.body;
  const distinta_id = req.params.id;
  let tracer = '';
  if (tipo !== 'Posta prioritaria' && tipo !== 'Posta massiva') {
    tracer = 'TRC-' + Date.now().toString().slice(-6);
  }
  db.run("INSERT INTO spedizioni (destinatario, tipo, tracer, distinta_id) VALUES (?, ?, ?, ?)",
    [destinatario, tipo, tracer, distinta_id], () => {
      res.redirect('/distinta/' + distinta_id);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("Server attivo sulla porta " + PORT));
