const {mongoose} = require("../config/db")

const paymentSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    payments:  [
        {
            items: [
                {
                    _id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "product"
                    },
                    amount: Number
                }
            ],
            date: {
                type: Date,
                default: Date.now
            }
        }    
    ]

})  

const PaymentModel = mongoose.model("payment", paymentSchema)

module.exports = PaymentModel