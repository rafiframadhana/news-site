import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { articleService } from "../../services/articleService";
import { uploadService } from "../../services/uploadService";
import { CATEGORIES } from "../../utils/constants";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import MarkdownEditor from "../../components/ui/MarkdownEditor";

const AuthorEditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    featured: false,
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputType, setImageInputType] = useState("upload"); // "upload" or "url"
  const [imageUrl, setImageUrl] = useState("");

  // Fetch article data
  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["article", id],
    queryFn: () => articleService.getArticle(id),
    enabled: !!id,
  });

  // Check if user owns this article
  useEffect(() => {
    if (article && user) {
      const userId = user._id || user.id;
      const articleAuthorId =
        article.author?._id || article.author?.id || article.author;

      if (articleAuthorId !== userId) {
        toast.error("You can only edit your own articles");
        navigate("/author/articles");
        return;
      }

      // Populate form with article data
      setFormData({
        title: article.title || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        category: article.category || "",
        tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
        status: article.status || "draft",
        seoTitle: article.seoTitle || "",
        seoDescription: article.seoDescription || "",
        featured: article.featured || false,
      });

      if (article.featuredImage) {
        setImagePreview(article.featuredImage);
        
        // If the image URL starts with http, it's likely from a URL input
        if (article.featuredImage.startsWith('http')) {
          setImageInputType("url");
          setImageUrl(article.featuredImage);
        } else {
          setImageInputType("upload");
          setImageUrl("");
        }
      }
    }
  }, [article, user, navigate]);

  const updateArticleMutation = useMutation({
    mutationFn: (data) => articleService.updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", id] });
      toast.success("Article updated successfully!");
      navigate("/author/articles");
    },
    onError: (error) => {
      console.error("Error updating article:", error);
      console.error("Error response:", error.response?.data);
      
      // Show specific validation errors if available
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.message).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || "Failed to update article");
      }
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleImageTypeChange = (type) => {
    setImageInputType(type);
    // Clear previous selections
    setFeaturedImage(null);
    setImageUrl("");
    setImagePreview("");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setFeaturedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Set preview for URL
    if (url.trim()) {
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  const uploadImage = async () => {
    if (!featuredImage) return null;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", featuredImage);

      console.log(
        "Uploading image (edit):",
        featuredImage.name,
        featuredImage.type,
        featuredImage.size
      );
      const response = await uploadService.uploadImage(formDataUpload);
      console.log("Upload response (edit):", response);
      return response.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      let errorMessage = "Failed to upload image";
      if (error.response) {
        errorMessage += `: ${
          error.response.data?.message || error.response.statusText
        }`;
      }
      toast.error(errorMessage);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.content || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Upload new image if selected
      let featuredImageUrl = imagePreview; // Keep existing image by default
      
      // Handle based on input type
      if (imageInputType === "upload" && featuredImage) {
        const newImageUrl = await uploadImage();
        if (newImageUrl) {
          featuredImageUrl = newImageUrl;
        } else {
          return; // Stop if image upload failed
        }
      } else if (imageInputType === "url") {
        // Use URL directly if provided, otherwise it will be null/empty
        if (imageUrl.trim()) {
          featuredImageUrl = imageUrl.trim();
          
          // Basic URL validation
          if (!featuredImageUrl.match(/^https?:\/\/.+\..+/)) {
            toast.error("Please enter a valid image URL");
            return;
          }
        } else {
          // If URL input is selected but empty, treat as intentionally removing the image
          featuredImageUrl = null;
        }
      }

      // Prepare article data
      const articleData = {
        ...formData,
        category: formData.category, // Category is already lowercase from constants
        featuredImage: featuredImageUrl || article?.featuredImage, // Fallback to existing image
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      console.log('Sending article data:', articleData); // Debug log

      updateArticleMutation.mutate(articleData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred while updating the article");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error("Error fetching article:", error);
    
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The article you're looking for doesn't exist or you don't have
            permission to edit it.
          </p>
          {error?.response?.status === 401 && (
            <p className="text-red-600 mb-4">
              Authentication error. You may need to log in again.
            </p>
          )}
          <div className="flex flex-col gap-2 justify-center items-center">
            <Button onClick={() => navigate("/author/articles")}>
              Back to Articles
            </Button>
            {error?.response?.status === 401 && (
              <Button variant="outline" onClick={() => navigate("/login")}>
                Log in Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Article</h1>
        <p className="text-gray-600">
          Update your article content and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Article Details
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter article title"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your article content here using markdown..."
                className="w-full"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the article..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <Input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              
              {/* Image Input Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleImageTypeChange("upload")}
                  className={`px-3 py-2 text-sm rounded-md ${
                    imageInputType === "upload"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Upload New Image
                </button>
                <button
                  type="button"
                  onClick={() => handleImageTypeChange("url")}
                  className={`px-3 py-2 text-sm rounded-md ${
                    imageInputType === "url"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Edit Image URL
                </button>
              </div>

              {/* File Upload Input */}
              {imageInputType === "upload" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              )}

              {/* URL Input */}
              {imageInputType === "url" && (
                <div>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {imageUrl ? "Current image URL (edit or clear to remove)" : "Enter a direct link to an image file"}
                    </p>
                    {imageUrl && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-xs py-1 px-2" 
                        onClick={() => {
                          setImageUrl("");
                          setImagePreview("");
                        }}
                      >
                        Clear URL
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {article && article.featuredImage === imagePreview
                      ? "Current Image"
                      : "Image Preview"}
                  </p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-md border-2 border-gray-300"
                    onError={() => {
                      setImagePreview("");
                      if (imageInputType === "url") {
                        toast.error("Invalid image URL");
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* SEO Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            SEO Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <Input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                placeholder="SEO optimized title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO meta description"
              />
            </div>
          </div>
        </Card>

        {/* Publishing Options */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Publishing Options
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Featured Article
              </label>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/author/articles")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateArticleMutation.isPending || uploadingImage}
            className="flex items-center gap-2"
          >
            {(updateArticleMutation.isPending || uploadingImage) && (
              <LoadingSpinner size="sm" />
            )}
            Update Article
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthorEditArticle;
