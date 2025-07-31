import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminArticlesList from './pages/admin/ArticlesList';
import ManageUsers from './pages/admin/ManageUsers';

// Author Pages
import AuthorDashboard from './pages/author/AuthorDashboard';
import AuthorArticlesList from './pages/author/AuthorArticlesList';
import AuthorCreateArticle from './pages/author/AuthorCreateArticle';
import AuthorEditArticle from './pages/author/AuthorEditArticle';

// Other Pages
import Profile from './pages/Profile';
import AuthorPage from './pages/AuthorPage';
import AuthorsPage from './pages/AuthorsPage';
import SearchPage from './pages/SearchPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import NotFound from './pages/NotFound';

// Components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthorRoute from './components/AuthorRoute';
import Footer from './components/Layout/Footer.jsx';
import ScrollToTopButton from './components/ScrollToTopButton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Sidebar />
            <main className="flex-1 min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/author/:username" element={<AuthorPage />} />
                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage/>} />
                
                {/* Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes - Admin Only */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <ManageUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/articles" element={
                  <AdminRoute>
                    <AdminArticlesList />
                  </AdminRoute>
                } />
                
                {/* Author Routes - Authors and Admins */}
                <Route path="/author/dashboard" element={
                  <AuthorRoute>
                    <AuthorDashboard />
                  </AuthorRoute>
                } />
                <Route path="/author/articles" element={
                  <AuthorRoute>
                    <AuthorArticlesList />
                  </AuthorRoute>
                } />
                <Route path="/author/articles/create" element={
                  <AuthorRoute>
                    <AuthorCreateArticle />
                  </AuthorRoute>
                } />
                <Route path="/author/articles/edit/:id" element={
                  <AuthorRoute>
                    <AuthorEditArticle />
                  </AuthorRoute>
                } />
                
                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ScrollToTopButton />
          </div>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
