import mongoose from "mongoose";
const genderEnum = { male: "male", female: "female" };
const schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: [2, " min length is 2 chars"], maxLength: [20, "max length is 20 chars"] },
    lastName: { type: String, required: true, minLength: [2, " min length is 2 chars"], maxLength: [20, "max length is 20 chars"] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmEmail: { type: Date },
    phone: { type: String, required: true },
    gender: { type: String, enum: { values: Object.values(genderEnum) }, default: genderEnum.male },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
schema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const UserModel = mongoose.models.user || mongoose.model("user", schema);
UserModel.syncIndexes();
