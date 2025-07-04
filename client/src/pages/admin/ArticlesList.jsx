import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FiEdit3, FiTrash2, FiEye, FiPlus, FiSearch } from "react-icons/fi";
import { articleService } from "../../services/articleService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";

const ArticlesList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["articles", "admin"],
    queryFn: () => articleService.getArticles(), // Fetch ALL articles for admin
  });

  const articles = articlesData?.articles || [];

  const deleteArticleMutation = useMutation({
    mutationFn: articleService.deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete article");
    },
  });

  // Get unique authors for filtering
  const authors = [
    ...new Set(
      (Array.isArray(articles) ? articles : [])
        .filter((article) => article.author)
        .map((article) => article.author._id)
    ),
  ]
    .map((authorId) => {
      const article = articles.find(
        (a) => a.author && a.author._id === authorId
      );
      return article ? article.author : null;
    })
    .filter(Boolean);

  // Filter articles based on search and filters
  const filteredArticles = (Array.isArray(articles) ? articles : []).filter(
    (article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || article.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || article.category === filterCategory;
      const matchesAuthor =
        filterAuthor === "all" ||
        (article.author && article.author._id === filterAuthor);

      return matchesSearch && matchesStatus && matchesCategory && matchesAuthor;
    }
  );

  const handleDeleteArticle = (articleId, articleTitle) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`
      )
    ) {
      deleteArticleMutation.mutate(articleId);
    }
  };

  //To capital case
  const toCapitalCase = (str) => {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const categories = [
    ...new Set(articles.map((article) => article.category)),
  ].filter(Boolean);

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Articles
          </h1>
          <p className="text-gray-600">View, edit, and manage all articles</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Author Filter */}
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Authors</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.fullName || author.username}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-500">
            Showing {filteredArticles.length} of {articles.length} articles
          </div>
        </div>
      </Card>

      {/* Articles List */}
      {filteredArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Card key={article._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {article.title}
                    </h3>
                  </div>

                  <div className="pb-2">
                    <Badge variant={getStatusBadgeVariant(article.status)}>
                      {toCapitalCase(article.status)}
                    </Badge>
                    {article.featured && <Badge variant="info">Featured</Badge>}
                  </div>

                  {article.excerpt && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="font-medium">
                      Author:
                      <Link
                        to={`/author/${article.author?.username}`}
                        className="ml-1 text-blue-600 hover:underline"
                      >
                        {article.author?.firstName +
                          " " +
                          article.author?.lastName || "Unknown Author"}
                      </Link>
                    </span>
                    <span>Category: {toCapitalCase(article.category)}</span>
                    <span>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-center">
                      <FiEye className="w-4 h-4" />
                      {article.views || 0}
                    </span>
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-6">
                  {article.status === "published" && (
                    <Link to={`/article/${article.slug}`} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                  )}

                  <Link to={`/author/articles/edit/${article._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={() =>
                      handleDeleteArticle(article._id, article.title)
                    }
                    disabled={deleteArticleMutation.isPending}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            {searchTerm ||
            filterStatus !== "all" ||
            filterCategory !== "all" ? (
              <>
                <p className="text-lg mb-2">No articles found</p>
                <p>Try adjusting your search criteria or filters</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-2">No articles yet</p>
                <p className="mb-4">
                  Get started by creating your first article
                </p>
                <Link to="/author/articles/create">
                  <Button>Create Article</Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ArticlesList;
