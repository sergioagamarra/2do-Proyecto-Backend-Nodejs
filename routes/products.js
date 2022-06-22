const express = require("express")
const ProductsService = require("../services/products")
const authValidation = require("../middleware/auth")
const { json } = require("express")

function products(app){
    const router = express.Router()
    const productsServ = new ProductsService()

    app.use("/api/products", router)

    router.get("/", authValidation(1), async (req, res) => {
        const result = await productsServ.getAll()
        return res.json(result)
    })

    router.get("/:idProduct", authValidation(2), async (req, res) => {
        const result = await productsServ.getById(req.params.idProduct)
        return res.json(result)
    })

    router.post("/", authValidation(2), async (req, res) => {
        const result = await productsServ.create({
            ...req.body,
            owner: req.user.id
        })
        return res.json(result)
    })

    router.put("/:idProduct", authValidation(2), async (req, res) => {
        const result = await productsServ.update(req.params.idProduct, req.body)
        return res.json(result)
    })

    router.delete("/:idProduct", authValidation(2), async (req, res) => {
        const result = await productsServ.delete(req.params.idProduct)
        return res.json(result)
    })

    router.post("/price", authValidation(1), async (req, res) => {
        const result = await productsServ.filterByPrice(req.body)
        return res.json(result)
    })

    router.post("/category", authValidation(1), async (req, res) => {
        const result = await productsServ.filterByCategory(req.body)
        return res.json(result)
    })

    router.post("/category-and-price", authValidation(1), async (req, res) => {
        const result = await productsServ.filterByCategoryAndPrice(req.body)
        return res.json(result)
    })

    router.post("/category-and-range-price", authValidation(1), async (req, res) => {
        const result = await productsServ.filterByCategoryAndRangePrice(req.body)
        return res.json(result)
    })
}

module.exports = products