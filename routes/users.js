const express = require("express")
const authValidation = require("../middleware/auth")
const UsersService = require("../services/users")

function users(app){
    const router = express.Router()

    app.use("/api/users", router)
    const usersServ = new UsersService()

    router.get("/", authValidation(2), async (req, res) => {
        const result = await usersServ.getAll()
        return res.json(result)
    })

    router.get("/:email", authValidation(2), async (req, res) => {
        const result = await usersServ.getByEmail(req.params.email)
        return res.json(result)
    })

    router.put("/:idUser", authValidation(2), async (req, res) => {
        const result = await usersServ.update(req.params.idUser, req.body)
        if (!result.success) {
            return res.status(400).json(result)
        }
        return res.json(result)
    })

    router.delete("/:idUser", authValidation(2), async (req, res) => {
        const result = await usersServ.delete(req.params.idUser)
        return res.json(result)
    })
}

module.exports = users