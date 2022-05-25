const express = require("express")
const { authResponse, deleteCookie } = require("../helpers/authResponse")
const AuhtService = require("../services/auth")

function auth(app){
    const router = express.Router()
    app.use("/api/auth", router)
    const authServ = new AuhtService()

    router.post("/login", async (req, res) => {
        const result = await authServ.login(req.body)
        /* const token = result.token
        return res.cookie("token", token, {
            httpOnly: true,
            secure: false, //Solo disponible a través de https*
            sameSite: "none",
            expires: new Date(new Date().setDate(new Date().getDate() + 7))
        }).json(result) */
        return authResponse(res, result, 401)
    })

    router.post("/signup", async (req, res) => {
        const result = await authServ.signup(req.body)
        return authResponse(res, result, 400)
    })

    router.get("/logout", (req, res) => {
        return deleteCookie(res)
    })
}

module.exports = auth