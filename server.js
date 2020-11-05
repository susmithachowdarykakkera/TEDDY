if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const multer = require("multer");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodoverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");

const User = require("./models/User");

const initializePassport = require("./passport-config");
initializePassport(passport);

app.set("views-engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodoverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", {
        name: req.user.name,
        bio: req.user.bio,
        image: req.user.image,
    });
});
app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get("/editprofile", checkAuthenticated, (req, res) => {
    res.render("edit.ejs", {
        name: req.user.name,
        bio: req.user.bio,
        image: req.user.image,
    });
});

app.post("/editprofile", checkAuthenticated, (req, res) => {
    const name = req.body.name;
    const bio = req.body.bio;
    const id = req.user._id;

    // AES-S3 bucket url
    // const image = data.Location

    const image = req.user.image;

    User.findByIdAndUpdate(id, { name, bio, image }, { new: true })
        .then((newUserData) => {
            req.user = newUserData;
            res.redirect("/");
        })
        .catch((error) => res.status(401).json(error));
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
        // const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        user.save(function (err, savedUser) {
            if (err) {
                console.log(err);
                res.redirect("/signup");
            }
            console.log("----------Signup Success--------");
            console.log(savedUser);
            res.redirect("/login");
        });
    } catch (err) {
        console.log(err);
        res.redirect("/signup");
    }
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

mongoose.connect("mongodb+srv://sush:sush@cluster0.fyiyl.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) =>
    console.error("Error at connecting the MongodB :" + error)
);
db.once("open", () =>
    console.log("MongoDB connection established sucessfully")
);

app.listen(8000, () => {
    console.log(`Server started on port`);
});
