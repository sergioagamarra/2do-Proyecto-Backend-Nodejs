const CartModel = require("../models/cart")
const UserModel = require("../models/user")
const dbError = require("../helpers/dbError")
const PaymentsService = require("../services/payments")

class Carts{

    // Devuelve todos los productos del carrito del usuario
    async getItems(idUser){
        try {
            const result = await CartModel.findById(idUser).populate("items._id")
            return result
        } catch (error) {
            console.log(error)
            return dbError(error)
        }
        
    }

    // Agrega un nuevo producto al carrito del usuario, en caso de ya estar cargado el producto aumenta su cantidad
    async addToCart(idUser, idProduct, amount){
        try {
            const product = await CartModel.findOne({
                _id: idUser,
                "items._id": idProduct
            })
            if (product) {
                const result = await CartModel.findOneAndUpdate({
                    _id: idUser,
                    "items._id": idProduct
                }, {
                    "$inc": {
                        "items.$.amount": amount
                    }
                }, {new: true}).populate("items._id")
                return result
            }
            const result = await CartModel.findByIdAndUpdate(idUser, {
                $push: {
                    items: {
                        _id: idProduct,
                        amount
                    }
                }
            }, {new: true}).populate("items._id")
            return result
        } catch (error) {
            console.log(error)
            return error
        }
    }

    // Remueve un producto del carrito a partir de su id
    async removeFromCart(idUser, idProduct){
        try {
            const result = await CartModel.findByIdAndUpdate(idUser, {
                $pull: {
                    items: {
                        _id: idProduct
                    }
                }
            }, {new: true})
            return result
        } catch (error) {
            console.log(error)
            return dbError(error)
        }
    }

    // Creación de carrito
    async create(idUser){
        try {
            const cart = await CartModel.create({
                _id: idUser,
                items: []
            })
            return cart
        } catch (error) {
            console.log(error)
            return dbError(error)
        }
    }

    // Función para pagar siempre y cuando haya productos en el carrito, stock y un total mayor a 0
    async pay(idUser, stripeCustomerID){
        try {
            const result = await this.getItems(idUser)
            if (result) {
                let checkStock = {
                    success: true,
                    message: []
                }
                result.items.forEach(item => {
                    if (item._id.stock < item.amount) {
                        checkStock.success = false
                        checkStock.message.push("Insufficient stock for product: " + item._id.name)
                    }
                });
                if (!checkStock.success) {
                    return checkStock
                }
                const total = result.items.reduce((result, item) => {
                    return result + (item._id.price * item.amount)
                }, 0) * 100

                if (total > 0) {
                    const paymentsServ = new PaymentsService()
                    const clientSecret = await paymentsServ.createIntent(total, idUser, stripeCustomerID)
                    return {
                        success: true,
                        clientSecret
                    }
                } else {
                    return {
                        success: false,
                        message: "Your account must be greater than 0"
                    }
                }

            } else {
                return {
                    success: false,
                    message: "You have no products in your shopping cart"
                }
            }
        } catch (error) {
            console.log(error)
            return error
        }
        
    }

    // Remueve todos los productos del carrito del usuario. Ya sea porque ya pagó o porque así lo desea el usuario
    async clearCart(idUser){
        try {
            const cart = await CartModel.findByIdAndUpdate(idUser, {
                items: []
            }, {new: true})
            return cart
        } catch (error) {
            console.log(error)
            return error
        }
    }
}

module.exports = Carts