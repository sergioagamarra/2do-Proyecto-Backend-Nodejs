const express = require("express")
const CartsService = require("../services/carts")
const authValidation = require("../middleware/auth")

function carts(app){
    const router = express.Router()
    const cartsServ = new CartsService()

    app.use("/api/carts", router)

    router.get("/", authValidation(1), async (req, res) => {
        const result = await cartsServ.getItems(req.user.id)
        return res.json(result)
    })

    router.post("/add", authValidation(1), async (req, res) => {
        const {idProduct, amount} = req.body
        const result = await cartsServ.addToCart(req.user.id, idProduct, amount)
        return res.json(result)
    })

    router.delete("/remove", authValidation(1), async (req,res) => {
        const {idProduct} = req.body
        const result = await cartsServ.removeFromCart(req.user.id, idProduct)
        return res.json(result)
    })

    router.get("/pay-stripe", authValidation(1), async (req, res) => {
        const result = await cartsServ.pay(req.user.id, req.user.stripeCustomerID)
        return res.json(result)
    })

    router.post("/clearCart", authValidation(1), async (req, res) => {
        const result = await cartsServ.clearCart(req.user.id)
        return res.json(result)
    })
}

module.exports = carts