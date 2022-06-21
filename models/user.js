const {mongoose} = require("../config/db")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "No less than 3 characters"],
        maxlength: [100, "No more than 100 characters"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: [true, "Email already registered"],
        match: [/^[\w\.-]+@[\w]+\.[\.\w]+$/, "Invalid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: Number,
        default: 1
    },
    profilePic: String,
    provider: {
        local: Boolean,
        facebook: Boolean,
        google: Boolean,
        twitter: Boolean,
        github: Boolean
    },
    idProvider: {
        facebook: String,
        google: String,
        twitter: String,
        github: String
    },
    stripeCustomerID: String
})

const UserModel = mongoose.model("user", userSchema)

module.exports = UserModel