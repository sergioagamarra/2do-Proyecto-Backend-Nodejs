const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config")
const User = require("./users")
const dbError = require("../helpers/dbError")
const { db } = require("../models/user")

class Auth {

    // Inicio de sesión
    async login(data) {
        try {
            const {email, password} = data
            const userServ = new User()
            const user = await userServ.getByEmail(email)
            if(user && await this.#compare(password, user.password)){
                return this.#getUserData(user)
            }
            return {
                success: false,
                errors: [{
                    credentials: "The credentials are incorrect"
                }]
            }
        } catch (error) {
            console.log(error);
            return dbError(error)
        }
    }

    // Registro de nuevo usuario
    async signup(data) { 
        try {
            if(data && data.password){
                data.password = await this.#encrypt(data.password)
            }
            data.provider = {
                local: true
            }
            const userServ = new User()
            const result = await userServ.create(data)
            if(!result.created){
                return {
                    success: false,
                    errors: result.errors
                }
            }
            return this.#getUserData(result.user)
        } catch (error) {
            console.log(error);
            return dbError(error)
        }
        
    }

    // Muestra los datos del usuario a excepción de su password
    #getUserData(user) {
        const userData = {
            name: user.name,
            email: user.email,
            id: user.id,
            role: user.role,
            provider: user.provider,
            idProvider: user.idProvider,
            stripeCustomerID: user.stripeCustomerID
        }

        const token = this.#createToken(userData)
        return {
            success: true,
            user: userData,
            token
        }
    }

    // Creación del token
    #createToken(payload) {
        const token = jwt.sign(payload, jwtSecret,{
            expiresIn: '7d'
        })
        return token
    }

    // Encripta información sensible por ej: password del usuario
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

    // Compara la información con su imagen encriptada
    async #compare(string, hash) {
        try {
            return await bcrypt.compare(string,hash)
        } 
        catch (error) {
            return false
        }
    }

    // Registro con red social, en caso de ya estar registrado el usuario conecta la cuenta.
    async socialLogin(data) {
        try {
            const userServ = new User()
            const user = {
                idProvider: data.id,
                name: data.displayName,
                email: data.emails[0].value,
                profilePic: data.photos[0].value,
                provider: data.provider
            }
            const result = await userServ.getOrCreateByProvider(user)
            if(!result.created){
            // Verificar si el correo está en uso
                return {
                    success: false,
                    errors: result.errors
                }
            }
            return this.#getUserData(result.user)
        } catch (error) {
            console.log(error);
            return dbError(error)
        }
        
    } 
}

module.exports = Auth