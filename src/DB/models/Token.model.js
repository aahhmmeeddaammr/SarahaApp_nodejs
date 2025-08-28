import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    jti: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiredAt: Date,
  },
  {
    timestamps: true,
  }
);
export const TokenModel = mongoose.models.Token || mongoose.model("Token", schema);
