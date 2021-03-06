const { stripeSecretKey } = require("../config")
const dbError = require("../helpers/dbError")
const UserModel = require("../models/user")
const CartsService = require("../services/carts")
const PaymentsService = require("../services/payments")
const stripe = require("stripe")(stripeSecretKey)
const uuid = require("uuid")
const bcrypt = require("bcrypt")


class User{

    // Devuelve todos los usuarios 
    async getAll(){
        try {
            const users = await UserModel.find()
            return users
        } catch (error) {
            console.log(error);
            return error
        }
    }

    // Devuelve un usuario filtrado por su email
    async getByEmail(email){
        try{
            const user = await UserModel.findOne({email})
            return user
        }
        catch (error) {
            console.log(error)
            return error
        }
    }

    // Actualiza los datos de un usuario a partir de su id
    async update(idUser, data){
        try {
            data.password = await this.#encrypt(data.password)
            const user = await UserModel.findByIdAndUpdate(idUser, data, {new: true})
            if (user === null){
                return {
                    success: false,
                    message: "User not found"
                }
            }
            return user
        } catch (error) {
            console.log(error)
            return error
        }
    }

    // Elimina un usuario a partir de su id
    async delete(idUser){
        try {
            const user =  await UserModel.findByIdAndDelete(idUser, {new: true})
            return user
        } catch (error) {
            console.log(error)
            return error
        }
    }

    // Crea un usuario, al mismo tiempo se crea el customer de stripe, su carrito y sus registros de pago vacíos
    async create(data){
        let stripeCustomerID
        try{ 
            const customer = await stripe.customers.create({
                name: data.name,
                email: data.email
            }) 
            stripeCustomerID = customer.id
            const user = await UserModel.create({
                ...data,
                stripeCustomerID
            })
            const cartsServ = new CartsService()
            const cart = await cartsServ.create(user.id)

            const paymentsServ = new PaymentsService()
            const payment = await paymentsServ.create(user.id)

            return {
                created: true,
                user
            }
        }
        catch(error){
            const customer = await stripe.customers.del(stripeCustomerID)
            return dbError(error)
        }
    }

    // Crea un usuario a partir de una red social, en caso de ya existir el usuario se vincula la cuenta con la red social
    async getOrCreateByProvider(data){ 

        const userData = {
            provider: {
                [data.provider]: true
            },
            idProvider: {
                [data.provider]: data.idProvider
            }
        }
        let user = await UserModel.findOne(userData)
        if (!user) {
            data.password = uuid.v4()
            const newData = {
                ...data,
                ...userData
            }
            let stripeCustomerID
            try {
                const customer = await stripe.customers.create({
                    name: data.name,
                    email: data.email
                }) 
                stripeCustomerID = customer.id
                user = await UserModel.create({
                    ...newData,
                    stripeCustomerID
                })
                const cartsServ = new CartsService()
                const cart = await cartsServ.create(user.id)

                const paymentsServ = new PaymentsService()
                const payment = await paymentsServ.create(user.id)
            } catch (error) {
                const customer = await stripe.customers.del(stripeCustomerID)
                if(error.code === 11000 && error.keyValue.email){ // Duplicated entry
                    const email = error.keyValue.email
                    const provider = "provider." + data.provider
                    const idProvider = "idProvider." + data.provider
                    user = await UserModel.findOneAndUpdate({
                        email
                    }, {
                        [provider]: true,
                        [idProvider]: data.idProvider
                    }, {new: true})

                    return {
                        created: true,
                        user
                    }
                }
                return dbError(error)
            }
        }
        return {
            created: true,
            user
        }
    }

    // Función para encripar datos sensibles
    async #encrypt(string) {
        try{
            const salt = await bcrypt.genSalt()
            const hash = await bcrypt.hash(string,salt)
            return hash
        }
        catch(error){
            console.log(error)
        }
    }
}

module.exports = User

