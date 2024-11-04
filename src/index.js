const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const scrambleRoute = require('./routes/scramble');
const mainRoutes = require('./routes/main'); // Import the main page routes
const db = require('./config/database');
const seedDatabase = require('../scripts/seedDatabase')

const app = express();
db.connect();

seedDatabase();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Specify the views directory
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/scramble', scrambleRoute);

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
