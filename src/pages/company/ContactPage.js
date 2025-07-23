import React from 'react';

const FormInput = ({ label, type = 'text', name, required = false }) => (
    <div className="flex-1">
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const FormSelect = ({ label, name, options, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        >
            <option>Please Select</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    </div>
);

const FormTextarea = ({ label, name, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            rows="4"
            className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
    </div>
);


const ContactPage = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Form submitted! (This is a placeholder)');
    };

    return (
        <div className="max-w-4xl mx-auto p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-neutral-400 mb-12">
                Get in touch with our team to learn more about <a href="index.js" className="text-white underline hover:no-underline">Renaisons</a>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="flex flex-col md:flex-row gap-6">
                    <FormInput label="First name" name="first-name" required />
                    <FormInput label="Last name" name="last-name" required />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <FormInput label="Email Address" name="work-email" type="email" required />
                    <FormInput label="Phone number" name="phone-number" type="tel" required />
                </div>


                <FormTextarea
                    label="What's your questions?"
                    name="details"
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

            <p className="text-neutral-400 mt-12">
                For other inquiries, visit our <a href="#" className="text-white underline hover:no-underline">help center</a>.
            </p>
        </div>
    );
};

export default ContactPage;
