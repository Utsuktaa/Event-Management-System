const { Schema, model } = require("mongoose");

const AttendanceSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

AttendanceSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = model("Attendance", AttendanceSchema);
