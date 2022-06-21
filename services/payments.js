const { stripeSecretKey } = require("../config")
const stripe = require("stripe")(stripeSecretKey)
const endpointSecret = "whsec_2dcdd531f49ecfbacc3522e84020a3d4eb437803a75bcc69cae5ec0e95a7d6cb";
const CartModel = require("../models/cart")
const UserModel = require("../models/user")
const PaymentModel = require("../models/payment")
const ProductsService = require("../services/products")

class Payments{
    
    // Creación del payment intents
    async createIntent(amount, idUser, stripeCustomerID) {
        const intent = await stripe.paymentIntents.create({
            amount,
            currency:"usd",
            customer: stripeCustomerID
        })
        return intent.client_secret
    }

    async confirm(data, signature) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(data, signature, endpointSecret);
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: `Webhook Error: ${error.message}`
            }
        }

        switch (event.type) {
            // Si el pago fue exitoso se limpia el carrito, se actualiza el stock de los productos y se registra el pago
            case 'payment_intent.succeeded':
                try {
                    const paymentIntent = event.data.object;
                    const stripeCustomerID = paymentIntent.customer
                    const cart = await this.clearCart(stripeCustomerID)
                    const productsServ = new ProductsService()
                    cart.items.forEach(item => {
                        const product = productsServ.updateStock(item._id, item.amount)
                    });
                     
                    const payment = await this.registerPayment(cart)
                    break;
                } catch (error) {
                    console.log(error)
                    return error
                }

            default:
              console.log(`Unhandled event type ${event.type}`);
        }

        return {
            success: true,
            message: "Ok"
        }
    }

    // Borra los productos del carrito
    async clearCart(stripeCustomerID){
        const user = await UserModel.findOne({stripeCustomerID})
        const cart = await CartModel.findByIdAndUpdate(user.id, {
            items: []
        })
        return cart
    }

    async registerPayment(cart){
        const payment = await PaymentModel.findByIdAndUpdate(cart._id, {
            $push: {
                payments: {
                    items: cart.items
                }
            }
        })
        return payment
    }

    async create(idUser){
        try {
            const payment = await PaymentModel.create({
                _id: idUser,
                payments: []
            })
            return payment
        } catch (error) {
            console.log(error)
            return dbError(error)
        }
    }

    async getUserPayments(idUser) {
        try {
            const payment = await PaymentModel.findById(idUser)
            return payment.payments
        } catch (error) {
            console.log(error);
            return error
        }
    }

    async getAll(){
        try {
            const payments = await PaymentModel.find()
            return payments
        } catch (error) {
            console.log(error);
            return error
        }
    }
}

module.exports = Payments