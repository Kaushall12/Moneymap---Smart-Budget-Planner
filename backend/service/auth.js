const jwt = require("jsonwebtoken");
const secret = process.env.secret; // You may move this to environment variables for security

// Create JWT token
function createToken(user) {
  // const payload = {
  //   _id: user._id,
  //   email: user.email,
  // };

  // Token expires in 1 day (adjust as needed)
  const token = jwt.sign({user}, secret, { expiresIn: "1d" });
  return token;
}

// Validate JWT token
function validateToken(token) {
  try {
    const payload = jwt.verify(token, secret);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, message: err.message };
  }
}

module.exports = {
  createToken,
  validateToken,
};
