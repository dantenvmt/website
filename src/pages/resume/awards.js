import React, { useCallback } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';

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

    const updateAward = useCallback((id, updatedData) => {
        setAwards(currentAwards =>
            currentAwards.map(award => (award.id === id ? updatedData : award))
        );
    }, [setAwards]);

    const deleteAward = (id) => {
        if (awards.length > 1) {
            setAwards(awards.filter(award => award.id !== id));
        } else {
            alert("You must have at least one award entry.");
        }
    };

    const saveAward = (id) => {
        const awardToSave = awards.find(award => award.id === id);
        console.log("Saving Award:", awardToSave);
        alert(`${awardToSave.name || 'Award'} saved!`);
    };

    return (
        <EditorLayout>
            {awards.map((award, index) => (
                <AwardItem
                    key={award.id}
                    award={award}
                    index={index}
                    onUpdate={updateAward}
                    onDelete={deleteAward}
                    onSave={saveAward}
                />
            ))}
            <AddItemButton onClick={addAward}>
                ADD ANOTHER AWARD
            </AddItemButton>
        </EditorLayout>
    );
};

export default Awards;

