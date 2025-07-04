import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiCalendar, FiUser, FiEye, FiClock, FiTag } from "react-icons/fi";
import { articleService } from "../services/articleService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Badge from "../components/ui/Badge";
import { formatDate, getReadingTime } from "../utils/dateUtils";
import { getCategoryLabel } from "../utils/constants";
import { markdownToHtml, isMarkdown } from "../utils/markdownUtils";

const ArticleDetail = () => {
  const { slug } = useParams();

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => articleService.getArticleBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Process content - convert markdown to HTML if needed
  const processedContent = isMarkdown(article.content) 
    ? markdownToHtml(article.content)
    : article.content;

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Article Header */}
      <header className="mb-8">
        {/* Category Badge */}
        <div className="mb-4">
          <Link to={`/category/${article.category}`} className="inline-block">
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
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
          {/* Author */}
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4" />
            <span>
              By{" "}
              {article.author?.firstName + " " + article.author?.lastName ||
                "Unknown Author"}
            </span>
          </div>

          {/* Published Date */}
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>

          {/* Reading Time */}
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            <span>
              {article.readTime || getReadingTime(article.content)} min read
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-2">
            <FiEye className="w-4 h-4" />
            <span>{article.views || 0}</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-8">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: processedContent }}
          className="article-content"
        />
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FiTag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {article.author && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-5 sm:p-6">
            <div className="flex items-center gap-4">
              {/* Author Avatar */}
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {article.author.firstName?.[0]}
                  {article.author.lastName?.[0]}
                </span>
              </div>

              {/* Author Info */}
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  {article.author.fullName}
                </h3>
                {article.author.bio && (
                  <p className="text-sm text-gray-600 mb-2">
                    {article.author.bio}
                  </p>
                )}
                <Link
                  to={`/author/${article.author.username}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all articles by {article.author.firstName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </article>
  );
};

export default ArticleDetail;
