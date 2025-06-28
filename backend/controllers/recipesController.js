const SavedRecipe = require('../models/savedRecipe');
const axios = require('axios');

exports.getRecipeFromSpoonacular = async (req, res) => {
  const query = req.params.query;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const searchResponse = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        query,
        number: 1,
        instructionsRequired: true,
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });

    const recipeSummary = searchResponse.data.results?.[0];
    if (!recipeSummary) return res.status(404).json({ error: 'No matching recipe found' });

    const id = recipeSummary.id;

    const detailResponse = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });

    const fullRecipe = detailResponse.data;

    const steps = fullRecipe.analyzedInstructions?.[0]?.steps?.map((step) => ({
      text: step.step,
      time: step.length?.number || 5,
    })) || [];

    const ingredients = fullRecipe.extendedIngredients?.map((ing) => ing.original) || [];

    res.json({
      id: fullRecipe.id,
      title: fullRecipe.title,
      sourceUrl: fullRecipe.sourceUrl,
      summary: fullRecipe.summary,
      image: fullRecipe.image,
      instructions: steps,
      ingredients,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
};

exports.postSave = async (req, res, next) => {
  const { title, sourceUrl, spoonacularId, summary, image, instructions, ingredients } = req.body;

  if (!title || !sourceUrl || !spoonacularId || !summary || !Array.isArray(instructions) || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {

    const existing = await SavedRecipe.findOne({ user: req.userId, spoonacularId });
    if (existing) {
      return res.status(409).json({ message: 'Recipe already saved' });
    }

    const newRecipe = new SavedRecipe({
      user: req.userId,
      title,
      sourceUrl,
      spoonacularId,
      summary,
      image: image || '',
      instructions,
      ingredients,
    })
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipe' });
  }
}

exports.getSavedRecipes = async (req, res, next) => {
  try {
    const recipes = await SavedRecipe.find({ user: req.userId });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await SavedRecipe.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found or unauthorized' });
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
};
