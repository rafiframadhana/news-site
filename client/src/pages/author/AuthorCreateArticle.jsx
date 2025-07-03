import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { articleService } from "../../services/articleService";
import { uploadService } from "../../services/uploadService";
import { CATEGORIES } from "../../utils/constants";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const AuthorCreateArticle = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const createArticleMutation = useMutation({
    mutationFn: articleService.createArticle,
    onSuccess: (data) => {
      console.log("Article created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article created successfully!");
      navigate("/author/articles");
    },
    onError: (error) => {
      console.error("Error creating article:", error);
      toast.error(error.response?.data?.message || "Failed to create article");
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const handleImageTypeChange = (type) => {
    setImageInputType(type);
    // Clear previous selections
    setFeaturedImage(null);
    setImageUrl("");
    setImagePreview("");
  };

  const uploadImage = async () => {
    if (!featuredImage) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", featuredImage);

      console.log(
        "Uploading image:",
        featuredImage.name,
        featuredImage.type,
        featuredImage.size
      );
      const response = await uploadService.uploadImage(formData);
      console.log("Upload response:", response);
      return response.imageUrl || response.url; // Handle different response formats
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

    // Check if featured image is provided based on input type
    if (imageInputType === "upload" && !featuredImage) {
      toast.error("Please upload a featured image for your article");
      return;
    }

    if (imageInputType === "url" && !imageUrl.trim()) {
      toast.error("Please enter an image URL for your article");
      return;
    }

    try {
      // Get image URL based on input type
      let featuredImageUrl = "";
      
      if (imageInputType === "upload" && featuredImage) {
        // Upload file and get URL
        featuredImageUrl = await uploadImage();
        if (!featuredImageUrl) {
          toast.error("Failed to upload image");
          return; // Stop if image upload failed
        }
      } else if (imageInputType === "url") {
        // Use URL directly
        featuredImageUrl = imageUrl.trim();
        
        // Basic URL validation
        if (!featuredImageUrl.match(/^https?:\/\/.+\..+/)) {
          toast.error("Please enter a valid image URL");
          return;
        }
      }

      // Make sure we're not submitting an empty featuredImage
      if (!featuredImageUrl || featuredImageUrl.trim() === '') {
        toast.error("Featured image is required");
        return;
      }
      
      // Prepare article data
      const articleData = {
        ...formData,
        category: formData.category, // Category is already lowercase from constants
        featuredImage: featuredImageUrl, // This must be a string URL
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      console.log('Creating article with data:', {
        ...articleData,
        featuredImage: `Image URL provided: ${!!featuredImageUrl}`
      });

      createArticleMutation.mutate(articleData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred while creating the article");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Article
        </h1>
        <p className="text-gray-600">Write and publish your content</p>
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
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your article content here..."
                required
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
                Featured Image *
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
                  Upload Image
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
                  Image URL
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
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a direct link to an image file
                  </p>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-md"
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
            disabled={createArticleMutation.isPending || uploadingImage}
            className="flex items-center gap-2"
          >
            {(createArticleMutation.isPending || uploadingImage) && (
              <LoadingSpinner size="sm" />
            )}
            Create Article
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthorCreateArticle;
