const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    details: {
        type: String
    },
    brand: {
        type: String
    },
    colors: {
        type: String
    },
    sizes: {
        type: String
    },
    gender: {
        type: String
    },
    images: [{
        type: String
    }],
    category: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Products', ProductSchema); // Ensure the model name is singular 'Product'
