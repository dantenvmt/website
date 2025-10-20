import React from 'react';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import { useParams } from 'react-router-dom';
const Skills = () => {
    const { skills, setSkills } = useResume();
    const { resumeId } = useParams(); // Get resumeId

    const handleSkillsChange = (e) => {
        setSkills(e.target.value);
    };

    const handleSave = async () => {
        if (!resumeId) {
            alert("Error: Cannot save skills without a resume ID.");
            return;
        }

        try {
            const response = await fetch('https://renaisons.com/api/save_skill.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills: skills, resume_id: resumeId }),
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert("Skills saved!");
            } else {
                alert('Error saving skills: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to save skills:', error);
        }
    };

    return (
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
    );
};

export default Skills;

