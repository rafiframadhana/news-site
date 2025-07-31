import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiUsers,
  FiFileText,
  FiEye,
  FiTrendingUp,
  FiPlus,
  FiEdit3,
  FiCalendar,
} from "react-icons/fi";
import { userService } from "../../services/userService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { SimpleLoader } from "../../components/ui";
import { formatDate } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalUsers: 0,
    totalViews: 0,
    recentArticles: [],
  });

  // Fetch dashboard data using the dedicated dashboard stats endpoint
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", "admin", "stats"],
    queryFn: () => userService.getDashboardStats(),
  });

  useEffect(() => {
    if (dashboardData?.stats) {
      const stats = dashboardData.stats;

      setDashboardStats({
        totalArticles: stats.articles.total,
        publishedArticles: stats.articles.published,
        draftArticles: stats.articles.drafts,
        totalUsers: stats.users.total,
        totalViews: stats.articles.total > 0 ? stats.articles.total * 15 : 0, // Approximation if not available
        recentArticles: stats.recentArticles || [],
      });
    }
  }, [dashboardData]);

  //To capital case
  const toCapitalCase = (str) => {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SimpleLoader size="lg" text="Loading dashboard data" showText={true} />
      </div>
    );
  }

  // Debug data
  console.log("Dashboard data:", dashboardData?.stats);

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 mt-1">
                <FiTrendingUp className="inline w-4 h-4 mr-1" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            {Icon && <Icon className={`w-6 h-6 text-${color}-600`} />}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage your news site content and users</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              console.log("Navigating to manage articles...");
              navigate("/admin/articles");
            }}
          >
            <FiEdit3 className="w-4 h-4" />
            Manage Articles
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              console.log("Navigating to manage users...");
              navigate("/admin/users");
            }}
          >
            <FiUsers className="w-4 h-4" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Articles"
          value={dashboardStats.totalArticles}
          icon={FiFileText}
          color="blue"
        />
        <StatCard
          title="Published Articles"
          value={dashboardStats.publishedArticles}
          icon={FiFileText}
          color="green"
        />
        <StatCard
          title="Draft Articles"
          value={dashboardStats.draftArticles}
          icon={FiEdit3}
          color="yellow"
        />
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={FiUsers}
          color="purple"
        />
      </div>

      {/* Recent Articles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Articles
          </h2>
          <Link to="/admin/articles">
            <Button variant="outline" size="sm">
              View All Articles
            </Button>
          </Link>
        </div>

        {dashboardStats.recentArticles.length > 0 ? (
          <div className="space-y-4">
            {dashboardStats.recentArticles.map((article) => (
              <div
                key={article._id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-2 sm:flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      By{" "}
                      <span className="font-medium">
                        {article.author?.fullName ||
                          article.author?.username ||
                          "Unknown"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <FiCalendar className="inline w-3 h-3 mr-1" />
                      {formatDate(new Date(article.createdAt), "MMM dd, yyyy")}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {toCapitalCase(article.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-center">
                    <FiEye className="w-4 h-4" />
                    {article.views || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No articles yet</p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
