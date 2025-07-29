import mongoose from "mongoose";
export const genderEnum = { male: "male", female: "female" };
export const roleEnum = { user: "user", admin: "admin" };
export const providerEnum = { google: "google", system: "system" };
const schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: [2, " min length is 2 chars"], maxLength: [20, "max length is 20 chars"] },
    lastName: { type: String, required: true, minLength: [2, " min length is 2 chars"], maxLength: [20, "max length is 20 chars"] },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.provider !== providerEnum.google;
      },
    },
    confirmEmail: { type: Date },
    phone: {
      type: String,
      required: function () {
        return this.provider !== providerEnum.google;
      },
    },
    gender: { type: String, enum: { values: Object.values(genderEnum) }, default: genderEnum.male },
    role: { type: String, enum: { values: Object.values(roleEnum) }, default: roleEnum.user },
    provider: { type: String, enum: { values: Object.values(providerEnum), default: providerEnum.system }, defualt: providerEnum.system },
    picture: { type: String },
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
schema.virtual("userName").get(function () {
  return this.get("email").split("@")[0];
});

export const UserModel = mongoose.models.user || mongoose.model("user", schema);
UserModel.syncIndexes();
