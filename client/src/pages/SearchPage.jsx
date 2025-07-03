import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { articleService } from "../services/articleService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

import ArticleCard from "../components/ArticleCard";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [filterCategory, setFilterCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "publishedAt"
  );
  const [viewMode, setViewMode] = useState("grid");

  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (filterCategory !== "all") params.set("category", filterCategory);
    if (sortBy !== "publishedAt") params.set("sort", sortBy);

    setSearchParams(params);
  }, [searchTerm, filterCategory, sortBy, setSearchParams]);

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["articles", "search", searchTerm, filterCategory, sortBy],
    queryFn: () =>
      articleService.getArticles({
        search: searchTerm,
        category: filterCategory !== "all" ? filterCategory : undefined,
        sortBy,
        status: "published",
      }),
    enabled: !!searchTerm,
  });

  const articles = articlesData?.articles || [];

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is triggered automatically by the query when searchTerm changes
  };

  const categories = [
    "Politics",
    "Business",
    "Technology",
    "Sports",
    "Entertainment",
    "Health",
    "Science",
    "World",
    "Local",
    "Opinion",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Search</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Search Articles
          </h1>
          <p className="text-gray-600">Find articles across all categories</p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 text-lg py-4"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="publishedAt">Latest</option>
                  <option value="views">Most Viewed</option>
                  <option value="title">Alphabetical</option>
                  <option value="createdAt">Oldest First</option>
                </select>
              </div>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {searchTerm ? (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading
                    ? "Searching..."
                    : `Search Results for "${searchTerm}"`}
                </h2>
                {!isLoading && (
                  <p className="text-gray-600">
                    {articles.length} article{articles.length !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              {!isLoading && articles.length > 0 && (
                <div className="flex rounded-md border border-gray-300">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner />
              </div>
            )}

            {/* Articles Grid/List */}
            {!isLoading && (
              <>
                {articles.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-6"
                    }
                  >
                    {articles.map((article) => (
                      <ArticleCard
                        key={article._id}
                        article={article}
                        variant={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-gray-500">
                      <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg mb-2">No articles found</p>
                      <p className="mb-4">
                        Try adjusting your search terms or filters to find what
                        you're looking for.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggestions:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Check your spelling</li>
                          <li>• Try more general keywords</li>
                          <li>• Remove category filters</li>
                          <li>• Browse all articles instead</li>
                        </ul>
                      </div>
                      <Link to="/" className="inline-block mt-4">
                        <Button>Browse All Articles</Button>
                      </Link>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        ) : (
          /* Initial State */
          <Card className="p-12 text-center">
            <div className="text-gray-500">
              <FiSearch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl mb-2">Search for Articles</p>
              <p className="mb-6">
                Enter keywords in the search box above to find articles on any
                topic.
              </p>

              <div className="max-w-md mx-auto">
                <h3 className="font-medium text-gray-900 mb-4">
                  Popular Categories:
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilterCategory(category);
                        setSearchTerm("");
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
