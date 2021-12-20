const User = require('../models/users')
const passport = require('../passport_details')

exports.index = function(req,res){
    res.render('index')
}

exports.sign_up_get = function(req,res){
    res.render('signup', {title: 'Sign up!'})
}

exports.sign_up_post = function(req,res,next){
    const user = new User({
        username: req.body.username,
        password: req.body.password
      }).save(err => {
        if (err) { 
          return next(err);
        }
        res.redirect("/");
      });
}

exports.login_get = function(req,res){
    res.render('signup', {title: 'Log in'})
}

exports.login_post = passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/"
      })
