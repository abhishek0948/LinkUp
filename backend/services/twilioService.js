const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid,authToken);

const sendOtpToPhoneNumber = async(phoneNumber) => {
    try {
        if(!phoneNumber) {
            throw new Error("phone number is required");
        }
        const res = await client.verify.v2.services(serviceSid).verifications.create({
            to: phoneNumber,
            channel: 'sms'
        })
        console.log("Otp response is:",res);
        return res;
    } catch (error) {
        console.error("Error sending otp to phone number",error);
        throw new Error("failed to send otp");
    }
}

const verifyOtp = async(phoneNumber,otp) => {
    try { 
        const res = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber,
            code: otp
        })
        return res;
    } catch (error) {
        console.log("failed to verify otp:",error);
        throw new Error("otp verification failed");
    }
}

module.exports = {
    sendOtpToPhoneNumber,
    verifyOtp
}