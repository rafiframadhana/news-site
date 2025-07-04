import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiGrid, FiList } from 'react-icons/fi';
import { articleService } from '../services/articleService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ArticleCard from '../components/ArticleCard';

const CategoryPage = () => {
  const { category } = useParams();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'category', category, searchTerm, sortBy],
    queryFn: () => articleService.getArticles({ 
      category,
      search: searchTerm,
      sortBy,
      status: 'published'
    }),
    enabled: !!category
  });

  const articles = articlesData?.articles || [];

  const filteredArticles = (Array.isArray(articles) ? articles : []).filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  const categoryDisplayName = category ? 
    category.charAt(0).toUpperCase() + category.slice(1) : 
    'Unknown Category';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Category: {categoryDisplayName}</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {categoryDisplayName}
          </h1>
          <p className="text-gray-600">
            Explore articles in the {categoryDisplayName.toLowerCase()} category
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Search */}
          <div className="w-full sm:w-96">
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="publishedAt">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="title">Alphabetical</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex rounded-md border border-gray-300">
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Articles Grid/List */}
        {filteredArticles.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
          }>
            {filteredArticles.map((article) => (
              <ArticleCard 
                key={article._id} 
                article={article} 
                variant={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? (
                <>
                  <p className="text-lg mb-2">No articles found</p>
                  <p>Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">No articles in this category yet</p>
                  <p className="mb-4">Check back later for new content</p>
                  <Link to="/">
                    <Button>Browse All Articles</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
