import React from 'react';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import { useParams } from 'react-router-dom';
const Summary = () => {
    const { summary, setSummary } = useResume();
    const { resumeId } = useParams(); // Get resumeId

    const handleSummaryChange = (e) => {
        setSummary(e.target.value);
    };

    const handleSave = async () => {
        if (!resumeId) {
            alert("Error: Cannot save summary without a resume ID.");
            return;
        }

        try {
            const response = await fetch('https://renaisons.com/api/save_summary.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: summary, resume_id: resumeId }),
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert("Summary saved!");
            } else {
                alert('Error saving summary: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to save summary:', error);
        }
    };

    return (
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
    );
};

export default Summary;

