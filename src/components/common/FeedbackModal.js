// src/components/common/FeedbackModal.js
import React from 'react';

/**
 * A reusable modal for showing success or error feedback.
 * @param {string} title - The title of the modal.
 * @param {string} message - The body text of the modal.
 * @param {function} onClose - Function to call when the "OK" button is clicked.
 * @param {boolean} [isError=false] - If true, styles the title and button for an error.
 */
const FeedbackModal = ({ title, message, onClose, isError = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-neutral-800 rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 className={`text-lg font-bold mb-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>{title}</h3>
            <p className="text-neutral-300 mb-6">{message}</p>
            <button
                onClick={onClose}
                className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-colors ${isError
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                OK
            </button>
        </div>
    </div>
);

export default FeedbackModal;