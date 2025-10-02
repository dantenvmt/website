import React, { useCallback } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';

const ProjectItem = ({ project, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(project.id, { ...project, [name]: value });
    };

    const handleDateSelect = (date) => {
        onUpdate(project.id, { ...project, date: date });
    };

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    {project.name || `Project ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(project.id)} className="text-gray-500 hover:text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(project.id); }}>
                <FormInput
                    label="What was the project name?*"
                    name="name"
                    value={project.name}
                    onChange={handleInputChange}
                    placeholder="Project Name"
                />
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">When did you work on this project?</label>
                    <DatePicker
                        value={project.date}
                        onSelect={handleDateSelect}
                    />
                </div>
                <FormTextarea
                    label="Describe the project and your role."
                    name="relevance"
                    value={project.relevance}
                    onChange={handleInputChange}
                    placeholder="Describe the project, your role, and the technologies you used."
                />

                <div className="flex justify-end pt-4">
                    <SaveButton type="submit">SAVE TO PROJECTS</SaveButton>
                </div>
            </form>
        </div>
    );
};

const Projects = () => {
    const { projects, setProjects, addProject } = useResume();

    const updateProject = useCallback((id, updatedData) => {
        setProjects(currentProjs =>
            currentProjs.map(proj => (proj.id === id ? updatedData : proj))
        );
    }, [setProjects]);

    const deleteProject = (id) => {
        if (projects.length > 1) {
            setProjects(projects.filter(proj => proj.id !== id));
        } else {
            alert("You must have at least one project entry.");
        }
    };

    const saveProject = (id) => {
        const projToSave = projects.find(proj => proj.id === id);
        console.log("Saving Project:", projToSave);
        alert(`${projToSave.name || 'Project'} saved!`);
    };

    return (
        <EditorLayout>
            {projects.map((proj, index) => (
                <ProjectItem
                    key={proj.id}
                    project={proj}
                    index={index}
                    onUpdate={updateProject}
                    onDelete={deleteProject}
                    onSave={saveProject}
                />
            ))}
            <AddItemButton onClick={addProject}>
                ADD ANOTHER PROJECT
            </AddItemButton>
        </EditorLayout>
    );
};

export default Projects;