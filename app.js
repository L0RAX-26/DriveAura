const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Car = require('./models/car');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {carSchema, reviewSchema} = require('./schema.js');
const Review = require('./models/review');
const carRoutes = require('./routes/cars');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/user');
const managerRoutes = require('./routes/manager');


mongoose.connect('mongodb://localhost:27017/drive-aura', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.managerId = "64bab5c89cc879b271b33739";
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/cars', carRoutes)
app.use('/cars/:id/reviews', reviewRoutes)
app.use('/', userRoutes)
app.use('/manager', managerRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/menu', (req, res) => {
    res.render('carMenu')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found !!', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if(!err.message) err.message="Soemthing went wrong!!"
    res.status(statusCode).render('error', {err});
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})