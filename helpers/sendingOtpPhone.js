const twilio = require("twilio");
require("dotenv").config(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

module.exports.sendSms = async(data) => {
  try {
    const response = await client.messages.create({
      body: `${data.message}`,
      from: twilioPhoneNumber,
      to: `+91${data.toPhoneNumber}`,
    });

    console.log("SMS sent:", response.sid);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};