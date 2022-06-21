const { stripeSecretKey } = require("../config")
const dbError = require("../helpers/dbError")
const UserModel = require("../models/user")
const CartsService = require("../services/carts")
const PaymentsService = require("../services/payments")
const stripe = require("stripe")(stripeSecretKey)
const uuid = require("uuid")
const bcrypt = require("bcrypt")


class User{
    async getAll(){
        try {
            const users = await UserModel.find()
            return users
        } catch (error) {
            console.log(error);
            return error
        }
    }

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

    async update(idUser, data){
        try {
            data.password = await this.#encrypt(data.password)
            const user = await UserModel.findByIdAndUpdate(idUser, data, {new: true})
            console.log(user);
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

    async delete(idUser){
        try {
            const user =  await UserModel.findByIdAndDelete(idUser, {new: true})
            return user
        } catch (error) {
            console.log(error)
            return error
        }
    }

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

