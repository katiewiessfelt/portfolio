import express from 'express';

const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About Me' });
});

router.get('/work-history', (req, res) => {
  res.render('work_history', { title: 'Work History' });
});

router.get('/experience', (req, res) => {
  res.render('experience', { title: 'Experience' });
});

// -- projects
router.get('/projects', (req, res) => {
  res.render('projects', { title: 'Projects' });
});

router.get('/projects/TIBI', (req, res) => {
  res.render('projects/TIBI', { title: 'TIBI' });
});

router.get('/projects/bed-and-biscuits', (req, res) => {
  res.render('projects/bed_and_biscuits', { title: 'Bed and Biscuits' });
});

router.get('/projects/portfolio', (req, res) => {
  res.render('projects/portfolio', { title: 'Katie Wiessfelt' });
});

export default router;