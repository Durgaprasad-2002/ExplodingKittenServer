// routes/game.js
const express = require("express");
const Game = require("../models/Game");
const User = require("../models/User");

const { authMiddleware } = require("./auth");

const router = express.Router();

router.post("/start", async (req, res) => {
  const { userId } = req.body;

  try {
    const ongoingGame = await Game.findOne({
      player: userId,
      status: { $ne: "ended" },
    });

    if (ongoingGame) {
      return res
        .status(200)
        .json({ message: "Ongoing game found", gameId: ongoingGame._id });
    }

    const game = new Game({ player: userId });
    await game.save();

    res.status(201).json({ message: "New game started", gameId: game._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/updatescore/end", async (req, res) => {
  const { gameId, action, userId } = req.body;

  console.log(req.body);

  try {
    const game = await Game.findOne({
      _id: gameId,
      player: userId,
      status: "active",
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    game.score += action === "win" ? 10 : 0;
    game.status = "ended";
    await game.save();

    const user = await User.findById(userId);
    if (user) {
      user.gameHistory.push(game._id);
      await user.save();
    }

    res
      .status(200)
      .json({ message: "Game ended and history updated", score: game.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: "games",
          localField: "gameHistory",
          foreignField: "_id",
          as: "games",
        },
      },
      {
        $addFields: {
          totalScore: { $sum: "$games.score" },
          lastPlayed: { $max: "$games.playedAt" },
        },
      },
      {
        $sort: { totalScore: -1 },
      },
      {
        $project: {
          username: 1,
          totalScore: 1,
          lastPlayed: 1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
