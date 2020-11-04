const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/User");

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        User.findOne({ email }, (err, user) => {
            if (err) {
                return done(err);
            } else if (!user) {
                // Invalid email
                return done(null, false, {
                    message: "No user with that email",
                });
            } else if (!bcrypt.compare(password, user.password)) {
                // Invalid password
                return done(null, false, { message: "Password incorrect" });
            }
            return done(null, user);
        });

        // const user = getUserByEmail(email);
        // if (user == null) {
        //     return done(null, false, { message: "No user with that email" });
        // }

        // try {
        //     if (await bcrypt.compare(password, user.password)) {
        //         return done(null, user);
        //     } else {
        //         return done(null, false, { message: "Password incorrect" });
        //     }
        // } catch (e) {
        //     return done(e);
        // }
    };

    passport.use(
        new LocalStrategy({ usernameField: "email" }, authenticateUser)
    );
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findOne({ _id: id }, (err, user) => {
            if (err) {
                return done(err);
            } else if (!user) {
                // Invalid email
                return done(null, false, {
                    message: "No user with that email",
                });
            }
            // console.log(user);
            return done(null, user);
        });
    });
}

module.exports = initialize;
