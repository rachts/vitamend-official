const mongoose = require('mongoose');

const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = mongoose.connection.db;
    const profile = await db.collection("profiles").findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      ...profile,
      id: profile._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    console.error("[MongoDB] Error fetching profile:", error);
    res.status(500).json({ message: error.message || "Failed to fetch profile" });
  }
};

const upsertProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const db = mongoose.connection.db;

    await db.collection("profiles").updateOne(
      { userId },
      {
        $set: {
          ...data,
          userId,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("[MongoDB] Error updating profile:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update profile" });
  }
};

module.exports = { getProfile, upsertProfile };
