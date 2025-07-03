import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiEye } from 'react-icons/fi';
import Card from './ui/Card';
import  Badge  from './ui/Badge';
import { formatDate } from '../utils/dateUtils';
import { getCategoryLabel } from '../utils/constants';

const ArticleCard = ({ article, variant = 'grid', showAuthor = true }) => {
  const defaultImage = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';

  if (variant === 'list') {
    return (
      <Card className="p-6">
        <Link to={`/article/${article.slug}`} className="block">
          <div className="flex gap-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={article.featuredImage || defaultImage}
                alt={article.title}
                className="w-32 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {article.category && (
                  <Badge variant="info" size="sm" className="!px-0">
                    {getCategoryLabel(article.category)}
                  </Badge>
                )}
                {article.featured && (
                  <Badge variant="warning" size="sm">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              {article.excerpt && (
                <p className="text-gray-600 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {showAuthor && article.author && (
                  <div className="flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    <span>{article.author.fullName || `${article.author.firstName} ${article.author.lastName}`}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiEye className="w-4 h-4" />
                  <span>{article.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="h-full overflow-hidden">
      <Link to={`/article/${article.slug}`} className="block">
        {/* Image */}
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={article.featuredImage || defaultImage}
            alt={article.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            {article.category && (
              <Badge variant="info" size="sm" className="!px-0">
                {getCategoryLabel(article.category)}
              </Badge>
            )}
            {article.featured && (
              <Badge variant="warning" size="sm">
                Featured
              </Badge>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-3 line-clamp-2">
            {article.title}
          </h3>
          
          {article.excerpt && (
            <p className="text-gray-600 line-clamp-3 mb-4">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            {showAuthor && article.author && (
              <div className="flex items-center gap-1">
                <FiUser className="w-4 h-4" />
                <span>{article.author.fullName || `${article.author.firstName} ${article.author.lastName}`}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FiEye className="w-4 h-4" />
              <span>{article.views || 0} views</span>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {article.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{article.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ArticleCard;
