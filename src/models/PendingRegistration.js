import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    otp: {
      type: String,
      required: true,
      select: false,
    },

    otpExpiry: {
      type: Date,
      required: true,
      expires: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },

    resendCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const PendingRegistration = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema,
);

export default PendingRegistration;
