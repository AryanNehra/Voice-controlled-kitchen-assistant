const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    sourceUrl: String,
    spoonacularId: Number,
    summary: String,
    image: String,
    instructions: [
        {
            text: String,
            time: Number
        }
    ],
    ingredients: [String],
}, { timestamps: true });


module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);