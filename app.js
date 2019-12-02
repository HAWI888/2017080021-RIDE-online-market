//jshint esversion:8
require("dotenv").config();
const express = require("express");
const bodyParse = require("body-parser");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
const override = require("method-override");
const app = express();
const users = [];
app.use(express.static("public"));
app.use(bodyParse.urlencoded({ extended: false }));
app.set("view engine", "ejs");
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    save: false,
    resave: true,
    saveUninitialized: false
  })
);
app.use(override("_method"));
app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res)=>{
    res.sendFile(__dirname +"/index.html");
});
app.get("/about", (req, res) => {
   res.sendFile(__dirname + "/about.html");
});
app.get("/cart", (req, res) => {
   res.sendFile(__dirname + "/cart.html");
});
app.get("/checkout", (req, res) => {
   res.sendFile(__dirname + "/checkout.html");
});
app.get("/contact-us", (req, res) => {
   res.sendFile(__dirname + "/contact-us.html");
});
app.get("/my-account", (req, res) => {
   res.sendFile(__dirname + "/my-account.html");
});
app.get("/service", (req, res) => {
   res.sendFile(__dirname + "/service.html");
});
app.get("/shop-detail", (req, res) => {
   res.sendFile(__dirname + "/shop-detail.html");
});
app.get("/shop", (req, res) => {
  res.sendFile(__dirname + "/shop.html");
});
app.get("/wishlist", (req, res) => {
  res.sendFile(__dirname + "/wishlist.html");
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.get("/register", canNotGoBackIfLoggedIn, (req, res) => {
  res.render("register");
});
app.get("/login", canNotGoBackIfLoggedIn, (req, res) => {
  res.render("login");
});

app.get("/user", canNotGoToUserWithOutLogIn, (req, res) => {
  res.render("user", { users: users });
});
app.post(
  "/login",
  canNotGoBackIfLoggedIn,
  passport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true
  })
);
app.post("/register", canNotGoBackIfLoggedIn, async (req, res) => {
  try {
    const hashPass = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashPass
    });
    res.redirect("/login");
  } catch (error) {
    res.redirect("/register");
  }
  console.log(users);
});

function canNotGoToUserWithOutLogIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function canNotGoBackIfLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/user");
  }
  next();
}



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
