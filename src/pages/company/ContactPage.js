import React, { useState } from 'react';

const FormInput = ({ label, type = 'text', name, value, onChange, required = false }) => (
    <div className="flex-1">
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const FormTextarea = ({ label, name, value, onChange, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows="4"
            required={required}
            className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
    </div>
);

// Modal component for displaying validation errors and success messages
const FeedbackModal = ({ title, message, onClose, isError }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-neutral-800 rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 className={`text-lg font-bold mb-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>{title}</h3>
            <p className="text-neutral-300 mb-6">{message}</p>
            <button
                onClick={onClose}
                className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-colors ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                OK
            </button>
        </div>
    </div>
);


const ContactPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        details: ''
    });

    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const showModal = (title, message, isError = true) => {
        setModalInfo({ isOpen: true, title, message, isError });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Frontend Validation ---
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.details) {
            showModal('Missing Information', 'Please fill out all required fields.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showModal('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        const phoneRegex = /^[0-9\s\(\)\-\+]+$/;
        if (!phoneRegex.test(formData.phone)) {
            showModal('Invalid Phone Number', 'Please enter a valid phone number.');
            return;
        }


        try {
            const response = await fetch('https://renaisons.com/api/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                showModal('Success!', result.message, false);
                // Reset form
                setFormData({ firstName: '', lastName: '', email: '', phone: '', details: '' });
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            showModal('Submission Error', error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 md:p-12">
            {modalInfo.isOpen && <FeedbackModal title={modalInfo.title} message={modalInfo.message} isError={modalInfo.isError} onClose={() => setModalInfo({ isOpen: false, message: '', title: '', isError: false })} />}

            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-neutral-400 mb-12">
                Get in touch with our team to learn more about <a href="/company/about-us" className="text-white underline hover:no-underline">Renaisons</a>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <FormInput label="First name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    <FormInput label="Last name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <FormInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    <FormInput label="Phone number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>

                <FormTextarea
                    label="What's your question?"
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    required
                />

                <div>
                    <button
                        type="submit"
                        className="bg-white text-black font-semibold py-2 px-6 rounded-md hover:bg-neutral-200 transition-colors"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactPage;
