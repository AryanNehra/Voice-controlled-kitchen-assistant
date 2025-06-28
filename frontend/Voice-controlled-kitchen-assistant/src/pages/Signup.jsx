import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import axios from '../api/axios';
import Notification from '../components/Notification'

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            showNotification('error', 'Name is required');
            return false;
        }
        if (!form.email.trim()) {
            showNotification('error', 'Email is required');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            showNotification('error', 'Please enter a valid email');
            return false;
        }
        if (!form.password) {
            showNotification('error', 'Password is required');
            return false;
        } else if (form.password.length < 6) {
            showNotification('error', 'Password must be at least 6 characters');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await axios.post('/auth/signup', form);
            showNotification('success', 'Signup successful! Welcome aboard!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            showNotification('error', 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join us today and get started</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Create a strong password"
                                    className="w-full px-4 py-3 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="px-3 py-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                    <div className="pr-3 pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Creating Account...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Create Account
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}