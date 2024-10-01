const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "ended"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Game", GameSchema);
