import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import useUserStore from "../store/useUserStore";
import useThemeStore from "../store/useThemeStore";

import { updateUserProfile } from "../services/user.service";

import Layout from "./Layout";
import { FaCamera, FaCheck, FaPencilAlt, FaSmile } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";

const UserDetails = () => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useUserStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (user) {
      setName(user?.username || "");
      setAbout(user?.about || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (field) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (field === "name") {
        formData.append("username", name);
        setIsEditingName(false);
        setShowNameEmoji(false);
      } else if (field === "about") {
        formData.append("about", about);
        setIsEditingAbout(false);
        setShowAboutEmoji(false);
      }

      if (profilePicture && field === "profile") {
        formData.append("media", profilePicture);
      }

      const updated = await updateUserProfile(formData);

      setUser(updated.data);
      setName(updated.data.username || "");
      setAbout(updated.data.about || "");
      setProfilePicture(null);
      setPreview(null);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error updating profile", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emoji, field) => {
    if (field === "name") {
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    } else {
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`min-h-screen w-full flex justify-center px-4 py-8 ${
          theme === "dark"
            ? "bg-[rgb(17,27,33)] text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <div
          className={`w-full max-w-3xl rounded-2xl shadow-md p-6 space-y-8 ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          {/* Header */}
          <h1 className="text-3xl font-semibold text-center mb-6">Profile</h1>

          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={preview || user?.profilePicture}
                alt="profile"
                className="w-48 h-48 rounded-full object-cover shadow-md"
              />
              <label
                htmlFor="profileUpload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <div className="text-white text-center">
                  <FaCamera className="h-7 w-7 mx-auto mb-1" />
                  <span className="text-sm">Change</span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  id="profileUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {preview && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => handleSave("profile")}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setProfilePicture(null);
                    setPreview(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gray-400 hover:bg-gray-500 text-white shadow-md disabled:opacity-60"
                >
                  Discard
                </button>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2 bg-white rounded-md p-3">
            <label className="text-sm font-medium text-gray-500">Your Name</label>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700 " : "bg-gray-50"
                  }`}
                />
              ) : (
                <span className="text-lg text-black">{name}</span>
              )}

              {isEditingName ? (
                <>
                  <button onClick={() => handleSave("name")}>
                    <FaCheck className="h-5 w-5 text-blue-500" />
                  </button>
                  <button onClick={() => setShowNameEmoji(!showNameEmoji)}>
                    <FaSmile className="h-5 w-5 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setShowNameEmoji(false);
                    }}
                  >
                    <MdCancel className="h-5 w-5 text-gray-500" />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingName(true)}>
                  <FaPencilAlt className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {showNameEmoji && (
              <div className="absolute z-10 mt-2">
                <EmojiPicker onEmojiClick={(emoji) => handleEmojiSelect(emoji, "name")} />
              </div>
            )}
          </div>

          {/* About Field */}
          <div className="space-y-2 bg-white rounded-md p-3">
            <label className="text-sm font-medium text-gray-500">About</label>
            <div className="flex items-center gap-2">
              {isEditingAbout ? (
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                  }`}
                />
              ) : (
                <span className="text-lg text-gray-800">{about}</span>
              )}

              {isEditingAbout ? (
                <>
                  <button onClick={() => handleSave("about")}>
                    <FaCheck className="h-5 w-5 text-blue-500" />
                  </button>
                  <button onClick={() => setShowAboutEmoji(!showAboutEmoji)}>
                    <FaSmile className="h-5 w-5 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingAbout(false);
                      setShowAboutEmoji(false);
                    }}
                  >
                    <MdCancel className="h-5 w-5 text-gray-500" />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingAbout(true)}>
                  <FaPencilAlt className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {showAboutEmoji && (
              <div className="absolute z-10 mt-2">
                <EmojiPicker onEmojiClick={(emoji) => handleEmojiSelect(emoji, "about")} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default UserDetails;