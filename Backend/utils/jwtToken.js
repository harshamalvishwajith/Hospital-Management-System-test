export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  const cookieName = user.role === "Admin" ? "adminToken" : "patientToken";

  // safer: parseInt with radix, fallback to 7 days
  const expireDays = parseInt(process.env.COOKIE_EXPIRE, 10);
  const expires = new Date(Date.now() + (isNaN(expireDays) ? 7 : expireDays) * 24 * 60 * 60 * 1000);

  // configurable sameSite via env
  const sameSite = process.env.COOKIE_SAMESITE || "Lax";

  const cookieOptions = {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite
  };

  // ✅ Whitelist approach for user fields
  const whitelistUser = (userDoc) => {
    const obj = typeof userDoc.toObject === "function" ? userDoc.toObject() : { ...userDoc };

    // Only expose safe fields (expand this list as needed)
    const safeFields = ["_id", "name", "email", "role"];
    return safeFields.reduce((acc, key) => {
      if (obj[key] !== undefined) acc[key] = obj[key];
      return acc;
    }, {});
  };

  const safeUser = whitelistUser(user);

  return res
    .status(statusCode)
    .cookie(cookieName, token, cookieOptions)
    .json({
      success: true,
      message,
      user: safeUser
    });
};
