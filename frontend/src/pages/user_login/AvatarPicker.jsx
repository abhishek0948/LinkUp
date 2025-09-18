import React from 'react';

const avatars = [
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe",
];

const AvatarPicker = ({ selectedValue, onChange }) => {
  return (
    <>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or choose an avatar</p>
      <div className="flex flex-wrap justify-center gap-3">
        {avatars.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt={`Avatar ${index + 1}`}
            className={`w-14 h-14 rounded-full cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 ${selectedValue === avatar ? "ring-4 ring-blue-500" : "ring-2 ring-transparent"}`}
            onClick={() => onChange(avatar)}
          />
        ))}
      </div>
    </>
  );
};

export default AvatarPicker;