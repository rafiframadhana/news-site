import { useQuery } from "@tanstack/react-query";
import { FiFileText, FiEdit3, FiEye, FiPlus, FiSettings, FiCalendar } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { articleService } from "../../services/articleService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "date-fns";

const AuthorDashboard = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  // Fetch author's articles
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["articles", "author", userId],
    queryFn: () => articleService.getArticlesByAuthor(userId),
    enabled: !!userId,
  });

  const articles = Array.isArray(articlesData?.articles)
    ? articlesData.articles
    : Array.isArray(articlesData)
    ? articlesData
    : [];

  const publishedArticles = articles.filter(
    (article) => article.status === "published"
  );
  const draftArticles = articles.filter(
    (article) => article.status === "draft"
  );
  const totalViews = articles.reduce(
    (sum, article) => sum + (article.views || 0),
    0
  );

  // Recent articles (last 5)
  const recentArticles = articles
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  //To capital case
  const toCapitalCase = (str) => {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Author Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your articles and track your writing progress
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              as="a"
              onClick={() => (window.location.href = "/author/articles/create")}
              className="flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Create New Article
            </Button>
            <Button
              as="a"
              onClick={() => (window.location.href = "/author/articles")}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <FiFileText className="w-4 h-4" />
              Manage Articles
            </Button>
            <Button
              as="a"
              onClick={() => (window.location.href = "/profile")}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <FiSettings className="w-4 h-4" />
              Profile Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiFileText className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Published Articles
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {publishedArticles.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiEdit3 className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Draft Articles
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {draftArticles.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiEye className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Articles */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Articles
          </h2>
          <Button as="a" href="/author/articles" variant="outline" size="sm">
            View All
          </Button>
        </div>

        {recentArticles.length === 0 ? (
          <div className="text-center py-8">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start writing your first article to see it here.
            </p>
            <Button
              as="a"
              onClick={() => (window.location.href = "/author/articles/create")}
            >
              Create Your First Article
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <div
                key={article._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {toCapitalCase(article.status)}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <FiEye className="w-3 h-3" />
                      {article.views || 0}
                    </span>
                    <span className="hidden sm:flex items-center gap-1 font-medium">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(new Date(article.updatedAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="block text-center space-y-2 sm:items-center sm:space-x-2">
                  <Button
                    as="a"
                    href={`/author/articles/edit/${article._id}`}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  {article.status === "published" && (
                    <Button
                      as="a"
                      href={`/article/${article.slug}`}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuthorDashboard;
