const mongoose = require('mongoose');

const initDatabase = async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // Create collections
    const collections = ["donations", "medicines", "volunteers", "profiles"];
    for (const name of collections) {
      try {
        await db.createCollection(name);
      } catch (e) {
        // Collection already exists, ignore
        if (!e.message?.includes("already exists")) {
          console.warn(`[MongoDB] Warning creating ${name}:`, e.message);
        }
      }
    }

    // Create indexes
    await db.collection("donations").createIndex({ createdAt: -1 });
    await db.collection("donations").createIndex({ status: 1 });
    await db.collection("medicines").createIndex({ available: 1, createdAt: -1 });
    await db.collection("medicines").createIndex({ category: 1 });
    await db.collection("volunteers").createIndex({ status: 1, createdAt: -1 });
    await db.collection("profiles").createIndex({ userId: 1 }, { unique: true });
    await db.collection("profiles").createIndex({ email: 1 });

    // Seed sample medicines if collection is empty
    const medicineCount = await db.collection("medicines").countDocuments();
    if (medicineCount === 0) {
      const sampleMedicines = [
        {
          name: "Paracetamol 500mg",
          brand: "Crocin",
          genericName: "Acetaminophen",
          dosage: "500mg",
          category: "Pain Relief",
          description: "Fever and pain relief medication",
          quantity: 100,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          price: 0,
          available: true,
          imageUrl: "/paracetamol-medicine-box.jpg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // ... more samples could be added here if needed
      ];

      await db.collection("medicines").insertMany(sampleMedicines);
    }

    res.json({
      success: true,
      message: "MongoDB collections and indexes created successfully!",
      alreadyInitialized: medicineCount > 0,
    });
  } catch (error) {
    console.error("[DB Init] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize database",
    });
  }
};

module.exports = { initDatabase };
