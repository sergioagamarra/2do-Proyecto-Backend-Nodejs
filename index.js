const express = require("express")
const morgan = require("morgan")
const cookie = require("cookie-parser")
const { port, sessionSecret } = require("./config")
const { connection } = require("./config/db")
const passport = require("passport")
const cors = require("cors")
const session = require("express-session")

// Routes:
const auth = require("./routes/auth")
const users = require("./routes/users")
const { useGoogleStrategy, useFacebookStrategy, useTwitterStrategy, useGitHubStrategy  } = require("./middleware/authProvider")

const app = express()


connection()

// Cookies. Diferentes tipos de cookies. HTTP Only Cookie

// Utilizando middleware
app.use(morgan("dev"))
app.use(express.json())
app.use(cookie())
app.use(cors({
    origin:["http://localhost:3000"],
    credentials:true
}))
app.use(session({
    secret:sessionSecret,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
// Usando strategias
passport.use(useGoogleStrategy())
passport.use(useFacebookStrategy())
passport.use(useTwitterStrategy())
passport.use(useGitHubStrategy())

passport.serializeUser((user,done)=>{
    done(null,user)
})
passport.deserializeUser((user,done)=>{
    done(null,user)
})



// Usando rutas:
auth(app)
users(app)

app.get("/", (req, res) => {
    return res.json({
        name: "Ecommerce"
    })
})

app.listen(port, () => {
    console.log("Listening on: http://localhost:" + port)
})
