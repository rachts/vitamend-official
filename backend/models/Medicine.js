const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  batchNumber: { type: String },
  condition: { type: String, enum: ['sealed', 'opened', 'used'], default: 'sealed' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'distributed'], default: 'pending' },
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);
