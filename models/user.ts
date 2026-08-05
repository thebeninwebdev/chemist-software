import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin"], default: "admin", required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

const UserModel =
  (mongoose.models.User as Model<User>) || mongoose.model<User>("User", userSchema);

export default UserModel;
