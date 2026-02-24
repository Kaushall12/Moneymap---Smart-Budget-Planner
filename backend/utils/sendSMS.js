const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;

if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
  console.warn("Twilio credentials not found in config/config.js or env. sendSMS will throw if used.");
}

module.exports = async function sendSMS(to, message) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    throw new Error("Twilio credentials missing. Set config/config.js TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.");
  }

  // Ensure 'to' is E.164 like +919876543210
  if (!to || typeof to !== "string") {
    throw new Error("Invalid recipient phone number (to). Provide E.164 format string like +919876543210");
  }

  try {
    const client = require("twilio")(TWILIO_SID, TWILIO_TOKEN);
    const res = await client.messages.create({
      body: message,
      from: TWILIO_FROM,
      to: to
    });
    return res;
  } catch (err) {
    // Twilio error object has useful info
    const e = new Error("Twilio send failed: " + (err.message || String(err)));
    e.raw = err;
    throw e;
  }
};
