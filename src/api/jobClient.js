// Note: We use process.env.REACT_APP_API_URL instead of import.meta.env
const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

export const fetchJobs = async () => {
    const response = await fetch(`${getApiUrl()}/api/jobs`);
    if (!response.ok) {
        throw new Error('Failed to fetch jobs');
    }
    return response.json();
};