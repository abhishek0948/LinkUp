import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaArrowLeft } from 'react-icons/fa6';
import Spinner from '../../utils/Spinner';
import useLoginStore from '../../store/useLoginStore';

const otpValidationSchema = yup.object().shape({
    otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
});

const OtpForm = ({ onSubmit = () => {}, onBack = () => {}, loading = false, theme = 'light' }) => {
    const { userPhoneData } = useLoginStore();
    const { handleSubmit, control, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(otpValidationSchema),
        defaultValues: { otp: "" }
    });
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (element, index) => {
        const value = element.value;
        if (isNaN(value)) return false;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        const completeOtp = newOtp.join("");
        setValue("otp", completeOtp, { shouldValidate: completeOtp.length === 6 });

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (/^\d{6}$/.test(pasteData)) {
            const digits = pasteData.split('');
            setOtp(digits);
            setValue("otp", pasteData, { shouldValidate: true });
            inputRefs.current[5]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };
    
    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-4`}>
                Enter the 6-digit code sent to <br />
                <span className="font-semibold">{userPhoneData?.email || `${userPhoneData?.phoneSuffix} ${userPhoneData?.phoneNumber}`}</span>
            </p>

            <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                     <div className="flex justify-center gap-2 md:gap-4" onPaste={handlePaste}>
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className={`w-12 h-14 text-center text-xl font-semibold border rounded-lg ${errors.otp ? 'border-red-500' : (theme === "dark" ? "border-gray-600" : "border-gray-300")} ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            />
                        ))}
                    </div>
                )}
            />
            {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp.message}</p>}
            
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center font-semibold"
            >
                {loading ? <Spinner /> : 'Verify OTP'}
            </button>
            <button
                type="button"
                onClick={onBack}
                className={`w-full mt-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} py-3 rounded-lg transition flex items-center justify-center`}
            >
                <FaArrowLeft className="mr-2" />
                <span>Wrong Number/Email? Go Back</span>
            </button>
        </form>
    );
};

export default OtpForm;