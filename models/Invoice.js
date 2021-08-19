const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
    invoiceNumber:{
        type:Number,
        required: true,
        unique:true
    },
    type:{
        type: String,
        enum:["invoice","returnInvoice","future","emptyCharge","emptyDischarge"], //emptyDischarge is used to reduce the amount due from a supplier which is done when paying money for a supplier
        required: true                                                            //emptyCharge is used to increase the amount due to a supplier which is done if we are late to pay a supplier
    },
    //In case of emptyCharge or emptyDischarge invoices cliendId could be used as a supplierId
    clientId:{
        type:Schema.Types.ObjectId,
        required: true,
        ref:'Client'
    },
    userId:{
        type:Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                required: true,
                ref:'Product'
            },
            quantity:{
                type:Number,
                required: true,

            },
            unitPrice:{
                type:Number,
                required: true,
            },
            tax:{
                type:Number,
                required:true
            },
            discounts:[
                {
                    discountId:{
                        type:Schema.Types.ObjectId,
                    }
                }
            ],
            discountPercentage:{
                type: Number
           },
        }
    ],
    totalPrice:{
        type:Number,
        required:true
    },
    creationDate:{
        type:Date,
        required: true
    },
    history:[
        {
            date: {
              type: Date,
              required: true,
            },
            comment: {
              type: String,
              required: true,
              maxlength:280
            }
          }
    ]
}) 

InvoiceSchema.methods.toJSON = function () {
    const invoice = this;
    const publicInvoice = invoice.toObject();
    const todayTime = new Date(publicInvoice.creationDate);
    const month = (todayTime.getMonth() + 1);
    const day = (todayTime.getDate());
    const year = (todayTime.getFullYear());
    publicInvoice.creationDate = day + "/" + month + "/" +  year;
    return publicInvoice
}


module.exports = Invoice = mongoose.model("Invoice",InvoiceSchema)
