const {mongoose} = require("../config/db")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        minlength: [3, "No less than 3 characters"],
        maxlength: [100, "No more than 100 characters"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
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
    birthday: {
        type: Date,
        required: [true, "Birthday is required"],
        trim: true
    },
    role: {
        type: Number,
        default: 1
    }
})

const UserModel = mongoose.model("user", userSchema)

module.exports = UserModel