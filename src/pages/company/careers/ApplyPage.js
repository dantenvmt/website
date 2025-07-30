import React, { useState, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';


const FormInput = ({ label, name, type = "text", value, onChange, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);


const FormSelect = ({ label, name, value, onChange, children, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select id={name} name={name} value={value} onChange={onChange} required={required} className="w-full bg-black border border-neutral-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">{children}</select>
    </div>
);


const FileInput = ({ label, name, onChange, required = false, fileName }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-700 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-neutral-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <label htmlFor={name} className="relative cursor-pointer bg-black rounded-md font-medium text-white hover:underline"><span>Upload a file</span><input id={name} name={name} type="file" className="sr-only" onChange={onChange} accept=".pdf,.doc,.docx" required={required} /></label>
                <p className="text-xs text-neutral-600">PDF, DOC, DOCX up to 10MB</p>
            </div>
        </div>
        {fileName && (<p className="text-center text-sm text-neutral-400 mt-4">Selected file: {fileName}</p>)}
    </div>
);

const ValidationModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-neutral-800 rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Invalid Input</h3>
            <p className="text-neutral-300 mb-6">{message}</p>
            <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
                OK
            </button>
        </div>
    </div>
);


const ApplyPage = () => {
    const { jobId } = useParams();
    const location = useLocation();
    const formRef = useRef(null);

    const inheritedJob = location.state?.job;
    const jobTitle = inheritedJob?.title || 'this Role';

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'Select...',
        hispanicLatino: 'Select...',
        veteranStatus: 'Select...',
        disabilityStatus: 'Select...'
    });
    const [resume, setResume] = useState(null);
    const [coverLetter, setCoverLetter] = useState(null);
    const [resumeFileName, setResumeFileName] = useState('');
    const [coverLetterFileName, setCoverLetterFileName] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const [modalMessage, setModalMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = (message) => {
        setModalMessage(message);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['pdf', 'doc', 'docx'];

        if (!validExtensions.includes(fileExtension) || !allowedTypes.includes(file.type)) {
            showModal('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
            e.target.value = '';
            return;
        }

        if (name === 'resume') {
            setResume(file);
            setResumeFileName(file.name);
        } else if (name === 'coverLetter') {
            setCoverLetter(file);
            setCoverLetterFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showModal('Please enter a valid email address.');
            return;
        }

        setStatusMessage('Submitting...');

        if (!resume || !coverLetter || !formData.firstName || !formData.lastName || !formData.email) {
            setStatusMessage('Please fill out all required fields.');
            return;
        }

        const submissionData = new FormData();
        for (const key in formData) {
            submissionData.append(key, formData[key]);
        }
        submissionData.append('jobTitle', jobTitle);
        submissionData.append('jobId', jobId);
        submissionData.append('resume', resume);
        submissionData.append('coverLetter', coverLetter);

        try {
            const response = await fetch('https://renaisons.com/api/upload.php', {
                method: 'POST',
                body: submissionData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                setStatusMessage(`Success! Your application has been submitted.`);
                if (formRef.current) formRef.current.reset();
                setFormData({
                    firstName: '', lastName: '', email: '',
                    gender: 'Select...', hispanicLatino: 'Select...',
                    veteranStatus: 'Select...', disabilityStatus: 'Select...'
                });
                setResume(null); setCoverLetter(null);
                setResumeFileName(''); setCoverLetterFileName('');
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            setStatusMessage(`Error: ${error.message}. See console for details.`);
        }
    };

    return (
        <div className="bg-black text-white min-h-full p-8 md:p-12">
            {isModalOpen && <ValidationModal message={modalMessage} onClose={() => setIsModalOpen(false)} />}

            <div className="max-w-3xl mx-auto">
                <header className="mb-10"><h1 className="text-4xl md:text-5xl font-bold">Apply for {jobTitle}</h1><p className="text-neutral-400 mt-2">* Indicates a required field</p></header>
                <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
                    <section className="space-y-6 p-6 border border-neutral-800 rounded-lg">
                        <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
                        <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                        <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                        <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </section>

                    <section className="space-y-6 p-6 border border-neutral-800 rounded-lg">
                        <h2 className="text-2xl font-semibold text-white">Resume/CV & Cover Letter</h2>
                        <FileInput label="Resume/CV" name="resume" onChange={handleFileChange} fileName={resumeFileName} required />
                        <FileInput label="Cover Letter" name="coverLetter" onChange={handleFileChange} fileName={coverLetterFileName} required />
                    </section>

                    <section className="space-y-6 p-6 border border-neutral-800 rounded-lg">
                        <h2 className="text-2xl font-semibold text-white">Voluntary Self-Identification</h2>
                        <div className="text-sm text-neutral-400 space-y-3">
                            <p>For government reporting purposes, we ask candidates to respond to the below self-identification survey. Completion of the form is entirely voluntary. Whatever your decision, it will not be considered in the hiring process or thereafter. Any information that you do provide will be recorded and maintained in a confidential file.</p>
                            <p>As set forth in Thorn’s Equal Employment Opportunity policy, we do not discriminate on the basis of any protected group status under any applicable law.</p>
                        </div>

                        <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} required>
                            <option>Select...</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Non-binary</option>
                            <option>Decline to self-identify</option>
                        </FormSelect>

                        <FormSelect label="Are you Hispanic/Latino?" name="hispanicLatino" value={formData.hispanicLatino} onChange={handleInputChange} required>
                            <option>Select...</option>
                            <option>Yes</option>
                            <option>No</option>
                            <option>Decline to self-identify</option>
                        </FormSelect>

                        <a href="https://job-boards.cdn.greenhouse.io/docs/2023/RaceEthnicityDefinitions.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                            Race & Ethnicity Definitions
                        </a>

                        <div className="text-sm text-neutral-400 space-y-3 pt-4 border-t border-neutral-800">
                            <p>If you believe you belong to any of the categories of protected veterans listed below, please indicate by making the appropriate selection. As a government contractor subject to the Vietnam Era Veterans Readjustment Assistance Act (VEVRAA), we request this information in order to measure the effectiveness of the outreach and positive recruitment efforts we undertake pursuant to VEVRAA. Classification of protected categories is as follows:</p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li>A "disabled veteran" is one of the following: a veteran of the U.S. military, ground, naval or air service who is entitled to compensation (or who but for the receipt of military retired pay would be entitled to compensation) under laws administered by the Secretary of Veterans Affairs; or a person who was discharged or released from active duty because of a service-connected disability.</li>
                                <li>A "recently separated veteran" means any veteran during the three-year period beginning on the date of such veteran's discharge or release from active duty in the U.S. military, ground, naval, or air service.</li>
                                <li>An "active duty wartime or campaign badge veteran" means a veteran who served on active duty in the U.S. military, ground, naval or air service during a war, or in a campaign or expedition for which a campaign badge has been authorized under the laws administered by the Department of Defense.</li>
                                <li>An "Armed forces service medal veteran" means a veteran who, while serving on active duty in the U.S. military, ground, naval or air service, participated in a United States military operation for which an Armed Forces service medal was awarded pursuant to Executive Order 12985.</li>
                            </ul>
                        </div>

                        <FormSelect label="Veteran Status" name="veteranStatus" value={formData.veteranStatus} onChange={handleInputChange} required>
                            <option>Select...</option>
                            <option>I am not a protected veteran</option>
                            <option>I identify as one or more of the classifications of a protected veteran</option>
                            <option>I don’t wish to answer</option>
                        </FormSelect>

                        <div className="p-4 border border-neutral-700 rounded-md">
                            <div className="flex justify-between items-start text-sm">
                                <h3 className="font-bold">Voluntary Self-Identification of Disability</h3>
                                <div>
                                    <p>Form CC-305</p>
                                    <p>OMB Control Number 1250-0005</p>
                                    <p>Expires 04/30/2026</p>
                                </div>
                            </div>
                            <div className="text-sm text-neutral-400 mt-4 space-y-3">
                                <p className="font-semibold text-white">Why are you being asked to complete this form?</p>
                                <p>We are a federal contractor or subcontractor. The law requires us to provide equal employment opportunity to qualified people with disabilities. We have a goal of having at least 7% of our workers as people with disabilities. The law says we must measure our progress towards this goal. To do this, we must ask applicants and employees if they have a disability or have ever had one. People can become disabled, so we need to ask this question at least every five years.</p>
                                <p>Completing this form is voluntary, and we hope that you will choose to do so. Your answer is confidential. No one who makes hiring decisions will see it. Your decision to complete the form and your answer will not harm you in any way. If you want to learn more about the law or this form, visit the U.S. Department of Labor’s Office of Federal Contract Compliance Programs (OFCCP) website at www.dol.gov/ofccp.</p>
                                <p className="font-semibold text-white">How do you know if you have a disability?</p>
                                <p>A disability is a condition that substantially limits one or more of your “major life activities.” If you have or have ever had such a condition, you are a person with a disability. Disabilities include, but are not limited to:</p>
                                <ul className="list-disc list-inside pl-4">
                                    <li>Alcohol or other substance use disorder (not currently using drugs illegally)</li>
                                    <li>Autoimmune disorder, for example, lupus, fibromyalgia, rheumatoid arthritis, HIV/AIDS</li>
                                    <li>Blind or low vision</li>
                                    <li>Cancer (past or present)</li>
                                    <li>Cardiovascular or heart disease</li>
                                    <li>Celiac disease</li>
                                    <li>Cerebral palsy</li>
                                    <li>Deaf or serious difficulty hearing</li>
                                    <li>Diabetes</li>
                                    <li>Disfigurement, for example, disfigurement caused by burns, wounds, accidents, or congenital disorders</li>
                                    <li>Epilepsy or other seizure disorder</li>
                                    <li>Gastrointestinal disorders, for example, Crohn's Disease, irritable bowel syndrome</li>
                                    <li>Intellectual or developmental disability</li>
                                    <li>Mental health conditions, for example, depression, bipolar disorder, anxiety disorder, schizophrenia, PTSD</li>
                                    <li>Missing limbs or partially missing limbs</li>
                                    <li>Mobility impairment, benefiting from the use of a wheelchair, scooter, walker, leg brace(s) and/or other supports</li>
                                    <li>Nervous system condition, for example, migraine headaches, Parkinson’s disease, multiple sclerosis (MS)</li>
                                    <li>Neurodivergence, for example, attention-deficit/hyperactivity disorder (ADHD), autism spectrum disorder, dyslexia, dyspraxia, other learning disabilities</li>
                                    <li>Partial or complete paralysis (any cause)</li>
                                    <li>Pulmonary or respiratory conditions, for example, tuberculosis, asthma, emphysema</li>
                                    <li>Short stature (dwarfism)</li>
                                    <li>Traumatic brain injury</li>
                                </ul>
                            </div>
                            <FormSelect label="Disability Status" name="disabilityStatus" value={formData.disabilityStatus} onChange={handleInputChange} required>
                                <option>Select...</option>
                                <option>Yes, I have a disability (or previously had a disability)</option>
                                <option>No, I do not have a disability</option>
                                <option>I don’t wish to answer</option>
                            </FormSelect>
                            <p className="text-xs text-neutral-500 mt-4">PUBLIC BURDEN STATEMENT: According to the Paperwork Reduction Act of 1995 no persons are required to respond to a collection of information unless such collection displays a valid OMB control number. This survey should take about 5 minutes to complete.</p>
                        </div>
                    </section>

                    <div className="text-center pt-4">
                        <button type="submit" className="bg-white text-black font-semibold py-3 px-8 rounded-md hover:bg-neutral-200 transition-colors">Submit Application</button>
                    </div>

                    {statusMessage && (<p className="text-center text-sm text-neutral-400 mt-4">{statusMessage}</p>)}
                </form>
            </div>
        </div>
    );
};

export default ApplyPage;
