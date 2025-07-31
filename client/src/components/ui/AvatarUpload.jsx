import { useState } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import AvatarEditModal from './AvatarEditModal';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate, userInitials = "U" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Clickable Avatar */}
      <div 
        className="relative group cursor-pointer"
        onClick={handleOpenModal}
        title="Click to edit profile photo"
      >
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-2 border-transparent group-hover:border-blue-300 transition-all duration-200">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-blue-600 font-semibold text-2xl">
              {userInitials}
            </span>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <FiEdit3 className="text-white text-xl" />
          </div>
        </div>
      </div>

      {/* Avatar Edit Modal */}
      <AvatarEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentAvatar={currentAvatar}
        onAvatarUpdate={onAvatarUpdate}
        userInitials={userInitials}
      />
    </>
  );
};

export default AvatarUpload;
