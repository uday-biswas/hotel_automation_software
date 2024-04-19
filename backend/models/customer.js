const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    roomNumber: { type: String },
    checkinDate: { type: Date },
    expectedCheckoutDate: { type: Date },
});

module.exports = mongoose.model('Customer', customerSchema);
