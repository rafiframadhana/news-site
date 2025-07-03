import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FiEdit3,
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { articleService } from "../services/articleService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ArticleCard from "../components/ArticleCard";

const Profile = () => {
  const { user, updateUser, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

  // Debug authentication state
  console.log("Profile - Auth Debug:");
  console.log("- User:", user);
  console.log("- User ID:", user?._id || user?.id);
  console.log("- Is Authenticated:", isAuthenticated);
  console.log("- Is Loading:", isLoading);
  console.log("- Token from cookies:", document.cookie.includes("token"));

  // Get user ID (handle both _id and id properties)
  const userId = user?._id || user?.id;

  // Fetch user's articles
  const {
    data: articlesData,
    isLoading: articlesLoading,
    error,
  } = useQuery({
    queryKey: ["articles", "author", userId],
    queryFn: () => {
      console.log("Fetching articles for user:", userId);
      return articleService.getArticlesByAuthor(userId);
    },
    enabled: !!userId,
  });

  console.log("Profile - User ID:", userId);
  console.log("Profile - Articles Data:", articlesData);
  console.log("Profile - Articles Loading:", articlesLoading);
  console.log("Profile - Articles Error:", error);

  const articles = Array.isArray(articlesData?.articles)
    ? articlesData.articles
    : Array.isArray(articlesData)
    ? articlesData
    : [];

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      updateUser(updatedUser);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      window.location.reload();
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: user?.bio || "",
    });
    setIsEditing(false);
  };

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

  // Debug log for statistics
  console.log("Profile Statistics Debug:");
  console.log("- Total articles:", articles.length);
  console.log("- Published articles:", publishedArticles.length);
  console.log("- Draft articles:", draftArticles.length);
  console.log("- Total views:", totalViews);
  console.log("- Articles data:", articles);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading user data...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view your profile.
          </p>
          <Button as="a" href="/login">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and view your content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending && (
                      <LoadingSpinner size="sm" />
                    )}
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-2xl">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user.fullName || `${user.firstName} ${user.lastName}`}
                    </h3>
                    <p className="text-gray-600">@{user.username}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Member Since
                      </p>
                      <p className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </p>
                    <p className="text-gray-900 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Profile Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h3>
            {articlesLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Published Articles
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {publishedArticles.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiEdit3 className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-600">
                      Draft Articles
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {draftArticles.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Views</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {totalViews}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {(user.role === "admin" || user.role === "author") && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  as="a"
                  onClick={() =>
                    (window.location.href = "/author/articles/create")
                  }
                  className="w-full justify-center"
                >
                  Create New Article
                </Button>
                <Button
                  as="a"
                  onClick={() => (window.location.href = "/author/articles")}
                  variant="outline"
                  className="w-full justify-center"
                >
                  My Articles
                </Button>
                <Button
                  as="a"
                  onClick={() => (window.location.href = "/author/dashboard")}
                  variant="outline"
                  className="w-full justify-center"
                >
                  Dashboard
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Articles */}
      {articles.length > 0 && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Articles</h2>
            {(user.role === "admin" || user.role === "author") && (
              <Button
                as="a"
                onClick={() => (window.location.href = "/author/articles")}
                variant="outline"
              >
                View All
              </Button>
            )}
          </div>

          {articlesLoading ? (
            <div className="flex justify-center items-center min-h-48">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  variant="grid"
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
