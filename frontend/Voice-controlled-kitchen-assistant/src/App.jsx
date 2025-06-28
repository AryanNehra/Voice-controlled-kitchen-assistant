import './App.css'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import SavedRecipes from './pages/SavedRecipes';
import NotFound from './pages/NotFound';

const isLoggedIn = () => !!localStorage.getItem('token');

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/saved" element={isLoggedIn() ? <SavedRecipes /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
