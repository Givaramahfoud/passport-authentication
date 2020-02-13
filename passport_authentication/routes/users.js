const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')

// User Model
const User = require('../modules/User')

// Login
router.get('/login', (req, res) => {
    res.render('login')
});

// Register
router.get('/register', (req, res) => {
    res.render('register')
});

// Handel Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []

    // Check Required Fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'please fill in all the fields' })
    }

    // Check Password Match
    if (password !== password2) {
        errors.push({ msg: 'password do not Match' })
    }

    // Check Password Length
    if (password.length < 6) {
        errors.push({ msg: 'password must have more then 6 Char' })
    }
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        // Validation Passed 
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err
                            // Set Password To Hashed
                            newUser.password = hash
                            // Save User
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'you are now registered and con log in ')
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err))
                        }))
                }
            })
    }
})

// Handel Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

// Handel Logout 
router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})

module.exports = router;