//modules
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
require("dotenv").config();
//mongo
const mongoDb = process.env.database;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
//server
const app = express();
app.set("views", path.join(__dirname, "views"));
//routes
const indexRouter = require("./routes/index");
const mainRouter = require("./routes/main_route");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
//passport
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/home", mainRouter);

app.listen(3000, () => console.log("app listening on port 3000!"));
