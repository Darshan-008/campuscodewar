import mongoose from "mongoose";

const { Schema } = mongoose;

const SolutionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problem: {
    type: Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ["cpp", "java", "python", "c"],
  },
  status: {
    type: String,
    enum: ["accepted", "wrong_answer", "runtime_error", "time_limit_exceeded"],
    required: true,
  },
  runtime: {
    type: Number,
    default: 0,
  },
  memory: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.model("Solution", SolutionSchema);
