const Volunteer = require('../models/Volunteer');

const registerVolunteer = async (req, res) => {
  try {
    const { 
      fullName, email, phone, address, dateOfBirth, 
      occupation, experience, availability, role, 
      motivation, emergencyContact, emergencyPhone, 
      hasTransport, canLift, medicalConditions, references 
    } = req.body;
    
    const userQuery = req.user ? { user: req.user._id } : { email: email };
    let volunteer = await Volunteer.findOne(userQuery);
    if (volunteer) {
      return res.status(400).json({ success: false, message: 'Volunteer already registered with this ' + (req.user ? 'account' : 'email') });
    }
    
    volunteer = await Volunteer.create({
      user: req.user ? req.user._id : undefined,
      fullName, email, phone, address, dateOfBirth, 
      occupation, experience, availability, role, 
      motivation, emergencyContact, emergencyPhone, 
      hasTransport, canLift, medicalConditions, references
    });
    
    res.status(201).json({ success: true, message: 'Volunteer application submitted successfully!', data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({}).populate('user', 'name email phone');
    res.json({ success: true, message: 'Volunteers fetched', data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVolunteerStatus = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (volunteer) {
      volunteer.status = req.body.status;
      const updated = await volunteer.save();
      res.json({ success: true, message: 'Volunteer status updated', data: updated });
    } else {
      res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerVolunteer, getVolunteers, updateVolunteerStatus };
