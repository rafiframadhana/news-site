import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMail, FiCalendar, FiFileText, FiGrid, FiList } from 'react-icons/fi';
import { userService } from '../services/userService';
import { articleService } from '../services/articleService';
import LoadingSpinner from '../components/ui/LoadingSpinner';import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import ArticleCard from '../components/ArticleCard';

const AuthorPage = () => {
  const { username } = useParams();
  const [viewMode, setViewMode] = useState('grid');

  // Fetch author data
  const { data: author, isLoading: authorLoading } = useQuery({
    queryKey: ['author', username],
    queryFn: () => userService.getUserByUsername(username),
    enabled: !!username
  });

  // Fetch author's articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', 'author', author?._id],
    queryFn: () => articleService.getArticlesByAuthor(author._id, { status: 'published' }),
    enabled: !!author?._id
  });

  const articles = articlesData?.articles || [];

  const isLoading = authorLoading || articlesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Author Not Found</h1>
            <p className="text-gray-600 mb-4">The author you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Author: {author.fullName}</span>
        </nav>

        {/* Author Profile */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                {author.avatar ? (
                  <img 
                    src={author.avatar} 
                    alt={author.fullName}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-4xl">
                    {author.firstName?.[0]}{author.lastName?.[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {author.fullName || `${author.firstName} ${author.lastName}`}
              </h1>
              
              <p className="text-xl text-gray-600 mb-4">@{author.username}</p>
              
              {author.bio && (
                <p className="text-gray-700 mb-6 max-w-2xl leading-relaxed">
                  {author.bio}
                </p>
              )}

              {/* Author Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiFileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                    <p className="text-sm text-gray-600">Articles Published</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date(author.createdAt).getFullYear()}
                    </p>
                    <p className="text-sm text-gray-600">Member Since</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiMail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {author.email}
                    </p>
                    <p className="text-sm text-gray-600">Contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Articles Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Articles by {author.firstName}</h2>
              <p className="text-gray-600">
                {articles.length} article{articles.length !== 1 ? 's' : ''} published
              </p>
            </div>

            {/* View Mode Toggle */}
            {articles.length > 0 && (
              <div className="flex rounded-md border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Articles Grid/List */}
          {articles.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
            }>
              {articles.map((article) => (
                <ArticleCard 
                  key={article._id} 
                  article={article} 
                  variant={viewMode}
                  showAuthor={false}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-gray-500">
                <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">No articles yet</p>
                <p>This author hasn't published any articles yet. Check back later!</p>
              </div>
            </Card>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
