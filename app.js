const express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    user = require('./models/user'),
    bodyParser = require('body-parser'),
    emailValidator = require('email-validator'),
    expressSanitizer = require('express-sanitizer'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('express-session')({
    secret: "CS is lov",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressSanitizer());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

const port = process.env.port,
    mongoUri = process.env.mongoUri,
    ip = process.env.ip;

mongoose.connect(mongoUri, {
    useNewUrlParser: true, // for avoiding deprecation warnings 
    useUnifiedTopology: true
}, (err) => {

    if (err)
        console.log(err);
    else
        console.log("Connection to the database established...");

});

//==============
// routes
//==============

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/secret', isLoggedIn, (req, res) => {
    user.find({ _id: req.user._id }, (err, user) => {

        if (err)
            res.status(404).json({ success: false, message: `${req.user._id}'s data not found` });
        else {
            res.status(200).render('secret', { data: user });
        }
    });
});

//==============
// auth routes
//==============

app.get('/register', (req, res) => {
    res.render("register");
});
app.post('/register', (req, res) => {
    if (!emailValidator.validate(req.sanitize(req.body.email)))
        return res.status(400).json({ success: false, message: `invalid email format` });
    user.findOne({ username: req.body.username }, (err, foundUser) => {
        if (err) {
            return res.status(400).send({ message: err.message });
        }
        if (foundUser) {
            return res.status(400).json({ success: false, message: `user already registered` });
        }
        user.register(new user({
            username: req.sanitize(req.body.username),
            name: req.sanitize(req.body.name),
            address: req.sanitize(req.body.address),
            mobile: req.sanitize(req.body.mobile),
            email: req.sanitize(req.body.email)
        }), req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secret");
            });
        });
    })
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), (req, res) => {
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

//==============
// middleware
//==============
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('login');
}

app.listen(port, ip, () => {
    console.log(`Server started at http://127.0.0.1:${port}`);
});