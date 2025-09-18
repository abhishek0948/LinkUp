import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import { FaLink } from "react-icons/fa6";
import { toast } from "react-toastify";

import useLoginStore from "../../store/useLoginStore";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/useThemeStore";
import { sendOtp, verifyOtp, updateUserProfile } from "../../services/user.service";

import ProgressBar from "./ProgressBar";
import LoginForm from "./LoginForm";
import OtpForm from "./OtpForm";
import ProfileForm from "./ProfileForm";


const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { step, setStep, userPhoneData, setUserPhoneData, resetLoginState } = useLoginStore();
  const { setUser } = useUserStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const onLoginSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const { phoneNumber, country, email } = data;

      const response = email
        ? await sendOtp(null, null, email)
        : await sendOtp(phoneNumber, country.dialCode, null);

      if (response.status === "success") {
        toast.info(`OTP sent to your ${email ? "email" : "phone"}`);
        setUserPhoneData(email ? { email } : { phoneNumber, phoneSuffix: country.dialCode });
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      if (!userPhoneData) throw new Error("Login data is missing. Please go back.");

      const otpString = data.otp;
      const response = userPhoneData.email
        ? await verifyOtp(null, null, userPhoneData.email, otpString)
        : await verifyOtp(userPhoneData.phoneNumber, userPhoneData.phoneSuffix, null, otpString);

      if (response.status === "success") {
        toast.success("OTP verified successfully!");
        const user = response.data.user;
        if (user?.username && user?.profilePicture) {
          setUser(user);
          toast.success("Welcome back to LinkUp!");
          navigate("/");
          resetLoginState();
        } else {
          setStep(3); 
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to verify OTP. Please check the code and try again.");
      toast.error("Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);

      if (data.profilePictureFile) {
        formData.append("media", data.profilePictureFile);
      } else {
        formData.append("profilePicture", data.selectedAvatar);
      }

      const response = await updateUserProfile(formData);

      console.log(response);
      if (response.status === "success") {
        setUser(response.data.user);
        toast.success("Welcome to LinkUp! Your profile is ready.");
        navigate("/");
        resetLoginState();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create profile. Please try again.");
      toast.error("Could not create profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setUserPhoneData(null);
    setError("");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <LoginForm onSubmit={onLoginSubmit} loading={loading} theme={theme} />;
      case 2:
        return <OtpForm onSubmit={onOtpSubmit} onBack={handleBack} loading={loading} theme={theme} />;
      case 3:
        return <ProfileForm onSubmit={onProfileSubmit} loading={loading} theme={theme} />;
      default:
        return <LoginForm onSubmit={onLoginSubmit} loading={loading} theme={theme} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-blue-100"} flex items-center justify-center p-4 overflow-hidden`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"} p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <FaLink className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          Welcome to LinkUp
        </h1>

        <ProgressBar step={step} theme={theme} />

        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

        <div className="mt-6">
            {renderStep()}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
