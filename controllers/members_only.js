const User = require("../models/users");
const passport = require("../passport_details");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

exports.index = function (req, res) {
  res.render("index");
};

exports.sign_up_get = function (req, res) {
  res.render("signup", { title: "Sign up!" });
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
        errors: errors.array(),
      });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
        }).save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/");
        });
      });
    }
  },
];

exports.login_get = function (req, res) {
  res.render("signup", { title: "Log in" });
};

exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/home/sign-up",
});

exports.logout_get = function (req, res) {
  req.logout();
  res.redirect("/");
};
