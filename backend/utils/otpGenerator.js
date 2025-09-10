const otpGenerator = require("otp-generator");

const otpGenerate = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

module.exports = otpGenerate;
