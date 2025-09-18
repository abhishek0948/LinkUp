import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUser, FaPlus } from 'react-icons/fa6';

import AvatarPicker from './AvatarPicker';
import Spinner from '../../utils/Spinner';

const profileValidationSchema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  agreed: yup.bool().oneOf([true], 'You must accept the terms and conditions'),
  selectedAvatar: yup.string().required(),
  profilePictureFile: yup.mixed().nullable(),
});

const ProfileForm = ({ onSubmit, loading, theme }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(profileValidationSchema),
    defaultValues: {
      agreed: false,
      selectedAvatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix' // Default avatar
    }
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const selectedAvatar = watch("selectedAvatar");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("profilePictureFile", file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 mb-4">
          <img
            src={profilePicturePreview || selectedAvatar}
            alt="Profile"
            className="w-full h-full rounded-full object-cover ring-4 ring-blue-200 dark:ring-blue-800"
          />
          <label
            htmlFor="profile-picture-upload"
            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition"
          >
            <FaPlus className="w-4 h-4" />
          </label>
          <input
            type="file"
            id="profile-picture-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <AvatarPicker
            selectedValue={selectedAvatar}
            onChange={(avatarUrl) => setValue("selectedAvatar", avatarUrl)}
        />
      </div>

      <div>
        <div className={`relative flex items-center border rounded-lg px-3 py-2 ${theme === 'dark' ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
          <FaUser className={`mr-2 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`} />
          <input
            {...register("username")}
            type="text"
            placeholder="Username"
            className={`w-full bg-transparent focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
        </div>
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <div className="flex items-center space-x-2">
          <input
            {...register("agreed")}
            type="checkbox"
            id="terms-agreed"
            className={`w-4 h-4 rounded ${theme === 'dark' ? 'text-blue-400 bg-gray-600 border-gray-500' : 'text-blue-600'} focus:ring-blue-500`}
          />
          <label htmlFor="terms-agreed" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            I agree to the{' '}
            <a href="#" className="text-blue-500 hover:underline">
              Terms and Conditions
            </a>
          </label>
        </div>
        {errors.agreed && <p className="text-red-500 text-sm mt-1">{errors.agreed.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center font-semibold"
      >
        {loading ? <Spinner /> : 'Create Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;
