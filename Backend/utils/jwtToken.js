export const generateToken = (user, message, statusCode, res) => {
  // create token
  const token = user.generateJsonWebToken();

  // choose cookie name
  const cookieName = user.role === "Admin" ? "adminToken" : "patientToken";

  // ensure numeric cookie expiry days (fallback to 7 days if env missing)
  const expireDays = Number(process.env.COOKIE_EXPIRE) || 7;
  const expires = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

  // cookie options: httpOnly always, secure in production, sameSite recommended
  const cookieOptions = {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
    sameSite: "Lax" // or "Strict" depending on your cross-site requirements
  };

  // produce a safe user object (remove sensitive fields)
  // if `user` is a Mongoose document, use toObject(); otherwise shallow clone
  const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  // remove sensitive fields explicitly
  const { password, __v, resetPasswordToken, resetPasswordExpires, ...safeUser } = userObj;

  // set cookie and return minimal info (no token in JSON body)
  return res
    .status(statusCode)
    .cookie(cookieName, token, cookieOptions)
    .json({
      success: true,
      message,
      user: safeUser
    });
};
