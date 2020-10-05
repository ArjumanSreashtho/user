const mailgun = require("mailgun-js");

const keys = require("../config/keys");

const messages = mailgun({
  apiKey: keys.MAILGUN_API_KEY,
  domain: keys.MAILGUN_DOMAIN,
});

const sendEmail = (verificationCode, email) => {
  console.log(verificationCode, email);
  const data = {
    from: "<onlyjava45@gmail.com>",
    to: email,
    subject: "Verification Code",
    text: `Your verification code is ${verificationCode}`,
  };
  messages.messages().send(data, function (error, body) {
    if (error) {
      return { error: error.message };
    }
  });
};

exports.sendEmail = sendEmail;
