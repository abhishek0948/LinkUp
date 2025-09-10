const otpGenerate = require("../utils/otpGenerator");

const sendOtp = async (req,res) => {
    const {phoneNumber, phoneSuffix, email} = req.body;
    const otp = otpGenerate();
}