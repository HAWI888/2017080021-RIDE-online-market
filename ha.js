//jshint esversion:8
require("dotenv").config();
import express, { static } from "express";
import { urlencoded } from "body-parser";
import bcrypt from "bcryptjs";
import passport, { initialize, session as _session } from "passport";
import session from "express-session";
import flash from "express-flash";
import override from "method-override";
const app = express();
const users = [];
app.use(static("public"));
app.use(urlencoded({ extended: false }));
app.set("view engine", "ejs");
import initializePassport from "./passport-config";
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    save: false,
    resave: true,
    saveUninitialized: false
  })
);
app.use(override("_method"));
app.use(initialize());
app.use(_session());


app.get("/", (req, res)=>{
    res.sendFile(__dirname +"/index.html");
});
app.get("/about", (req, res) => {
   res.sendFile(__dirname + "/about.html");
});
app.get("/contact-us", (req, res) => {
   res.sendFile(__dirname + "/contact-us.html");
});
app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});
app.get("/register", canNotGoBackIfLoggedIn, (req, res) => {
  res.render("register");
});
app.get("/login", canNotGoBackIfLoggedIn, (req, res) => {
  res.render("login");
});

app.get("/user", canNotGoToUserWithOutLogIn, (req, res) => {
      res.render("user", { users: users });
    });
    app.post(
      "/login",
      canNotGoBackIfLoggedIn,
      passport.authenticate("local", {
        successRedirect: "/user",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: true
      })
    );
    app.post("/register", canNotGoBackIfLoggedIn, async (req, res) => {
      try {
        const hashPass = await bcrypt.hash(req.body.password, 10);
        users.push({
          id: Date.now().toString(),
          name: req.body.name,
          email: req.body.email,
          password: hashPass
        });
        res.redirect("/login");
      } catch (error) {
        res.redirect("/register");
      }
      console.log(users);
    });
    
    function canNotGoToUserWithOutLogIn(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect("/login");
    }
    
    function canNotGoBackIfLoggedIn(req, res, next) {
      if (req.isAuthenticated()) {
        return res.redirect("/user");
      }
      next();
    }
    
    let port = process.env.PORT;
    if (port == null || port == "") {
      port = 3000;
    }
    app.listen(port);
    