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
        <div className="max-w-4xl mx-auto p-6 md:p-12 text-white">
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
                <div className="mb-10 rounded-xl overflow-hidden shadow-2xl aspect-video relative bg-neutral-800">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="prose prose-invert prose-lg max-w-none w-full">

                {/* --- CSS CLEANER --- */}
                {/* This forces the browser to ignore bad formatting from copy-paste */}
                <style>{`
                    .article-content {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    .article-content * {
                        background-color: transparent !important; /* Removes white highlights */
                        color: inherit !important;                /* Fixes black text on black bg */
                        font-family: inherit !important;          /* Fixes font mismatches */
                        height: auto !important;                  /* Fixes fixed heights */
                        width: auto !important;                   /* Fixes fixed widths */
                        max-width: 100% !important;               /* Prevents overflow */
                        white-space: normal !important;           /* FORCE text to wrap naturally */
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