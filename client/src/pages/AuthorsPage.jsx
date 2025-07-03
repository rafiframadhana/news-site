import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiFileText,
  FiCalendar,
  FiSearch,
  FiGrid,
  FiList,
  FiShield,
  FiEdit,
} from "react-icons/fi";
import { userService } from "../services/userService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

const AuthorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch authors
  const {
    data: authorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authors"],
    queryFn: () => userService.getAuthors(),
  });

  const authors = authorsData?.authors || [];

  // Filter authors based on search term
  const filteredAuthors = authors.filter(
    (author) =>
      author.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">
                Loading our amazing authors...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load authors
            </h3>
            <p className="text-gray-600">
              There was a problem loading our authors. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const AuthorCard = ({ author }) => (
    <Card hover className="h-full transition-all duration-200 hover:shadow-lg">
      <Link to={`/author/${author.username}`} className="block p-6">
        {/* Author Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white shadow-lg">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.fullName || author.username}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold">
                {author.firstName?.[0] || author.username?.[0]?.toUpperCase()}
                {author.lastName?.[0]}
              </span>
            )}
          </div>
        </div>

        {/* Author Info */}
        <div className="text-center">
          <div className="flex flex-col items-center space-y-2 mb-3">
            <h3 className="text-xl font-semibold text-gray-900">
              {author.fullName ||
                `${author.firstName || ""} ${author.lastName || ""}`.trim() ||
                author.username}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-blue-600">@{author.username}</p>
              <Badge variant="primary" size="sm" className="flex items-center">
                <FiEdit className="w-3 h-3 mr-1" />
                Author
              </Badge>
            </div>
          </div>

          {author.bio && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {author.bio}
            </p>
          )}

          {/* Author Stats */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <FiFileText className="w-4 h-4" />
                <span className="font-medium">{author.articleCount || 0}</span>
              </div>
              <span className="text-xs text-gray-500">Articles</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <FiCalendar className="w-4 h-4" />
                <span className="font-medium">
                  {new Date(author.createdAt).getFullYear()}
                </span>
              </div>
              <span className="text-xs text-gray-500">Joined</span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );

  const AuthorListItem = ({ author }) => (
    <Card hover className="transition-all duration-200 hover:shadow-md">
      <Link to={`/author/${author.username}`} className="block p-6">
        <div className="flex items-center space-x-4">
          {/* Author Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.fullName || author.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {author.firstName?.[0] || author.username?.[0]?.toUpperCase()}
                {author.lastName?.[0]}
              </span>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {author.fullName ||
                  `${author.firstName || ""} ${author.lastName || ""}`.trim() ||
                  author.username}
              </h3>
              <span className="text-sm text-blue-600">@{author.username}</span>
              <Badge variant="primary" size="sm" className="flex items-center">
                <FiEdit className="w-3 h-3 mr-1" />
                Author
              </Badge>
            </div>

            {author.bio && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {author.bio}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FiFileText className="w-4 h-4" />
                <span>{author.articleCount || 0} articles</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiCalendar className="w-4 h-4" />
                <span>Joined {new Date(author.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Authors & Editors
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Meet our talented community of writers and editors who bring you the
            latest insights, stories, and expertise across various topics.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search authors by name, username, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Toggle and Stats */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredAuthors.length} author
                {filteredAuthors.length !== 1 ? "s" : ""}
              </span>

              <div className="flex rounded-md border border-gray-300">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-black text-white"
                      : "bg-white text-gray-500 hover:text-gray-700"
                  } transition-colors`}
                  title="Grid view"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-black text-white"
                      : "bg-white text-gray-500 hover:text-gray-700"
                  } transition-colors`}
                  title="List view"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Authors Display */}
        {filteredAuthors.length === 0 ? (
          <Card className="text-center py-16">
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <FiSearch className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                No authors found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No authors match "${searchTerm}". Try a different search term.`
                  : "No authors are currently available."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAuthors.map((author) =>
              viewMode === "grid" ? (
                <AuthorCard key={author._id} author={author} />
              ) : (
                <AuthorListItem key={author._id} author={author} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorsPage;
