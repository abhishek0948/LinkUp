const sendOtpToEmail = require("../services/emailService");
const otpGenerate = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService = require("../services/twilioService");
const generateToken = require("../utils/generateToken");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");

const User = require("../models/User.Model");
const Conversation = require('../models/Conversation.Model');

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
        res.cookie("auth_token",token,{
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });

        return response(res,200,'otp verified successfully',{token,user});
    } catch (error) {
        console.error("Otp verification failed",error);
        return response(res,500,"Internal server error");
    }
}

const updateProfile = async (req,res) => {
    const {username, agreed, about} = req.body;
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId);
        const file = req.file;

        if(file) {
            const uploadResult = await uploadFileToCloudinary(file);
            user.profilePicture = uploadResult?.secure_url;
        } else if(req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }
        
        if(username) user.username = username;
        if(agreed)  user.agreed = agreed;
        if(about) user.about = about;

        await user.save();

        return response(res,200,'user profile updated',{user});
    } catch (error) {
        console.error("user profile updated filed",error);
        return response(res,500,"Internal server error");
    }
}

const checkAuth = async (req,res,next) => {
    try {
        const userId = req.user.userId;
        if(!userId) {
            return response(res,404,'unauthorized! please login');
        }

        const user = await User.findById(userId);
        if(!user) {
            return response(res,404,'user not found, invalid token');
        }

        return response(res,200,'user authenticated',{user});
    } catch (error) {
        console.error("checkauth failed",error);
        return response(res,500,"Internal server error");
    }
}

const logout = async(req,res) => {
    try {
        res.cookie("auth_token","",{expires: new Date(0)});
        return response(res,200,'user logout successfull');
    } catch (error) {
        console.error("logout failed",error);
        return response(res,500,"Internal server error");
    }
}

const getAllUsers = async (req,res) => {
    const loggedInUser = req.user?.userId;
    try {
        const users = await User.find({_id:{$ne:loggedInUser}}).select(
            "username profilePicture lastSeen isOnline about phoneNumber phoneSuffix"
        ).lean();

        const usersWithConversation = await Promise.all(
            users.map(async (user) => {
                const conversation = await Conversation.findOne({
                    participants:{$all : [loggedInUser,user?._id]}
                }).populate({
                    path:"lastMessage",
                    select: 'content createdAt sender receiver'
                }).lean();

                return {
                    ...user,
                    conversation: conversation | null
                }
            })
        )

        return response(res,200,'fetched all users',usersWithConversation);
    } catch (error) {
        console.error("error fetching all user conversations",error);
        return response(res,500,'Internal server error');
    }
}

module.exports = {
    sendOtp,
    verifyOtp,
    updateProfile,
    logout,
    checkAuth,
    getAllUsers
}