const Request = require('../models/Request');

const createRequest = async (req, res) => {
  try {
    const { medicineName, quantityNeeded, urgency, reason, prescriptionImage } = req.body;
    const newRequest = await Request.create({
      requester: req.user._id, medicineName, quantityNeeded, urgency, reason, prescriptionImage
    });
    res.status(201).json({ success: true, message: 'Request created successfully', data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id });
    res.json({ success: true, message: 'Requests fetched', data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({}).populate('requester', 'name email');
    res.json({ success: true, message: 'All requests fetched', data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (request) {
      request.status = req.body.status;
      const updated = await request.save();
      res.json({ success: true, message: 'Request status updated', data: updated });
    } else {
      res.status(404).json({ success: false, message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequestStatus };
