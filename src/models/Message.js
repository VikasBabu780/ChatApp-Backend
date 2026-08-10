import mongoose from "mongoose";
import crypto from "crypto";
import { MESSAGE_TYPES } from "../constants/chat.constants.js";

const messageSchema = new mongoose.Schema(
  {
    // Unique public ID
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Chat to which this message belongs
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },

    // Sender
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Message type
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPES),
      default: MESSAGE_TYPES.TEXT,
    },

    // Text content
    content: {
      type: String,
      default: "",
      trim: true,
    },

    // Media attachment
    attachment: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
      fileName: {
        type: String,
        default: "",
      },
      fileSize: {
        type: Number,
        default: 0,
      },
    },

    // Reply feature
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Edit feature
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    // Delete for everyone
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // Delete for me
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Read receipts
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Delivery receipts
    deliveredTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Emoji reactions
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
        },
      },
    ],

    // Forwarded message
    isForwarded: {
      type: Boolean,
      default: false,
    },
    // Pin message
    isPinned: {
      type: Boolean,
      default: false,
    },

    pinnedAt: {
      type: Date,
      default: null,
    },

    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.pre("validate", function () {
  if (!this.publicId) {
    this.publicId = `msg_${crypto.randomBytes(6).toString("hex")}`;
  }
});

export default mongoose.model("Message", messageSchema);
