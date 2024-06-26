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
  createdTimestamp: {
    type: String,
    required: false
  },
  updateTimestamp: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: false
  },
  createdComments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  createdRecipes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Recipe'
    }
  ]
});
module.exports = mongoose.model('User', usersSchema);