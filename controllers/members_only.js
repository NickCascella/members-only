const User = require("../models/users");
const passport = require("../passport_details");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
members_passcode = process.env.members_password;
admin_passcode = process.env.admin_password;

exports.index = function (req, res) {
  res.render("index");
};

exports.sign_up_get = function (req, res) {
  res.render("signup", { title: "Sign up!", signingUp: true });
};

exports.sign_up_post = [
  body("username", "Username must be between 5 - 12 characters long")
    .trim()
    .isLength({ min: 5, max: 12 })
    .escape(),

  body("password", "Password must be between 5 - 10 characters long")
    .trim()
    .isLength({ min: 5, max: 10 })
    .escape(),

  body(
    "passwordConfirmation",
    "passwordConfirmation field must have the same value as the password field"
  )
    .exists()
    .custom((value, { req }) => value === req.body.password),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("signup", {
        title: "Signup - Error",
        signingUp: true,
        errors: errors.array(),
      });
      return;
    } else {
      User.findOne({ username: req.body.username }).exec(function (
        err,
        results
      ) {
        if (err) {
          return next(err);
        }

        if (results) {
          let errorArray = [];
          let error = {
            msg: "Please choose a different username. User already exists.",
          };
          errorArray.push(error);
          res.render("signup", {
            title: "Signup",
            signingUp: true,
            errors: errorArray,
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) {
              return next(err);
            }
            const user = new User({
              username: req.body.username,
              password: hashedPassword,
              membershipStatus: false,
              adminStatus: false,
            }).save((err) => {
              if (err) {
                return next(err);
              }
              res.redirect("/");
            });
          });
        }
      });
    }
  },
];

exports.login_get = function (req, res) {
  res.render("signup", { title: "Log in", signingUp: false });
};

exports.login_post = [
  body("username", "Username must be between 5 - 12 characters long")
    .trim()
    .isLength({ min: 5, max: 12 })
    .escape(),
  body("password", "Password must be between 5 - 10 characters long")
    .trim()
    .isLength({ min: 5, max: 10 })
    .escape(),
  (req, res, next) => {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        let errorArray = [];
        let error = {
          msg: info.message,
        };
        errorArray.push(error);
        res.status(401);
        res.render("signup", {
          title: "Log in",
          signingUp: false,
          errors: errorArray,
        });
        return;
      } else {
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          return res.redirect("/");
        });
      }
    })(req, res, next);
  },
];

exports.logout_get = function (req, res) {
  req.logout();
  res.redirect("/");
};

exports.members_get = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("members_signup", {
      title: "Members Only",
    });
  } else {
    let errorArray = [];
    let error = {
      msg: "You must sign in before viewing that page.",
    };
    errorArray.push(error);
    res.redirect("/home/login").render("signup", {
      title: "Log in ",
      signingUp: false,
      errors: errorArray,
    });
  }
};

exports.members_post = [
  body("memberscode", "Invalid passcode")
    .trim()
    .escape()
    .custom((value) => value === members_passcode),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.user);
    if (!errors.isEmpty()) {
      res.render("members_signup", {
        title: "Members Only",
        errors: errors.array(),
      });
    }
    User.findOneAndUpdate(
      { username: req.body.username },
      { membershipStatus: true }
    ).exec((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
];
