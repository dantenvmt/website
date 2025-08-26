import react from "react";
const ResumeCard = ({ resume }) => {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300 ease-in-out cursor-pointer">
        <img src={resume.imageUrl} alt={resume.title} className="rounded-t-lg w-full h-40 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white truncate">{resume.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{resume.lastEdited}</p>
        </div>
      </div>
    );
  };
export default ResumeCard;