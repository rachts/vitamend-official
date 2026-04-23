const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  occupation: { type: String, required: true },
  experience: { type: String, enum: ["none", "some", "extensive"], required: true },
  availability: { type: String, required: true },
  role: { type: String, enum: ["delivery", "sorting", "verification", "coordination", "fundraising"], required: true },
  motivation: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  emergencyPhone: { type: String, required: true },
  hasTransport: { type: Boolean, default: false },
  canLift: { type: Boolean, default: false },
  medicalConditions: { type: String },
  references: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'inactive'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);
