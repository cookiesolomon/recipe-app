var $recipeList = $(".recipe-list"); // search for recipes form

var recipesApp = function () {
    var recipes = [];
    var savedRecipes = [];
  
    function findRecipe(text) {
        var url = 'recipes?recipe=' + text;
        $.ajax({
            method: "GET",
            url: url,
            success: function (data) {
                if (data.length) {
                    console.log(data);
                    recipes = data;
                    _renderPage();
                } else (
                    alert("Sorry we dont have a recipe match")
                )
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    }

    function likeRecipe(index) {
        var recipe = recipes[index];
        $.ajax({
            method: "POST",
            url: 'recipes',
            data: recipe,
            success: function (data) {
                savedRecipes.push(data);
                console.log(savedRecipes);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    }


  function popularRecipes() {

    $.ajax({
      method: "GET",
      url: 'popular',
      success: function (data) {
        savedRecipes = data;
        _renderPopular();

      }, error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
    };

    function deletePopularRecipe(index) {
        $.ajax({
            type: 'DELETE',
            url: '/recipes' + recipes[index]._id,
            success: function (data) {
                savedRecipes.splice(index, 1);
                renderPage();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    }

    // goes through the recipes array and puts them on the screen, using the handlebars template
  function _renderPage() {
        $recipeList.empty();
        var source = $('#recipe-template').html();
        var template = Handlebars.compile(source);
        var recipeData = { "recipeArray": recipes };
        var newHTML = template(recipeData);
        $('.recipe-list').append(newHTML);

      }

  function _renderPopular(){

    $(".popular-recipes").empty();
    var source = $('#popular-template').html();
    var template = Handlebars.compile(source);
    var popularData = { "popularArray": savedRecipes };
    var newHTML = template(popularData);
    $('.popular-recipes').append(newHTML);

  }    


  return {
      findRecipe: findRecipe,
      likeRecipe: likeRecipe,
      popularRecipes: popularRecipes
    };
  };

  

  var app = recipesApp();

  // click button "get recipes": 
  $(".main-btn").on('click', function () {
    var $input = $(".main-input");
    if ($input.val() === "") {
      alert("Please enter text");
    }
    else {
      app.findRecipe($input.val());
      $input.val("");
    }
  })

  $recipeList.on('click', '.like-button', function () {
    var index = $(this).closest('.recipe-container').index();
    app.likeRecipe(index);
  });

  //click for popular recipes

  $(".find-popular").on('click', function () {

    app.popularRecipes();

  });

  $recipeList.on('click', '.remove-recipe', function () {
      var index = $(this).closest('.recipe-container').index();
      app.deletePopularRecipe(index);
  });