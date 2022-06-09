/* const duplicatedError = require("./duplicatedError")
const validationError = require("./validationError") */

function dbError(error){
    if(error.code === 11000){
        return {
            created: false,
            errors: duplicatedError(error.keyValue)
        }
    }
    // Error en la validacion de datos
    return {
        created: false,
        errors: validationError(error.errors)
    }
}

function duplicatedError(error){
    const errors = Object.keys(error).map(field => ({
        message:`The ${field} '${error[field]}' is already in use`,
        field
    }))
    return errors
}

function validationError(errors) {
    // let messages = []
    // // for(let error of Object.values(errors)){
    // //     messages.push(error.message)
    // // }
    const messages = Object.values(errors).map(error => ({message: error.message, field: error.path}))
    return messages
}


module.exports = dbError