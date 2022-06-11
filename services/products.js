const ProductModel = require("../models/product")
const CartModel = require("../models/product")

class Products{
    async getAll(){
        const products = await ProductModel.find()
        return products
    }

    async create(data){
        const product = await CartModel.create(data)
        return product
    }
}

module.exports = Products