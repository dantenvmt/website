import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = 'https://renaisons.com/api';

const ArticlePage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/get_content.php?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') setArticle(data.data);
                setLoading(false);
            })
            .catch(e => setLoading(false));
    }, [id]);

    if (loading) return <div className="text-white p-12 text-center text-xl">Loading...</div>;
    if (!article) return <div className="text-white p-12 text-center text-xl">Article not found.</div>;

    return (
        // 1. Center the content and limit the width
        // 'max-w-3xl' makes it narrower (approx 768px), matching standard article/image widths better than 4xl.
        // 'mx-auto' centers it in the middle of the screen.
        <div className="w-full max-w-3xl mx-auto p-6 md:p-8 text-white">

            <Link to="/" className="text-neutral-400 hover:text-white mb-8 inline-block transition-colors">← Back to Home</Link>

            <header className="mb-8 border-b border-neutral-800 pb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                    <span className="bg-blue-600 text-white font-bold px-2 py-1 rounded uppercase tracking-wider text-xs">
                        {article.category_name}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-300 font-semibold">By {article.author_name || 'Renaisons Team'}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-400">{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{article.title}</h1>
            </header>

            {article.image_url && (
                // This image will fill the max-w-3xl container, defining the width for everything else.
                <div className="mb-10 rounded-xl overflow-hidden shadow-2xl aspect-video relative bg-neutral-800">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                </div>
            )}

            {/* 'max-w-none' ensures the text expands to fill the 3xl container, aligning with the image */}
            <div className="prose prose-invert prose-lg max-w-none w-full">
                <style>{`
                    .article-content {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    .article-content * {
                        background-color: transparent !important;
                        color: inherit !important;
                        font-family: inherit !important;
                        height: auto !important;
                        width: auto !important;
                        max-width: 100% !important;
                        white-space: normal !important;
                    }
                    .article-content img {
                        margin: 2rem auto;
                        border-radius: 0.5rem;
                        display: block;
                    }
                `}</style>

                <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: article.body }}
                />
            </div>
        </div>
    );
};

export default ArticlePage;