import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Home, Bookmark, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl border-b border-gray-700">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <ChefHat className="h-8 w-8 text-yellow-400" />
                        <Link
                            to="/"
                            className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent hover:from-yellow-300 hover:to-orange-300 transition-all duration-300"
                        >
                            Smart Kitchen
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {token ? (
                            <>
                                <Link
                                    to="/"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 group"
                                >
                                    <Home className="h-4 w-4 group-hover:text-yellow-400 transition-colors" />
                                    <span className="group-hover:text-yellow-400 transition-colors">Home</span>
                                </Link>
                                <Link
                                    to="/saved"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 group"
                                >
                                    <Bookmark className="h-4 w-4 group-hover:text-yellow-400 transition-colors" />
                                    <span className="group-hover:text-yellow-400 transition-colors">Saved</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 group ml-2"
                                >
                                    <LogOut className="h-4 w-4 group-hover:text-white transition-colors" />
                                    <span className="group-hover:text-white transition-colors">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 group"
                                >
                                    <LogIn className="h-4 w-4 group-hover:text-white transition-colors" />
                                    <span className="group-hover:text-white transition-colors">Login</span>
                                </Link>
                                <Link
                                    to="/signup"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-200 shadow-lg"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span>Sign Up</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-700 py-4 space-y-2">
                        {token ? (
                            <>
                                <Link
                                    to="/"
                                    onClick={closeMenu}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
                                >
                                    <Home className="h-5 w-5 text-yellow-400" />
                                    <span>Home</span>
                                </Link>
                                <Link
                                    to="/saved"
                                    onClick={closeMenu}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
                                >
                                    <Bookmark className="h-5 w-5 text-yellow-400" />
                                    <span>Saved</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 w-full text-left"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={closeMenu}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-600 transition-all duration-200"
                                >
                                    <LogIn className="h-5 w-5" />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={closeMenu}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-200"
                                >
                                    <UserPlus className="h-5 w-5" />
                                    <span>Sign Up</span>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}