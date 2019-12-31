const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdHomeworks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Homework'
    }
  ]
});
module.exports = mongoose.model('User', usersSchema);