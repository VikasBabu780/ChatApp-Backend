import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
      match: [/^[a-z0-9._]+$/, "Invalid username"],
    },

    usernameLastChangedAt: {
      type: Date,
      default: Date.now,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    mobileNumber: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpiry: {
      type: Date,
      default: null,
    },

    avatar: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    coverImage: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    bio: {
      type: String,
      default: "",
      maxlength: 150,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    accessToken: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    privacy: {
      friendRequestPermission: {
        type: String,
        enum: ["EVERYONE", "NOBODY"],
        default: "EVERYONE",
      },
      messagePermission: {
        type: String,
        enum: ["EVERYONE", "FRIENDS_ONLY", "NOBODY"],
        default: "EVERYONE",
      },
      groupInvitePermission: {
        type: String,
        enum: ["EVERYONE", "FRIENDS_ONLY", "NOBODY"],
        default: "FRIENDS_ONLY",
      },

      showLastSeen: {
        type: Boolean,
        default: true,
      },

      showOnlineStatus: {
        type: Boolean,
        default: true,
      },

      readReceipts: {
        type: Boolean,
        default: true,
      },

      showTypingIndicator: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("validate", function () {
  if (!this.publicId) {
    this.publicId = `usr_${crypto.randomBytes(6).toString("hex")}`;
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // Already hashed in PendingRegistration
  if (this.password.startsWith("$2b$")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      publicId: this.publicId,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

const User = mongoose.model("User", userSchema);

export default User;
