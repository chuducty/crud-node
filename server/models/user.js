var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  }
});
UserSchema.methods.toJSON = function(){
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject,['_id','email']);
};


UserSchema.statics.findByCredentials = function(email,password){
  var User = this;
  return User.findOne({email}).then((user) => {
    if (!user){
      console.log('ahihi');
      return Promise.reject();
    }
    // because bcrypt is callback
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (!res){
          reject();
        }
        resolve(user);
      });
    });
  })
}


UserSchema.pre('save', function (next) {
  var user = this;
  if (user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      //console.log(`Salt: ${salt}`)
      bcrypt.hash(user.password, salt, (err, hash) => {
        //console.log(`Hash: ${hash}`);
        user.password = hash;
        next();
      })
    });
  }
  else {
    next();
  }
})

var User = mongoose.model('User', UserSchema);

module.exports = {User};
