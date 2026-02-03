import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PhotoIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_BASE = 'https://renaisons.com/api';

const ContentManagerPage = () => {
    // Data State
    const [content, setContent] = useState({ headline: null, news: [], stories: [], research: [] });
    const [categories, setCategories] = useState([]);

    // Form State - Initialize with Defaults
    const initialFormState = {
        category_id: '',
        type: 'news',
        title: '',
        body: '',
        image_url: '',
        read_time: '',
        is_headline: false
    };
    const [formData, setFormData] = useState(initialFormState);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formRef = useRef(null);

    // --- 1. Fetch Data ---
    const fetchData = useCallback(async () => {
        try {
            // Get Categories
            const catRes = await fetch(`${API_BASE}/manage_content.php`, {
                method: 'POST',
                body: new URLSearchParams({ action: 'get_categories' }),
                credentials: 'include'
            });
            const catData = await catRes.json();
            if (catData.status === 'success') {
                setCategories(catData.data);
                // Set default category if form is empty and not editing
                setFormData(prev => {
                    if (!prev.category_id && catData.data.length > 0 && !isEditing) {
                        return { ...prev, category_id: catData.data[0].id };
                    }
                    return prev;
                });
            }

            // Get Content
            const contentRes = await fetch(`${API_BASE}/get_content.php`);
            const contentData = await contentRes.json();
            if (contentData.status === 'success') setContent(contentData.data);

        } catch (err) {
            console.error("Fetch Error:", err);
            setStatusMsg("Error loading data.");
        }
    }, [isEditing]);

    useEffect(() => { fetchData(); }, [fetchData]);


    // --- 2. Helper: Hard Reset Form ---
    const resetForm = () => {
        // 1. Reset Text Fields
        setFormData({
            category_id: categories[0]?.id || '',
            type: 'news',
            title: '',
            body: '',
            image_url: '',
            read_time: '',
            is_headline: false
        });

        // 2. Reset File State
        setImageFile(null);

        // 3. Reset File Input DOM Element
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // 4. Reset Edit Mode
        setIsEditing(false);
        setEditId(null);
    };

    // --- 3. Handle Cancel Edit ---
    const cancelEdit = () => {
        resetForm();
        setStatusMsg("");
    };

    // --- 4. Handle Edit Click ---
    const handleEdit = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            category_id: item.category_id,
            type: item.type,
            title: item.title,
            body: item.body || '',
            image_url: item.image_url || '',
            read_time: item.read_time || '',
            is_headline: item.is_headline == 1
        });
        setStatusMsg("Editing: " + item.title);
        // Scroll to form
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- 5. Handle Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMsg(isEditing ? "Updating..." : "Publishing...");

        const form = new FormData();
        form.append('action', isEditing ? 'update' : 'create');
        if (isEditing) form.append('id', editId);

        Object.keys(formData).forEach(key => form.append(key, formData[key]));
        if (imageFile) form.append('image_file', imageFile);

        try {
            const response = await fetch(`${API_BASE}/manage_content.php`, {
                method: 'POST',
                body: form,
                credentials: 'include'
            });

            const result = await response.json();

            if (result.status === 'success') {
                resetForm(); // Clear the form first
                setStatusMsg(isEditing ? "Post Updated Successfully!" : "Post Published Successfully!");
                fetchData(); // Then refresh the list
            } else {
                setStatusMsg("Error: " + result.message);
            }
        } catch (e) {
            setStatusMsg("Network Error: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 6. Handle Delete ---
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        const form = new FormData();
        form.append('action', 'delete');
        form.append('id', id);
        await fetch(`${API_BASE}/manage_content.php`, { method: 'POST', body: form, credentials: 'include' });
        fetchData();
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div className="p-8 md:p-12 text-white max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Content Manager</h1>

            {statusMsg && (
                <div className={`p-4 rounded mb-6 font-bold ${statusMsg.includes("Error") ? "bg-red-900/50 text-red-200" : "bg-green-600 text-white"}`}>
                    {statusMsg}
                </div>
            )}

            {/* --- EDITOR FORM --- */}
            <div ref={formRef} className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 mb-12 shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-700 pb-4">
                    <h2 className="text-xl font-bold text-white">
                        {isEditing ? `Edit Post #${editId}` : "Create New Post"}
                    </h2>
                    {isEditing && (
                        <button onClick={cancelEdit} className="text-sm text-red-400 hover:text-red-300 underline">
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                    {/* Category & Section */}
                    <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-2">Category</label>
                        <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-neutral-700 p-3 rounded text-white border border-neutral-600">
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-2">Section</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-neutral-700 p-3 rounded text-white border border-neutral-600">
                            <option value="news">News</option>
                            <option value="story">Story</option>
                            <option value="research">Research</option>
                        </select>
                    </div>

                    {/* Title (Added autoComplete="off") */}
                    <div className="md:col-span-2">
                        <label className="block text-xs uppercase text-neutral-400 mb-2">Title</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-neutral-700 p-3 rounded text-white font-bold text-lg border border-neutral-600"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            autoComplete="off"
                        />
                    </div>

                    {/* Body */}
                    <div className="md:col-span-2 text-black bg-white rounded overflow-hidden">
                        <ReactQuill
                            theme="snow"
                            value={formData.body}
                            onChange={(val) => setFormData({ ...formData, body: val })}
                            modules={modules}
                            className="h-64 mb-12"
                        />
                    </div>

                    {/* Image */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block text-xs uppercase text-neutral-400 mb-2">Upload Image</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={e => setImageFile(e.target.files[0])}
                                className="text-white w-full text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-neutral-400 mb-2">Or Image URL</label>
                            <input type="text" placeholder="https://..." className="w-full bg-neutral-700 p-3 rounded text-white border border-neutral-600" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                        </div>
                    </div>

                    {/* Meta */}
                    <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-2">Read Time</label>
                        <input type="text" placeholder="5 min read" className="w-full bg-neutral-700 p-3 rounded text-white border border-neutral-600" value={formData.read_time} onChange={e => setFormData({ ...formData, read_time: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="hl" checked={formData.is_headline} onChange={e => setFormData({ ...formData, is_headline: e.target.checked })} className="w-5 h-5" />
                        <label htmlFor="hl" className="cursor-pointer font-bold text-yellow-400">Set as Headline Story</label>
                    </div>

                    <button disabled={isSubmitting} className={`md:col-span-2 font-bold py-4 rounded shadow-lg transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        {isSubmitting ? 'Processing...' : (isEditing ? 'Update Post' : 'Publish Post')}
                    </button>
                </form>
            </div>

            {/* --- LIST EXISTING CONTENT --- */}
            <h2 className="text-2xl font-bold mb-6 border-b border-neutral-700 pb-2">Manage Posts</h2>
            {['headline', 'news', 'stories', 'research'].map(sec => {
                const items = sec === 'headline' && content.headline ? [content.headline] : content[sec];
                if (!items || items.length === 0) return null;
                return (
                    <div key={sec} className="mb-8">
                        <h3 className="uppercase text-blue-400 font-bold mb-2">{sec}</h3>
                        {items.map(item => (
                            <div key={item.id} className={`flex justify-between items-center bg-neutral-900 p-3 rounded mb-2 border border-neutral-800 ${editId === item.id ? 'border-l-4 border-l-green-500' : ''}`}>
                                <div className="flex items-center gap-3">
                                    {item.image_url && <img src={item.image_url} alt="" className="w-10 h-10 object-cover rounded" />}
                                    <span className="font-semibold">{item.title}</span>
                                    {editId === item.id && <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">Editing</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded" title="Edit">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded" title="Delete">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default ContentManagerPage;