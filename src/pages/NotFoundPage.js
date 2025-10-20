import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-white p-8"> {/* Adjust min-h if needed */}
            <h1 className="text-6xl font-bold text-neutral-400 mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-neutral-300 mb-8 text-center max-w-md">
                Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/" // Link to the homepage
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFoundPage;