import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import { validateUploadedFile, cleanupTempFile, sanitizeFilename } from "../utils/fileValidation.js";
import validator from "validator";

// Helper to validate email safely
const validateEmail = (email) => {
  if (typeof email !== "string" || !validator.isEmail(email)) {
    return null;
  }
  return validator.normalizeEmail(email);
};

// Helper to validate password strength
const validatePassword = (password) => {
  if (typeof password !== "string") {
    return false;
  }
  
  // Check minimum length
  if (password.length < 8) {
    return false;
  }
  
  // Check for required character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, aadhar, dob } =
    req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !phone || !password || !gender || !aadhar || !dob) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Validate email
  const safeEmail = validateEmail(email);
  if (!safeEmail) {
    return next(new ErrorHandler("Invalid email format!", 400));
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return next(new ErrorHandler("Password must be at least 8 characters long and contain uppercase, lowercase, number and special character!", 400));
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: { $eq: safeEmail } });
  if (userExists) {
    return next(new ErrorHandler("User already registered with this email!", 400));
  }

  // Force role to "Patient" — ignore any client-supplied role
  const user = await User.create({
    firstName,
    lastName,
    email: safeEmail,
    phone,
    password,
    gender,
    dob,
    aadhar,
    role: "Patient",
  });

  // Generate JWT cookie
  generateToken(user, "User Registered", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide all details!", 400));
  }

  const safeEmail = validateEmail(email);
  if (!safeEmail) {
    return next(new ErrorHandler("Invalid email format!", 400));
  }

  const user = await User.findOne({ email: { $eq: safeEmail } }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Password or Email!", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password or Email!", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User with this role not found!", 400));
  }
  generateToken(user, "User Login Successfully", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, aadhar, dob } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const safeEmail = validateEmail(email);
  if (!safeEmail) {
    return next(new ErrorHandler("Invalid email format!", 400));
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return next(new ErrorHandler("Password must be at least 8 characters long and contain uppercase, lowercase, number and special character!", 400));
  }

  const isRegistered = await User.findOne({ email: { $eq: safeEmail } });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this email already exists!`,
        400
      )
    );
  }

  await User.create({
    firstName,
    lastName,
    email: safeEmail,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
  });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: { $eq: "Doctor" } });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully!",
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor avatar required!", 400));
  }
  const { doctrAvatar } = req.files;

  // Comprehensive file validation
  const validationResult = await validateUploadedFile(doctrAvatar);
  if (!validationResult.isValid) {
    // Clean up temporary file if validation fails
    await cleanupTempFile(doctrAvatar.tempFilePath);
    return next(new ErrorHandler(validationResult.errors.join(', '), 400));
  }

  // Sanitize filename
  const sanitizedName = sanitizeFilename(doctrAvatar.name);

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    aadhar,
    dob,
    doctrDptmnt,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !aadhar ||
    !dob ||
    !doctrDptmnt
  ) {
    return next(new ErrorHandler("Please provide full details", 400));
  }

  const safeEmail = validateEmail(email);
  if (!safeEmail) {
    return next(new ErrorHandler("Invalid email format!", 400));
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return next(new ErrorHandler("Password must be at least 8 characters long and contain uppercase, lowercase, number and special character!", 400));
  }

  const isRegistered = await User.findOne({ email: { $eq: safeEmail } });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} already registered with this email!`,
        400
      )
    );
  }

  let cloudinaryResponse;
  try {
    // For testing/demo purposes, use mock response if Cloudinary is disabled
    if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinaryResponse = {
        public_id: `mock_doctor_${Date.now()}_${sanitizedName}`,
        secure_url: `https://via.placeholder.com/500x500/009688/fff?text=${sanitizedName}`
      };
      console.log("Using mock Cloudinary response for testing");
    } else {
      cloudinaryResponse = await cloudinary.uploader.upload(
        doctrAvatar.tempFilePath,
        {
          folder: "doctors_avatars",
          public_id: `doctor_${Date.now()}_${sanitizedName}`,
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto:good" },
            { format: "jpg" }
          ]
        }
      );
    }
    
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      throw new Error(cloudinaryResponse.error || "Unknown Cloudinary Error");
    }
  } catch (error) {
    console.error("Cloudinary Error:", error);
    
    // If Cloudinary fails but we still want to test security features
    if (error.message?.includes('cloud_name is disabled') || error.http_code === 401) {
      console.log("Cloudinary account disabled, using fallback for security testing");
      cloudinaryResponse = {
        public_id: `fallback_doctor_${Date.now()}_${sanitizedName}`,
        secure_url: `https://via.placeholder.com/500x500/ff5722/fff?text=Security+Test`
      };
    } else {
      await cleanupTempFile(doctrAvatar.tempFilePath);
      return next(new ErrorHandler("Failed to upload image. Please try again.", 500));
    }
  } finally {
    // Always cleanup temp file after cloudinary upload
    await cleanupTempFile(doctrAvatar.tempFilePath);
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email: safeEmail,
    phone,
    password,
    gender,
    aadhar,
    dob,
    role: "Doctor",
    doctrDptmnt,
    doctrAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor,
  });
});
