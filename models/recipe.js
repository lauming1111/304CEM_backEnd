const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  name: {
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
  context: {
    type: String,
    required: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdComments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
});
module.exports = mongoose.model('Recipe', recipeSchema);