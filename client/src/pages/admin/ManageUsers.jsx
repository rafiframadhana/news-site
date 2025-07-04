import React, { useState } from "react";
import {
  Button,
  Card,
  Badge,
  Modal,
  LoadingSpinner,
  Input,
} from "../../components/ui/index.jsx";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserRole,
} from "../../hooks/useUsers";
import { formatDate } from "../../utils/dateUtils";

const ManageUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState(null);
  const [newRole, setNewRole] = useState("");

  const { data, isLoading, error } = useUsers({
    page: currentPage,
    search: searchTerm,
    role: selectedRole === "all" ? undefined : selectedRole,
  });

  const deleteUserMutation = useDeleteUser();
  const updateUserRoleMutation = useUpdateUserRole();

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete._id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRoleUpdateClick = (user) => {
    setUserToUpdateRole(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleRoleUpdateConfirm = async () => {
    if (!userToUpdateRole || !newRole) return;

    try {
      await updateUserRoleMutation.mutateAsync({
        id: userToUpdateRole._id,
        role: newRole,
      });
      setRoleModalOpen(false);
      setUserToUpdateRole(null);
      setNewRole("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: "danger",
      author: "primary",
      user: "default",
    };

    const icons = {
      admin: (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      author: (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      user: (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    };

    return (
      <Badge
        variant={variants[role] || "default"}
        size="sm"
        className="flex items-center"
      >
        {icons[role]}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Users
          </h1>
          <p className="text-gray-600">
            Manage user accounts and role permissions across the platform
          </p>
        </div>
        <div className="flex justify-center text-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Users
          </h1>
          <p className="text-gray-600">
            Manage user accounts and role permissions across the platform
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
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
            Failed to load users
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            There was a problem retrieving user data. Please try again or
            contact support if the issue persists.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center mx-auto"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h1>
        <p className="text-gray-600">
          Manage user accounts and role permissions across the platform
        </p>
      </div>

      {/* Filters and Search */}
      <Card padding="md" className="mb-6 shadow-sm py-2 px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="lg:ml-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", "admin", "author", "user"].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? "bg-black text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Users List */}
      {users.length === 0 ? (
        <Card className="text-center py-16 shadow-sm">
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">
              No users found
            </h3>
            <p className="text-gray-600 mx-auto max-w-xs">
              {searchTerm
                ? "No users match your search criteria. Try a different search term or filter."
                : selectedRole !== "all"
                ? `No users with the role "${selectedRole}" were found.`
                : "No users found in the system."}
            </p>
            {(searchTerm || selectedRole !== "all") && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRole("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card
              key={user._id}
              padding="md"
              hover
              className="shadow-sm transition-all duration-200 hover:shadow-md py-2 px-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white shadow-sm">
                      <span className="text-lg font-medium">
                        {user.firstName
                          ? `${user.firstName[0]}${
                              user.lastName ? user.lastName[0] : ""
                            }`
                          : user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.fullName || user.name || user.username}
                      </h3>
                      {getRoleBadge(user.role)}
                      {user.isActive && (
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500 ml-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        <svg
                          className="mr-1 h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Joined {formatDate(user.createdAt)}
                      </span>
                      {user.lastLogin && (
                        <span className="inline-flex items-center">
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Last active {formatDate(user.lastLogin)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-2 justify-between lg:gap-60">
                  {/* User Stats */}
                  <div className="flex items-center space-x-6 text-sm">
                    {user.role === "author" && (
                      <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">
                          {user.articlesCount || 0}
                        </div>
                        <div className="text-gray-600">Articles</div>
                      </div>
                    )}
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                      <div
                        className={`font-medium ${
                          user.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </div>
                      <div className="text-gray-600">Status</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleUpdateClick(user)}
                      className="flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Edit Role
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(user)}
                      disabled={deleteUserMutation.isLoading}
                      className="flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 border-t pt-6">
          <nav className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page{" "}
                  <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>

              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-l-md"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-r-md"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </nav>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Delete confirmation
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Are you sure you want to delete "
                {userToDelete?.fullName ||
                  userToDelete?.name ||
                  userToDelete?.username}
                "? This action cannot be undone and will also delete all their
                articles and content.
              </p>
            </div>
          </div>

          {userToDelete?.role === "admin" && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Warning:</span> You are about to
                delete an admin user. Make sure this action is authorized.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={deleteUserMutation.isLoading}
              className="flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {deleteUserMutation.isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Role Update Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Update User Role"
      >
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {userToUpdateRole && (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white">
                  <span className="text-lg font-medium">
                    {userToUpdateRole.firstName
                      ? `${userToUpdateRole.firstName[0]}${
                          userToUpdateRole.lastName
                            ? userToUpdateRole.lastName[0]
                            : ""
                        }`
                      : userToUpdateRole.name
                      ? userToUpdateRole.name.charAt(0).toUpperCase()
                      : userToUpdateRole.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {userToUpdateRole?.fullName ||
                  userToUpdateRole?.name ||
                  userToUpdateRole?.username}
              </h3>
              <p className="text-sm text-gray-600">{userToUpdateRole?.email}</p>
              <p className="text-sm text-gray-600 mt-1">
                Current role:{" "}
                <span className="font-medium">{userToUpdateRole?.role}</span>
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign New Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["user", "author", "admin"].map((role) => (
                <div
                  key={role}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    newRole === role
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setNewRole(role)}
                >
                  <div className="font-medium text-gray-900 capitalize">
                    {role}
                  </div>
                  <div className="text-xs text-gray-500">
                    {role === "admin" && "Full access to all features"}
                    {role === "author" && "Can create and manage content"}
                    {role === "user" && "Limited to basic features"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {newRole === "admin" && userToUpdateRole?.role !== "admin" && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Caution:</span> You are about to
                grant full administrative privileges to this user.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-2">
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRoleUpdateConfirm}
              loading={updateUserRoleMutation.isLoading}
              disabled={!newRole || newRole === userToUpdateRole?.role}
              className="flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {updateUserRoleMutation.isLoading ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
