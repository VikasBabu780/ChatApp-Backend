import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate requests
friendRequestSchema.index(
  {
    sender: 1,
    receiver: 1,
  },
  {
    unique: true,
  },
);

// Fast lookups
friendRequestSchema.index({ sender: 1 });
friendRequestSchema.index({ receiver: 1 });
friendRequestSchema.index({ status: 1 });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
