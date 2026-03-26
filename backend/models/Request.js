const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  quantityNeeded: { type: Number, required: true },
  prescriptionImage: { type: String }, // optional but good for verification
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'fulfilled'], default: 'pending' },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
