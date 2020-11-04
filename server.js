if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodoverride = require("method-override");
const mongoose = require("mongoose");

const User = require("./models/User");

const initializePassport = require("./passport-config");
initializePassport(
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
);

const users = [];

app.set("views-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodoverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", { name: req.user.name });
});
app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

app.get("/signup", checkNotAuthenticated, (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        user.save(function (err, savedUser) {
            if (err) {
                return next(err);
            }
            console.log("----------Signup Success--------");
            console.log(savedUser);
            res.redirect("/login");
        });

        // users.push({
        //     id: Date.now().toString(),
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword,
        // });
        // res.redirect("/login");
    } catch {
        res.redirect("/signup");
    }
    console.log(users);
});

app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

mongoose.connect(process.env.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) =>
    console.error("Error at connecting the MongodB :" + err)
);
db.once("open", () =>
    console.log("MongoDB connection established sucessfully")
);

app.listen(8000);
