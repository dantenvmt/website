import React from "react";

const ResumeCard = ({ resume }) => {
  // Function to format the date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300 ease-in-out cursor-pointer">
      <img src={'/img.png'} alt={resume.resume_name} className="rounded-t-lg w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{resume.resume_name}</h3>
        <p className="text-sm text-gray-400 mt-1">Last edited: {formatDate(resume.last_edited)}</p>
      </div>
    </div>
  );
};

export default ResumeCard;