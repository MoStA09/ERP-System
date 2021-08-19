const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'it',
      'store director',
      'salesman',
      'sales supervisor',
      'sales director',
      'financial director',
      'accounting supervisor',
      'accountant',
      'collector',
      'general manager',
    ],
    required: true,
  },   
  deleted: {
    type: Boolean,
    default: false,
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});  


//this middleware will start before any find method except (ByIdAndDelete) to exclude the deleted users 
UserSchema.pre(/^find(?!ByIdAndDelete)$/, function (next) {
  // this points to the current query  
  this.find({ deleted: { $ne: true } });  
  next();
});  
    
   
  

module.exports = User = mongoose.model('User', UserSchema);