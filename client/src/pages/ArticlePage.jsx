import React from 'react';

const ArticlePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Page</h1>
            <p className="text-gray-600 text-lg">
              This page will display individual articles. The component will fetch article data
              based on the slug parameter and display the full article content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
