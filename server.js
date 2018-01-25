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
    var url = "";
    if (req.query.diet) {
        url = `https://api.edamam.com/search?q=${req.query.recipe}&app_id=a41229b4&app_key=
                e271a0d52d0ae4abe4ecd96af53df16a&from=0&to=8&diet=${req.query.diet}`;
    } else {
        url = `https://api.edamam.com/search?q=${req.query.recipe}&app_id=a41229b4&app_key=
                e271a0d52d0ae4abe4ecd96af53df16a&from=0&to=8`;
    }

    request(url, function (error, response, body) {
        if (error) { return console.error(error); }
        if (response.statusCode == 200) {
            var recipes = JSON.parse(body);
            recipes = recipes.hits.map(function (element) {
                return {
                    url: element.recipe.url, title: element.recipe.label, imageUrl: element.recipe.image,
                    dietLabels: element.recipe.dietLabels, likes: 0
                };
            });
            // console.log(recipes);
            res.send(recipes);
            
        // error 403 = no results found
        } else if (response.statusCode == 403) {
            res.send([]);
        // error 401 = problem with API website (send dummy-data)
        } else if (response.statusCode == 401) {
            res.send(
                [{
                    url: 'http://notwithoutsalt.com/cocoa-nib-coffee-cake/',
                    title: 'Cocoa Nib Coffee Cake',
                    imageUrl: 'https://www.edamam.com/web-img/81f/81f4d26be177e2a2a7edf7628137528f.jpg',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'http://www.seriouseats.com/recipes/2012/08/blueberry-marble-swirl-coffee-cake-recipe.html',
                    title: 'Blueberry Marble Coffee Cake Recipe',
                    imageUrl: 'https://www.edamam.com/web-img/50b/50b4b152d4f04ba00787a3aaf9710e0c.jpg',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'http://www.lottieanddoof.com/2009/07/sour-cherry-coffee-cake/',
                    title: 'Sour Cherry Coffee Cake',
                    imageUrl: 'https://www.edamam.com/web-img/4b0/4b00551dd1d9dc9cd4b00abb3b124a65.jpg',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'http://www.myrecipes.com/recipe/holiday-cream-cheese-coffee-cake-10000001687537/',
                    title: 'Holiday Cream Cheese Coffee Cake',
                    imageUrl: 'https://www.edamam.com/web-img/ca7/ca7dca258c29a54bfd9b68f7ea46dd5e.jpg',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'https://food52.com/recipes/15470-modest-walnut-coffee-cake',
                    title: 'Modest walnut coffee cake',
                    imageUrl: 'https://www.edamam.com/web-img/9aa/9aa6dc90fdadb1cba0d26b6c05afd6c4.png',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'http://recipes.prevention.com/Recipe/third-cuppa-coffee-cake.aspx',
                    title: 'Third- Cuppa- Coffee Cake',
                    imageUrl: 'https://www.edamam.com/web-img/383/383aba1d5440be7badf45592ac610542.jpg',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'http://thepioneerwoman.com/cooking/2009/08/coffee-cake-literally/',
                    title: 'Coffee Cake (Literally)',
                    imageUrl: 'https://www.edamam.com/web-img/2b8/2b87cb7f9596d17c10be487d72a9e28d.jpg',
                    dietLabels: [],
                    likes: 0
                },
                {
                    url: 'http://www.bonappetit.com/recipe/chocolate-chip-coffee-cake',
                    title: 'Chocolate Chip Coffee Cake',
                    imageUrl: 'https://www.edamam.com/web-img/439/4391fd3895d43bf9f44b23f4f531eccf.jpg',
                    dietLabels: [],
                    likes: 0
                }]);
        }
    });
});

// add a recipe to the DB
app.post('/recipes', function (req, res) {
    if (req.body.likes > 0) {
        req.body.likes++;
        Recipe.findOneAndUpdate({ url: req.body.url, title: req.body.title }, { $set: req.body }, { new: true },
            function (error, result) {
                if (error) { return console.error(error); }
                res.send(result);
            });
    } else {
        req.body.likes++;
        var newRecipe = new Recipe(req.body);
        newRecipe.save(function (err, data) {
            if (err) { return console.error(err); }
            res.send(data);
        });
    }
});

// delete a recipe from DB
app.delete('/recipes/:recipeId', function (req, res) {
    if (req.query.likes > 1) {
        Recipe.findById(req.params.recipeId, function (error, result) {
            if (error) { return console.error(error); }
            result.likes--;
            result.save(function (err, data) {
                if (err) { return console.error(err); }
                res.send(data);
            });
        });
    } else {
        Recipe.findByIdAndRemove(req.params.recipeId, function (err, data) {
            if (err) { return console.error(err); }
            res.send(data);
        });
    }
});

// get all saved recipes from DB and send to client
app.get('/popular', function (req, res) {
    Recipe.find(function (error, result) {
        if (error) { return console.error(error); }
        res.send(result);
    });
});

app.listen(process.env.PORT || '8000', function () {
    console.log('you r connected to port 8000!');
});