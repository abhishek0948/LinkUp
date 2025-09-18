import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaUser, FaEnvelope } from "react-icons/fa6";

import CountryDropDown from "./CountryDropDown";
import Spinner from "../../utils/Spinner";
import countries from "../../utils/countries";

// Validation schema for the login form
const validationSchema = yup.object().shape({
  phoneNumber: yup.string().nullable().matches(/^\d*$/, "Phone number must be digits only"),
  email: yup.string().nullable().email("Please enter a valid email"),
  country: yup.object().required(),
}).test(
  "at-least-one-required",
  "Either Email or Phone Number is required",
  (value) => !!value.phoneNumber || !!value.email
);


const LoginForm = ({ onSubmit, loading, theme }) => {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      phoneNumber: "",
      email: "",
      country: countries[0],
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>
        Enter your phone number or email to receive an OTP.
      </p>

      {/* Phone Number Input */}
      <div>
        <div className="flex">
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <CountryDropDown
                value={field.value}
                onChange={field.onChange}
                theme={theme}
              />
            )}
          />
          <input
            type="tel"
            {...register("phoneNumber")}
            placeholder="Phone Number"
            className={`w-2/3 px-4 py-2 border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.phoneNumber ? "border-red-500" : ""}`}
          />
        </div>
        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
      </div>

      <div className="flex items-center">
        <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600" />
        <span className="mx-3 text-gray-500 text-sm font-medium">OR</span>
        <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600" />
      </div>

      {/* Email Input */}
      <div>
        <div className={`relative flex items-center border rounded-lg px-3 py-2 ${theme === 'dark' ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
          <FaEnvelope className={`mr-2 ${theme === 'dark' ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="email"
            {...register("email")}
            placeholder="Enter email"
            className={`w-full bg-transparent focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center font-semibold"
      >
        {loading ? <Spinner /> : "Send OTP"}
      </button>
    </form>
  );
};

export default LoginForm;
