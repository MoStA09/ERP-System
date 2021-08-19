const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientScema = new Schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
    products:[
        {
            productId: 
            {
                type:Schema.Types.ObjectId,
                required: true
                 
            }  
        } 
    ],
    subClients:    
    [
        {
            name: 
            {
                
                type:String,
                required: true
            },
            deleted:
            {
                type: Boolean,
                required: true,
                default:false        
            }   
        } 
    ],
    deleted:{
        type: Boolean,
        required: true,
        default:false        
    }
});

//this middleware will start before any find method except (ByIdAndDelete) to exclude the deleted clients 
ClientScema.pre(/^find(?!ByIdAndDelete)$/, function (next) {
    // this points to the current query
    this.find({ deleted: { $ne: true } });
    next();
  });  

module.exports = Client = mongoose.model("Client", ClientScema);
