const dbError = require("../helpers/dbError")
const UserModel = require("../models/user")
const CartsService = require("../services/carts")

const uuid = require("uuid")

class User{
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

    async create(data){
        try{
            const user = await UserModel.create(data)
            const cartsServ = new CartsService()
            const cart = await cartsServ.create(user.id)
            return {
                created: true,
                user
            }
        }
        catch(error){
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
            try {
                user = await UserModel.create(newData)
                const cartServ = new CartService()
                const cart = await cartServ.create(user.id)
            } catch (error) {
                if(error.code === 11000 && error.keyValue.email){ // Duplicated entry
                    const email = error.keyValue.email
                    const provider = "provider." + data.provider
                    const idProvider = "idProvider." + data.provider
                    user = await UserModel.updateOne({
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
}

module.exports = User

