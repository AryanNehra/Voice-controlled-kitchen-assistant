import {CheckCircle, XCircle, X } from 'lucide-react';

export default function Notification({ type, message, onClose }) {
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out transform animate-in slide-in-from-top-2`}>
            <div className="flex items-start">
                <Icon className={`h-5 w-5 ${iconColor} mt-0.5 mr-3 flex-shrink-0`} />
                <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor}`}>
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className={`ml-4 ${textColor} hover:opacity-70 flex-shrink-0`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}