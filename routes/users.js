//All routes for user Registration
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


//Bring in user model from /models/user.js
// '..' because need to move from current folder to root directory
let User = require('../models/user');

//Register form route
//route is actually '/user/register', but '/user' isn't needed because all '/user' routes will go to this file
//Will render the register.pug file when visiting this URL
router.get('/register', function(req,res) {
  res.render('register');
});

//Register Process
router.post('/register', function(req,res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  //Using express validator to check that input is valid
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  //grabs any errors and assigns them to a variable
  let errors = req.validationErrors();

  //if there are errors we just render the template again with the errors passed the the template
  //else we can create a new user from the model brought in at the top
  //for a new user we pass all the fields from the post request to the model based on our User schema
  if(errors) {
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password //password is plain text, but needs to be salted and hashed
    });

    //Using bcryptjs to first get a salt 10 chars long
    //Then hash a password using the generated salt
    //Finally set the salted and hashed password to the newUser
    bcrypt.genSalt(10,function(err,salt) {
      bcrypt.hash(newUser.password, salt, function(err,hash) {
        if(err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err) {
          if(err) {
            console.log(error);
            return;
          } else {
            req.flash('success','You are now registered and can log in');
            res.redirect('/users/login')
          }
        });
      });
    });
  }
});

//Login form
router.get('/login', function(req,res) {
  res.render('login');
});

//Login Process
//post request will come from the submission button on the login page
//Will use passport to verify user Login
router.post('/login', function(req,res,next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req,res,next);
});

//Logout
router.get('/logout', function(req,res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
