const Medicine = require('../models/Medicine');

const addMedicine = async (req, res) => {
  try {
    const { name, brand, quantity, expiryDate, batchNumber, condition, images } = req.body;
    
    const medicine = await Medicine.create({
      name, brand, quantity, expiryDate, batchNumber, condition, images,
      donor: req.user._id
    });
    
    res.status(201).json({ success: true, message: 'Medicine added successfully', data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ status: 'approved' }).populate('donor', 'name email');
    res.json({ success: true, message: 'Medicines fetched', data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMedicineStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    
    if (medicine) {
      medicine.status = status;
      const updatedMedicine = await medicine.save();
      res.json({ success: true, message: 'Status updated', data: updatedMedicine });
    } else {
      res.status(404).json({ success: false, message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (medicine) {
      res.json({ success: true, message: 'Medicine removed' });
    } else {
      res.status(404).json({ success: false, message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addMedicine, getMedicines, updateMedicineStatus, deleteMedicine };
