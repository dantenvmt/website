import React, { useState } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';

const Skills = () => {
    const [skills, setSkills] = useState('');

    const handleSkillsChange = (e) => {
        setSkills(e.target.value);
    };

    const handleSave = () => {
        console.log("Saving skills:", skills);
        alert("Skills saved!");
    };

    return (
        <EditorLayout>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <div className="flex justify-between items-center mb-4">
                    <label htmlFor="skills-textarea" className="block text-xs font-bold text-gray-400 uppercase">
                        ENTER THE SKILLS YOU POSSESS *
                    </label>
                </div>

                <textarea
                    id="skills-textarea"
                    name="skills"
                    value={skills}
                    onChange={handleSkillsChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 leading-relaxed focus:ring-cyan-500 focus:border-cyan-500"
                    rows="6"
                    placeholder="Python, R, SQL, Tableau, PowerBI, Excel, ..."
                />

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        SAVE TO SKILLS LIST
                    </button>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Skills;