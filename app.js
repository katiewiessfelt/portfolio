const express = require('express');
const path = require('path');

const app = express();

// Serve fontawesome
app.use("/fa", express.static(path.join(process.cwd(), "node_modules/@fortawesome/fontawesome-free"))
);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory for static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

app.get('/work-history', (req, res) => {
  res.render('work_history', { title: 'Work History' });
});

app.get('/portfolio', (req, res) => {
  res.render('portfolio', { title: 'Portfolio' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});