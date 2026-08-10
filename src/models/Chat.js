import mongoose from "mongoose";
import crypto from "crypto";

import { CHAT_TYPES, PARTICIPANT_ROLES } from "../constants/chat.constants.js";

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(PARTICIPANT_ROLES),
      default: PARTICIPANT_ROLES.MEMBER,
    },
  },
  {
    _id: false,
  },
);

const chatSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(CHAT_TYPES),
      default: CHAT_TYPES.PRIVATE,
      index: true,
    },

    participants: {
      type: [participantSchema],
      validate: {
        validator(value) {
          return value.length >= 2;
        },
        message: "A chat must contain at least two participants.",
      },
    },

    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      maxlength: 300,
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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

chatSchema.pre("validate", function () {
  if (!this.publicId) {
    this.publicId = `cht_${crypto.randomBytes(6).toString("hex")}`;
  }
});

chatSchema.index({
  "participants.user": 1,
});


const Chat =
  mongoose.models.Chat ||
  mongoose.model("Chat", chatSchema);

export default Chat;
