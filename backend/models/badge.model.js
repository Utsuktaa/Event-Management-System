const { Schema, model, models } = require("mongoose");

const BadgeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  conditionType: {
    type: String,
    enum: ["xp", "clubs_joined", "events_attended", "streak", "early_bird", "first_club"],
    required: true,
  },
  conditionValue: { type: Number, default: 1 },
});

const Badge = models.Badge || model("Badge", BadgeSchema);

module.exports = Badge;
