import React from "react";

const ResumeCard = ({ resume }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Assuming your API will return the screenshot in 'resume.thumbnail'
  // It can be a URL or a Base64 string from your database
  const previewImage = resume.thumbnail || '/img.png';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300 ease-in-out cursor-pointer overflow-hidden flex flex-col h-full">
      {/* We use object-top so the top of the resume is always visible */}
      <div className="h-48 w-full bg-white overflow-hidden border-b border-gray-700">
        <img
          src={previewImage}
          alt={resume.resume_name}
          className="w-full h-auto object-cover object-top"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{resume.resume_name}</h3>
        <p className="text-sm text-gray-400 mt-1">Last edited: {formatDate(resume.last_edited)}</p>
      </div>
    </div>
  );
};

export default ResumeCard;