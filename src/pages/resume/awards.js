import React, { useCallback } from 'react';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import { useParams } from 'react-router-dom';

const AwardItem = ({ award, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(award.id, { ...award, [name]: value });
    };

    const handleDateSelect = (date) => {
        onUpdate(award.id, { ...award, date: date });
    };

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    {award.name || `Award or Honor ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(award.id)} className="text-gray-500 hover:text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(award.id); }}>
                <FormInput
                    label="What was the award name? *"
                    name="name"
                    value={award.name}
                    onChange={handleInputChange}
                    placeholder="Award or Honor Name"
                />
                <FormInput
                    label={`Which organization gave you the ${award.name || 'award or honor'}?`}
                    name="organization"
                    value={award.organization}
                    onChange={handleInputChange}
                    placeholder="Institution Name"
                />
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">When did you get the award?</label>
                    <DatePicker value={award.date} onSelect={handleDateSelect} />
                </div>
                <FormTextarea
                    label="How is the award relevant?"
                    name="relevance"
                    value={award.relevance}
                    onChange={handleInputChange}
                    placeholder="Additional information about the Award/Honor."
                />
                <div className="flex justify-end pt-4">
                    <SaveButton type="submit">SAVE TO AWARDS</SaveButton>
                </div>
            </form>
        </div>
    );
};
const Awards = () => {
    const { awards, setAwards, addAward } = useResume();
    const { resumeId } = useParams();

    const updateAward = useCallback((id, updatedData) => {
        setAwards(currentAwards =>
            currentAwards.map(award => (award.id === id ? updatedData : award))
        );
    }, [setAwards]);

    const deleteAward = (id) => {
        const awardToDelete = awards.find(award => award.id === id);
        if (awards.length > 1 || awardToDelete.name) {
            // Future: Add a fetch call to a delete_award.php script here
            setAwards(awards.filter(award => award.id !== id));
        } else {
            alert("You must have at least one award entry, even if it's blank.");
        }
    };

    const saveAward = async (id) => {
        if (!resumeId) {
            alert("Error: Cannot save award without a resume ID.");
            return;
        }

        const awardToSave = awards.find(award => award.id === id);

        // Don't save if the entry is completely empty
        if (!awardToSave.name && !awardToSave.organization && !awardToSave.date && !awardToSave.relevance) {
            alert("Cannot save an empty award entry.");
            return;
        }

        try {
            const response = await fetch('https://renaisons.com/api/save_award.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...awardToSave,
                    resume_id: resumeId // Add the resume_id
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                if (result.award_id) {
                    // Update the temporary frontend ID with the real one from the database
                    updateAward(id, { ...awardToSave, id: result.award_id });
                }
                alert(`${awardToSave.name || 'Award'} saved!`);
            } else {
                alert('Error saving award: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to save award:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <>
            {awards.map((award, index) => (
                <AwardItem
                    key={award.id}
                    award={award}
                    index={index}
                    onUpdate={updateAward}
                    onDelete={deleteAward}
                    onSave={() => saveAward(award.id)}
                />
            ))}
            <AddItemButton onClick={addAward}>
                ADD ANOTHER AWARD
            </AddItemButton>
        </>
    );
};

export default Awards;

