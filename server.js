var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');

mongoose.connect(process.env.CONNECTION_STRING || 'mongodb://localhost/appetizeDB');

var Recipe = require('./models/recipeModel');

var app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get recipes from Edamam API and send to client
app.get('/recipes', function (req, res) {
    var url = `https://api.edamam.com/search?q=${req.query.recipe}&app_id=a41229b4&app_key=
                e271a0d52d0ae4abe4ecd96af53df16a&from=0&to=8`;
    request(url, function (error, response, body) {
        if (error) { return console.error(error); }
        if (response.statusCode == 200) {
            var recipes = JSON.parse(body);
            if (recipes.hits.length) {
                recipes = recipes.hits.map(function (element) {
                    return {
                        url: element.recipe.url, title: element.recipe.label, imageUrl: element.recipe.image,
                        healthLabels: element.recipe.healthLabels
                    };
                });
                res.send(recipes);
            } else {
                res.send([]);
            }
        }
    });
});

// add a recipe to the DB
app.post('/recipes', function (req, res) {
    var newRecipe = new Recipe(req.body);
    newRecipe.save(function (err, data) {
        if (err) throw err;
        res.send(data);
    });
});


// get all saved recipes from DB and send to client
app.get('/popular', function (req, res) {
    Recipe.find(function (error, result) {
        if (error) { return console.error(error); }
        res.send(result);
    });
});

// app.delete('/recipes/:recipeId', function (req, res) {
//     Recipe.findByIdAndRemove(req.params.recipeId, function (err, data) {
//         if (err) throw err;
//         res.send(data);
//     });
// });


app.listen(process.env.PORT || '8000', function () {
    console.log('you r connected to port 8000!');
});