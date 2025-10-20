import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ show, message, onClose }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-neutral-800 text-white px-5 py-3 rounded-xl shadow-lg flex items-center space-x-3 border border-neutral-700">
                        <span className="text-green-400">✓</span>
                        <p className="text-sm">{message}</p>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white ml-3"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
