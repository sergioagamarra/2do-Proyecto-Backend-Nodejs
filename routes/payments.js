const express = require("express")
const authValidation = require("../middleware/auth")
const PaymentsService = require("../services/payments")

function payments(app){
    const router = express.Router()

    app.use("/api/payments", router)
    const paymentsServ = new PaymentsService()

    router.get("/user", authValidation(1), async (req, res) => {
        const result = await paymentsServ.getUserPayments(req.user.id)
        return res.json(result)
    })

    router.get("/", authValidation(2), async (req, res) => {
        const result = await paymentsServ.getAll()
        return res.json(result)
    })

}

module.exports = payments