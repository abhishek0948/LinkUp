const User = require("../models/User.Model");
const sendOtpToEmail = require("../services/emailService");
const otpGenerate = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService = require("../services/twilioService");
const generateToken = require("../utils/generateToken");

const sendOtp = async (req,res) => {
    const {phoneNumber, phoneSuffix, email} = req.body;
    const otp = otpGenerate();
    const expiry = new Date(Date.now() + 5*60*1000);

    let user = null;
    try {
        if(email) {
            user = await User.findOne({email:email});
            
            if(!user) {
                user = new User({email});
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;  
            await user.save();
            await sendOtpToEmail(email,otp);
            return response(res,200,'Otp sent to email',{email});
        }

        if(!phoneNumber || !phoneSuffix) {
            return response(res,400,'Phone number and PhoneSuffix are required');
        }
        const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
        user = await User.findOne({ phoneNumber, phoneSuffix });
        if(!user) {
            user = new User({phoneNumber,phoneSuffix});
        }

        await user.save();
        await twilioService.sendOtpToPhoneNumber(fullPhoneNumber)
        return response(res,200,'Otp sent successfully',user);
    } catch (error) {
        return response(res,500,'Internal server error',)
    }
}

const verifyOtp = async (req,res) => {
    const {phoneNumber, phoneSuffix, email, otp} = req.body; 

    try {
        let user;
        if(email) {
            user = await User.findOne({email});
            if(!user) {
                return response(res,404,'user not found');
            }

            const now = new Date();
            if(!user.emailOtp || String(user.emailOtp)!=String(otp) || now > new Date(user.emailOtpExpiry)) {
                if (now > new Date(user.emailOtpExpiry)) {
                    user.emailOtp = null;
                    user.emailOtpExpiry = null;
                    await user.save();
                }
                return response(res,400,'Invalid or expired otp');
            }

            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpiry = null;

            await user.save();
        } else {
            if(!phoneNumber || !phoneSuffix) {
                return response(res,400,'Phone number and PhoneSuffix are required');
            }

            const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
            user = await User.findOne({ phoneNumber, phoneSuffix });
            if(!user) {
                return response(res,404,'user not found');
            }

            const result = await twilioService.verifyOtp(fullPhoneNumber,otp);
            if(result.status !== 'approved') {
                return response(res,400,'Invalid otp');
            }

            user.isVerified = true;
            await user.save();
        }

        const token = generateToken(user?._id);
        res.cookie("token",token,{
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
        
        return response(res,200,'otp verified successfully',{token,user});
    } catch (error) {
        console.error("Otp verification failed",error);
        return response(res,500,"Internal server error");
    }
}

module.exports = {
    sendOtp,
    verifyOtp
}