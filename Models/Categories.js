const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  products:[{
    // type: String
    type: mongoose.Schema.Types.Mixed,
  }],
  image: {
    type: String,
   
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
