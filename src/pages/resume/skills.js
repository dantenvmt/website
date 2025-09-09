import React from 'react';
import EditorLayout from '../../components/resume/EditorLayout';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';

const Skills = () => {
    const { skills, setSkills } = useResume();

    const handleSkillsChange = (e) => {
        setSkills(e.target.value);
    };

    const handleSave = () => {
        console.log("Saving skills:", skills);
        alert("Skills saved!");
    };

    return (
        <EditorLayout>
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8">
                <FormTextarea
                    label="ENTER THE SKILLS YOU POSSESS *"
                    name="skills"
                    value={skills}
                    onChange={handleSkillsChange}
                    rows="8"
                    placeholder="Python, R, SQL, Tableau, PowerBI, Excel, ..."
                />

                <div className="flex justify-end mt-6">
                    <SaveButton onClick={handleSave}>
                        SAVE TO SKILLS LIST
                    </SaveButton>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Skills;

