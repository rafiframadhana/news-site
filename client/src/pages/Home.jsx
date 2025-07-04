import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { CATEGORIES, getCategoryLabel } from "../utils/constants";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Featured articles for hero slider
  const { data: featuredArticlesData, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: () =>
      api.articles.getAll({
        status: "published",
        limit: 5,
        sort: "-publishedAt",
      }),
  });

  const {
    data: articlesData,
    isLoading: articlesLoading,
    error: articlesError,
  } = useQuery({
    queryKey: [
      "articles",
      { search: searchTerm, category: selectedCategory, status: "published" },
    ],
    queryFn: () =>
      api.articles.getAll({
        search: searchTerm,
        category: selectedCategory,
        status: "published",
        limit: 12,
      }),
  });

  // Static categories for now (can be replaced with API call later)
  const categories = CATEGORIES;

  const articles = articlesData?.data?.articles || [];
  const featuredArticles = featuredArticlesData?.data?.articles || [];

  const handleSearch = (e) => {
    e.preventDefault();
    // Search will trigger automatically via useQuery
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slider
  useEffect(() => {
    if (featuredArticles.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredArticles.length]);

  const truncateContent = (content, maxLength = 150) => {
    const plainText = content.replace(/<[^>]+>/g, "");
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  if (articlesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Articles
          </h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hot Topics Hero Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Hot Topics
        </h2>

        {featuredLoading ? (
          <div className="h-96 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : featuredArticles.length > 0 ? (
          <div className="relative rounded-xl overflow-hidden mx-auto shadow-lg group">
            {/* Slider Container */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredArticles.map((article) => (
                <div
                  key={article._id}
                  className="w-full flex-shrink-0 relative"
                >
                  <img
                    src={article.featuredImage || "/placeholder-news.jpg"}
                    alt={article.title}
                    className="w-full h-[450px] object-cover"
                  />

                  {/* Dark Overlay - shows on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 group-hover:from-black/40 group-hover:to-black/70 transition-all duration-300"></div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                    {article.category && (
                      <Badge variant="primary" size="sm" className="mb-4 w-fit">
                        {getCategoryLabel(article.category)}
                      </Badge>
                    )}
                    <h3 className="text-white text-2xl md:text-4xl font-bold max-w-2xl leading-tight mb-4">
                      <Link
                        to={`/article/${article.slug}`}
                        className="hover:text-blue-300 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-white/90 text-lg max-w-xl mb-6 transition-opacity duration-300">
                      {truncateContent(article.excerpt, 150)}
                    </p>
                    <Link
                      to={`/article/${article.slug}`}
                      className="inline-flex items-center py-2 hover:text-primary-500 text-white font-medium rounded-lg transition-colors w-fit opacity-0 group-hover:opacity-100 duration-300"
                    >
                      Read More
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Metadata at bottom left */}
                  <div className="absolute bottom-4 left-6 text-sm text-white/80 space-x-6">
                    <span>
                      {format(
                        new Date(article.publishedAt || article.createdAt),
                        "MMM dd, yyyy"
                      )}
                    </span>
                    <span>By {article.author?.firstName || "Anonymous"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows - show on hover */}
            {featuredArticles.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 hover:bg-black/75 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-black/75 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Slide Indicators - show on hover */}
            {featuredArticles.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {featuredArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-white"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-600 text-lg">
              No featured articles available
            </p>
          </div>
        )}
      </section>

      {/* Search and Filter Section */}
      <section className="bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
          Latest Topics
        </h2>
        <div className="pb-6 pt-2 border-b hidden sm:block">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md pl-4 py-2 pr-8 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {articlesLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card
                key={article._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.featuredImage && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <Card.Content className="px-6 pt-3 sm:pt-1 pb-6">
                  <div className="flex items-center justify-between mb-3">
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
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(article.publishedAt || article.createdAt),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      to={`/article/${article.slug}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {truncateContent(article.excerpt)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">By</span>
                      <span className="text-sm font-medium text-gray-900">
                        {article.author?.firstName || "Anonymous"}
                      </span>
                    </div>

                    <Link
                      to={`/article/${article.slug}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
