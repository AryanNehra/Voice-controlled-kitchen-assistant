const express = require('express')
const recipesRouter = express.Router();
const auth = require('../middleware/auth')

const recipesController = require('../controllers/recipesController')

recipesRouter.use(auth);
recipesRouter.get('/search/:query', recipesController.getRecipeFromSpoonacular);
recipesRouter.post('/save', recipesController.postSave);
recipesRouter.get('/saved', recipesController.getSavedRecipes);
recipesRouter.delete('/delete/:id', recipesController.deleteRecipe);

module.exports = recipesRouter;
