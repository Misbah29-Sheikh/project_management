import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationContent, forgotPasswordContent, sendEmail } from "../utils/mail.js"
import jwt from "jsonwebtoken"
import crypto from "crypto";

const accessTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds (matches 1d)
  }

  const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds (matches 10d)
  }

const generateAccesAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken } // return the RAW token to send to client

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access token");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists", [])
  }

  const user = await User.create({
    email,
    password,
    username,
    fullName,
    isEmailVerified: false
  })

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false })

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
    )
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user")
  }

  return res.status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email"
      )
    )
})

const login = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is incorrect")
  }

  const { accessToken, refreshToken } = await generateAccesAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    )
})

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: ""
      }
    },
    {
      new: true
    }
  )

  return res.status(200)
    .clearCookie("accessToken", accessTokenOptions)
    .clearCookie("refreshToken", refreshTokenOptions)
    .json(
      new ApiResponse(200, {}, "User logged out")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing")
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }
  })

  if (!user) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/verify-email?status=error`
    );
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true
  await user.save({ validateBeforeSave: false })

  return res.redirect(
    `${process.env.FRONTEND_URL}/verify-email?status=success`
  );
})

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "user does not exist")
  }
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified")
  }

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false })

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
    )
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Mail has been sent to your email ID")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access")
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  } catch (error) {
    throw new ApiError(401, "Refresh token is expired or invalid")
  }

  const user = await User.findById(decodedToken?._id)

  if (!user) {
    throw new ApiError(401, "Invalid refresh token")
  }

  const hashedIncoming = crypto.createHash("sha256").update(incomingRefreshToken).digest("hex");

  if (hashedIncoming !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is invalid or has been used")
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateAccesAndRefreshTokens(user._id)

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
    )
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false })

  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    )
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    )
})

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params
  const { newPassword } = req.body

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() }
  })

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired")
  }

  user.forgotPasswordExpiry = undefined
  user.forgotPasswordToken = undefined

  user.password = newPassword
  user.refreshToken = undefined
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset successfull"
      )
    )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old Password")
  }

  const isSamePassword = await user.isPasswordCorrect(newPassword)

  if (isSamePassword) {
    throw new ApiError(400, "New password must be different from your old password")
  }

  user.password = newPassword
  user.refreshToken = undefined  // 👈 same reasoning as resetPassword
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

export {
  registerUser, login, logout, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken,
  forgotPasswordRequest, resetPassword, changeCurrentPassword
}