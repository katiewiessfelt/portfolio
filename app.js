import express from 'express';
import path from 'path';

import  pageRoutes from './routes/index.js';
import  apiRoutes from './routes/api.js';

const app = express();

// Serve fontawesome
app.use("/fa", express.static(path.join(process.cwd(), "node_modules/@fortawesome/fontawesome-free"))
);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory for static files (CSS, JS, images)
app.use(express.static('public'));

// Routes
app.use('/', pageRoutes);      // handles '/'
app.use('/api', apiRoutes);   // handles '/api/'


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});