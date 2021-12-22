const User = require("../models/users");
const Message = require("../models/message");
const passport = require("../passport_details");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const fs = require("fs");
const { format } = require("date-fns");
members_passcode = process.env.members_password;
admin_passcode = process.env.admin_password;

exports.index = function (req, res) {
  Message.find()
    .sort({ _id: -1 })
    .populate("user")
    .exec(function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("index", { messages: results });
    });
};

exports.sign_up_get = function (req, res, next) {
  User.count().exec(function (err, results) {
    if (err) {
      return next(err);
    }

    res.render("signup", {
      title: "Sign up!",
      userCount: results,
      signingUp: true,
    });
  });
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
      User.count().exec(function (err, results) {
        if (err) {
          return next(err);
        }
        res.render("signup", {
          title: "Signup",
          userCount: results,
          signingUp: true,
          errors: errors.array(),
        });
        return;
      });
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
      heading:
        "Wanna see the authors of your favorite messages?? Upgrare your account status!",
      status: "member",
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

    if (!errors.isEmpty()) {
      res.render("members_signup", {
        title: "Members Only",
        heading:
          "Wanna see the authors of your favorite messages?? Upgrare your account status!",
        status: "member",
        errors: errors.array(),
      });
      return;
    }
    User.findOneAndUpdate(
      {
        username: req.body.username,
      },
      { membershipStatus: true }
    ).exec((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
];

exports.admin_get = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("members_signup", {
      title: "Admins Only",
      heading: "Have authorization to delete ANY posts + members benefits",
      status: "admin",
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

exports.admin_post = [
  body("memberscode", "Invalid passcode")
    .trim()
    .escape()
    .custom((value) => value === admin_passcode),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("members_signup", {
        title: "Admins Only",
        heading: "Have authorization to delete ANY posts + members benefits",
        status: "admin",
        errors: errors.array(),
      });
      return;
    }

    User.findOneAndUpdate(
      {
        username: req.body.username,
      },
      { adminStatus: true },
      { membershipStatus: true }
    ).exec((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
];

exports.message_get = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("new_message");
  } else {
    let errorArray = [];
    let error = {
      msg: "You must sign in before viewing that page.",
    };
    errorArray.push(error);
    res.redirect("/home/login");

    // res.render("signup", {
    //   title: "Log in ",
    //   signingUp: false,
    //   errors: errorArray,
    // });
  }
};

exports.message_post = [
  body("messageTitle", "Title must be between 1 - 30 characters long.")
    .trim()
    .escape()
    .isLength({ min: 1, max: 30 }),
  body("newMessage", "Message must be between 1 - 1000 characters long.")
    .trim()
    .escape()
    .isLength({ min: 1, max: 1000 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("new_message", {
        errors: errors.array(),
      });
      return;
    }
    const userData = JSON.parse(req.body.user);
    const files = fs.readdirSync("./public/avatars/");
    randomAvatar = Math.floor(Math.random() * files.length);
    const date = format(new Date(), "yyyy-MM-dd @ HH:mm");
    const message = new Message({
      title: req.body.messageTitle,
      message: req.body.newMessage,
      user: userData._id,
      avatar: `avatars/${files[randomAvatar]}`,
      date: date,
    });
    message.save(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
];

exports.delete_post = function (req, res, next) {
  Message.findByIdAndDelete(req.body.messageId).exec((err, results) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
