const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    fromId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
export const MessageModel = mongoose.models.message || mongoose.model("message", schema);
