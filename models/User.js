const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    bio: String,
    image: String,
});

module.exports = mongoose.model("User", userSchema);
