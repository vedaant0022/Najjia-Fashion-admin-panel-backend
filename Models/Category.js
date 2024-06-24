const { Schema, models, model, default: mongoose } = require("mongoose");

const CategorySchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    parent: {
        // type: mongoose.Types.ObjectId,
        // ref: 'Category'
        type: String
    },
})

export const Category = models?.Category || model('Category', CategorySchema);