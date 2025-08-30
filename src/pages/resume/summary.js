import React, { useState } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';

const Summary = () => {
    const [Summary, setSummary] = useState('');

    const handleSummaryChange = (e) => {
        setSummary(e.target.value);
    };

    const handleSave = () => {
        console.log("Saving Summary:", Summary);
        alert("Summary saved!");
    };

    return (
        <EditorLayout>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className="flex justify-between items-center mb-4">
                    <label htmlFor="Summary-textarea" className="block text-xs font-bold text-gray-400 uppercase">
                        WRITE A PROFESSIONAL SUMMARY
                    </label>
                </div>

                <textarea
                    id="Summary-textarea"
                    name="Summary"
                    value={Summary}
                    onChange={handleSummaryChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 leading-relaxed focus:ring-cyan-500 focus:border-cyan-500"
                    rows="6"
                    placeholder="Results oriented, outcome focused, and purpose driven analyst with experience leading teams through complex, data driven projects for major financial institutions. A diverse and progressive career spanning over 3 years in data analytics and machine learning.">
                </textarea>

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        SAVE TO SUMMARY
                    </button>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Summary;