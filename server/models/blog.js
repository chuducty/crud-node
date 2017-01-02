var mongoose = require('mongoose');
var Blog  = mongoose.model('Blog',{
  text: {
    type:String,
    required: true,
    minlength: 1
  },
  title: {
    type:String,
    required: true,
    minlength: 1
  },
  image: {
    type:String
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Blog};
