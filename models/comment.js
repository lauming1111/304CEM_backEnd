const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  comment: {
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
  rate: {
    type: Number,
    required: false
  },
  recipeId: {
    type: String,
    required: true
  },
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});
module.exports = mongoose.model('Comment', CommentSchema);