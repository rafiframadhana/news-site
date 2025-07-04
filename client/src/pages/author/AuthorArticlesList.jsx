import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FiEdit3,
  FiTrash2,
  FiEye,
  FiPlus,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { articleService } from "../../services/articleService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const AuthorArticlesList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?._id || user?.id;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Filter articles based on search and status
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: (articleId) => articleService.deleteArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["articles", "author", userId],
      });
      toast.success("Article deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete article");
    },
  });

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (window.confirm(`Are you sure you want to delete "${articleTitle}"?`)) {
      deleteArticleMutation.mutate(articleId);
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Articles
            </h1>
            <p className="text-gray-600">Manage your articles and drafts</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              as="a"
              className="flex items-center gap-2"
              onClick={() => (window.location.href = "/author/articles/create")}
            >
              <FiPlus className="w-4 h-4" />
              Create New Article
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Articles List */}
      <Card className="p-6">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8">
            <FiEdit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || statusFilter !== "all"
                ? "No articles found"
                : "No articles yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start writing your first article to see it here."}
            </p>
            {!search && statusFilter === "all" && (
              <Button
                as="a"
                onClick={() =>
                  (window.location.href = "/author/articles/create")
                }
              >
                Create Your First Article
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {toCapitalCase(article.status)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye className="w-3 h-3" />
                      {article.views || 0}
                    </span>
                    <span>Category: {toCapitalCase(article.category)}</span>
                    <span>
                      Updated:{" "}
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <Button
                    as="a"
                    onClick={() =>
                      (window.location.href = `/author/articles/edit/${article._id}`)
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <FiEdit3 className="w-3 h-3" />
                    Edit
                  </Button>

                  {article.status === "published" && (
                    <Button
                      as="a"
                      onClick={() =>
                        (window.location.href = `/article/${article.slug}`)
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </Button>
                  )}

                  <Button
                    onClick={() =>
                      handleDeleteArticle(article._id, article.title)
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    disabled={deleteArticleMutation.isPending}
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Summary */}
      {filteredArticles.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>
      )}
    </div>
  );
};

export default AuthorArticlesList;
