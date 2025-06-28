import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, BookOpen, Zap, Trash2 } from 'lucide-react';
import Notification from '../components/Notification';

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchSavedRecipes = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const res = await axios.get('/recipes/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(res.data);
    } catch (err) {
      showNotification('error', 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const deleteRecipe = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(`/recipes/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      showNotification('success', 'Recipe deleted successfully!');
    } catch (err) {
      showNotification('error', 'Failed to delete recipe');
    }
  };

  const loadToDashboard = (recipe) => {
    localStorage.setItem('loadedRecipe', JSON.stringify(recipe));
    showNotification('success', 'Recipe loaded to dashboard!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600 font-medium">Loading your saved recipes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍳 Your Saved Recipes
          </h1>
          <p className="text-gray-600 text-lg">
            {recipes.length} delicious recipe{recipes.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No saved recipes yet</h2>
            <p className="text-gray-500 mb-6">Start saving your favorite recipes to see them here!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Discover Recipes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Recipe Image */}
                {recipe.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <div className="text-6xl opacity-50">🍽️</div>
                  </div>
                )}

                {/* Recipe Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {recipe.title}
                  </h2>

                  {/* Source Link */}
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium mb-4 transition-colors duration-200"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Full Recipe
                  </a>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => loadToDashboard(recipe)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Load
                    </button>
                    <button
                      onClick={() => deleteRecipe(recipe._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}