const express = require("express")
const CartsService = require("../services/carts")
const authMiddleware = require("../middleware/auth")

function carts(app){
    const router = express.Router()
    const cartsServ = new CartsService()

    app.use("/api/carts", router)

    router.get("/", authMiddleware(1), async (req, res) => {
        const result = await cartsServ.getItems(req.user.id)
        return res.json(result)
    })

    router.post("/", authMiddleware(1), async (req, res) => {
        const {idProduct, amount} = req.body
        const result = await cartsServ.addToCart(req.user.id, idProduct, amount)
        return res.json(result)
    })
}

module.exports = carts