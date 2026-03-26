const express = require('express');
const router = express.Router();
const { addMedicine, getMedicines, updateMedicineStatus, deleteMedicine } = require('../controllers/medicineController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getMedicines).post(protect, addMedicine);
router.route('/:id').put(protect, admin, updateMedicineStatus).delete(protect, admin, deleteMedicine);

module.exports = router;
