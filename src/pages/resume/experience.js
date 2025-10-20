import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext'; // Import context

// ExperienceItem component remains largely the same, but receives its functions from the main component
const ExperienceItem = ({ experience, index, onUpdate, onDelete, onSave, onAiWrite }) => {

    const companyName = experience.company || 'THE COMPANY';
    const remainingAiWrites = 3 - (experience.aiClickCount || 0);

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">
                    {experience.role || `Experience ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(experience.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(experience.id); }}>
                <FormInput label={`WHAT WAS YOUR ROLE AT ${companyName}? *`} name="role" value={experience.role} onChange={(e) => onUpdate(experience.id, { ...experience, role: e.target.value })} placeholder={'Data Scientist'} />
                <FormInput label="FOR WHICH COMPANY DID YOU WORK? *" name="company" value={experience.company} onChange={(e) => onUpdate(experience.id, { ...experience, company: e.target.value })} placeholder={'Google'} />

                {/* Date Pickers and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`HOW LONG WERE YOU WITH ${companyName}?`}</label>
                        <div className="flex items-center gap-4">
                            <DatePicker
                                value={experience.startDate}
                                onSelect={(date) => onUpdate(experience.id, { ...experience, startDate: date })}
                            />
                            <DatePicker
                                value={experience.endDate}
                                onSelect={(date) => onUpdate(experience.id, { ...experience, endDate: date, isCurrent: false })}
                                startDate={experience.startDate}
                                showToggle={true}
                                isCurrent={experience.isCurrent}
                                onToggleCurrent={() => onUpdate(experience.id, { ...experience, isCurrent: !experience.isCurrent, endDate: !experience.isCurrent ? 'Present' : '' })}
                            />
                        </div>
                    </div>
                    <FormInput label={`WHERE WAS ${companyName} LOCATED?`} name="location" value={experience.location} onChange={(e) => onUpdate(experience.id, { ...experience, location: e.target.value })} placeholder={"Mountain View, CA"} />
                </div>

                {/* Bullets Textarea with AI Write */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">{`WHAT DID YOU DO AT ${companyName}?`}</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onAiWrite(experience.id)}
                                disabled={remainingAiWrites <= 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                AI Write
                            </button>
                            <span className="text-xs text-gray-400">({remainingAiWrites} left)</span>
                        </div>
                    </div>
                    <FormTextarea
                        name="bullets"
                        value={experience.bullets}
                        onChange={(e) => onUpdate(experience.id, { ...experience, bullets: e.target.value })}
                        rows="8"
                    />
                </div>

                <div className="flex justify-end">
                    <SaveButton type="submit">SAVE TO EXPERIENCE</SaveButton>
                </div>
            </form>
        </div>
    );
};

const Experience = () => {
    const { experiences, setExperiences, addExperience } = useResume();
    const { resumeId } = useParams(); // Get resumeId from the URL

    const updateExperience = useCallback((id, updatedData) => {
        setExperiences(currentExperiences =>
            currentExperiences.map(exp => (exp.id === id ? updatedData : exp))
        );
    }, [setExperiences]);

    const deleteExperience = (id) => {
        if (experiences.length > 1) {
            // Here you would also add a fetch call to a `delete_experience.php` script
            setExperiences(experiences.filter(exp => exp.id !== id));
        } else {
            alert("You must have at least one experience entry.");
        }
    };

    const saveExperience = async (id) => {
        if (!resumeId) {
            alert("Error: Cannot save experience without a resume ID.");
            return;
        }

        const experienceToSave = experiences.find(exp => exp.id === id);

        try {
            const response = await fetch('https://renaisons.com/api/save_experience.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...experienceToSave,
                    resume_id: resumeId // Add the resume_id
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                // If it was a new experience, the server sends back the new database ID
                if (result.experience_id) {
                    // Update the temporary frontend ID with the real one from the database
                    updateExperience(id, { ...experienceToSave, id: result.experience_id });
                }
                alert(`${experienceToSave.role || 'Experience'} saved!`);
            } else {
                alert('Error saving experience: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to save experience:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleAiWrite = (id) => {
        const experienceToUpdate = experiences.find(exp => exp.id === id);
        const currentClickCount = experienceToUpdate.aiClickCount || 0;

        if (currentClickCount >= 3) {
            alert("AI suggestion limit reached for this item.");
            return;
        }

        const aiSuggestions = [
            '• Leveraged machine learning models to increase sales forecasting accuracy by 25%.',
            '• Designed and implemented a new data warehousing solution, reducing query times by 40%.',
            '• Collaborated with product teams to define data-driven strategies for new feature development.'
        ];

        const aiGeneratedText = aiSuggestions[currentClickCount];
        const currentBullets = experienceToUpdate.bullets.trim();
        const newBullets = (currentBullets === '•' || currentBullets === '')
            ? aiGeneratedText
            : `${currentBullets}\n${aiGeneratedText}`;

        updateExperience(id, { ...experienceToUpdate, bullets: newBullets, aiClickCount: currentClickCount + 1 });
    };

    return (
        <>
            {experiences.map((exp, index) => (
                <ExperienceItem
                    key={exp.id}
                    experience={exp}
                    index={index}
                    onUpdate={updateExperience}
                    onDelete={deleteExperience}
                    onSave={saveExperience}
                    onAiWrite={handleAiWrite}
                />
            ))}
            <AddItemButton onClick={addExperience}>
                ADD ANOTHER EXPERIENCE
            </AddItemButton>
        </>
    );
};

export default Experience;

