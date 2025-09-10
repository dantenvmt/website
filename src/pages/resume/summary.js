import React from 'react';
import EditorLayout from '../../components/resume/EditorLayout';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';

const Summary = () => {
    const { summary, setSummary } = useResume();

    const handleSummaryChange = (e) => {
        setSummary(e.target.value);
    };

    const handleSave = () => {
        console.log("Saving Summary:", summary);
        alert("Summary saved!");
    };

    return (
        <EditorLayout>
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8">
                <FormTextarea
                    label="WRITE A PROFESSIONAL SUMMARY"
                    name="Summary"
                    value={summary}
                    onChange={handleSummaryChange}
                    rows="8"
                    placeholder="Results oriented, outcome focused, and purpose driven analyst..."
                />
                <div className="flex justify-end mt-6">
                    <SaveButton onClick={handleSave}>
                        SAVE TO SUMMARY
                    </SaveButton>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Summary;

