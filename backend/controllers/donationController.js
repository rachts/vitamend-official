const Donation = require('../models/Donation');
const sendEmail = require('../utils/sendEmail');

const createDonation = async (req, res) => {
  try {
    const data = req.body;
    const donation = await Donation.create({
      ...data,
      user: req.user ? req.user._id : undefined,
    });

    const targetEmail = data.donorEmail || (req.user ? req.user.email : null);

    if (targetEmail) {
      const message = `
Hello ${data.donorName || (req.user ? req.user.name : "there")},

Thank you for submitting your medicine donation (${data.medicineName}) to Vitamend.

Your request has been successfully received and is currently under review by our team.

We will notify you once it gets approved.

Regards,
Vitamend Team
`;

      await sendEmail(
        targetEmail,
        "Donation Submitted Successfully",
        message
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Donation created successfully and confirmation email sent', 
      data: { id: donation._id.toString() } 
    });
  } catch (error) {
    console.error("Donation creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id });
    res.json({ success: true, message: 'Donations fetched', data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({}).populate('user', 'name email');
    res.json({ success: true, message: 'All donations fetched', data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (donation) {
      donation.status = req.body.status;
      const updated = await donation.save();
      res.json({ success: true, message: 'Donation status updated', data: updated });
    } else {
      res.status(404).json({ success: false, message: 'Donation not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDonation, getMyDonations, getAllDonations, updateDonationStatus };
