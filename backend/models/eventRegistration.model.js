const { Schema, model } = require("mongoose");

const EventRegistrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

EventRegistrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true }); 

module.exports = model("EventRegistration", EventRegistrationSchema);
