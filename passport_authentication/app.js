const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
require('dotenv/config')

const app = express();

//  Passport Config
require('./config/passport')(passport)

// connect to mongo 
mongoose.connect(process.env.DB_CONNECTION,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }
)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

// EJS 
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Body Parser 
app.use(express.urlencoded({ extended: true }))

// Express-Session
app.set('trust proxy', 1)
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

// Passport middleware 
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash())

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    next()
})

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))



const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});