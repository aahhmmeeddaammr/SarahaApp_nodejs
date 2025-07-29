import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    fromName: { type: String },
    isLike: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
export const MessageModel = mongoose.models.message || mongoose.model("message", schema);
