const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donationId: { type: String, unique: true, default: () => `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  medicineName: { type: String, required: true },
  brand: { type: String, required: true },
  genericName: { type: String },
  dosage: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPhone: { type: String, required: true },
  donorAddress: { type: String, required: true },
  notes: { type: String },
  imageUrls: [{ type: String }],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "picked"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
