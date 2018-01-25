var mongoose = require('mongoose');

var RecipeSchema = new mongoose.Schema({
    url: String,
    title: String,
    imageUrl: String,
    dietLabels: String,
    likes: Number
});

var Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;