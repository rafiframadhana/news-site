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
import { SimpleLoader, CardSkeleton, AvatarUpload } from "../components/ui";
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
    avatar: user?.avatar || null,
  });

  // Get user ID (handle both _id and id properties)
  const userId = user?._id || user?.id;

  // Fetch user's articles
  const {
    data: articlesData,
    isLoading: articlesLoading,
  } = useQuery({
    queryKey: ["articles", "author", userId],
    queryFn: () => {
      return articleService.getArticlesByAuthor(userId);
    },
    enabled: !!userId,
  });

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
      avatar: user?.avatar || null,
    });
    setIsEditing(false);
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    setFormData((prev) => ({
      ...prev,
      avatar: avatarUrl,
    }));
    
    // Auto-save avatar update
    try {
      const updateData = { avatar: avatarUrl };
      await updateProfileMutation.mutateAsync(updateData);
      // Don't show success toast here since AvatarUpload component already shows it
    } catch {
      // Error toast will be handled by the mutation onError
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SimpleLoader size="lg" text="Loading user data" showText={true} />
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
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {/* Avatar Upload Section */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                  <AvatarUpload
                    currentAvatar={formData.avatar}
                    onAvatarUpdate={handleAvatarUpdate}
                    userInitials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Profile Photo</h4>
                    <p className="text-sm text-gray-600">
                      Click to upload and crop your profile photo. You can adjust the image before saving.
                    </p>
                  </div>
                </div>

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
                      <SimpleLoader size="xs" />
                    )}
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <AvatarUpload
                    currentAvatar={formData.avatar || user?.avatar}
                    onAvatarUpdate={handleAvatarUpdate}
                    userInitials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                  />
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
                <SimpleLoader size="sm" />
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
      {(user.role === "admin" || user.role === "author") && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Articles</h2>
            <Button
              as="a"
              onClick={() => (window.location.href = "/author/articles")}
              variant="outline"
            >
              View All
            </Button>
          </div>

          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : articles.length > 0 ? (
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
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex flex-col items-center">
                <FiFileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No articles yet
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't created any articles yet. Start writing your first article!
                </p>
                <Button
                  as="a"
                  onClick={() => (window.location.href = "/author/articles/create")}
                  className="flex items-center gap-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Create Your First Article
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
