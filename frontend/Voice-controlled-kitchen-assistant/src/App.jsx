import './App.css'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import SavedRecipes from './pages/SavedRecipes';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/saved" element={<SavedRecipes />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
