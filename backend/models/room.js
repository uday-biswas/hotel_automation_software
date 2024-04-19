const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    roomType: { type: String, enum: ['single', 'double'], required: true },
    isAC: { type: Boolean, required: true },
    availabilityStatus: { type: Boolean, default: true },
    customerEmail: { type: String, default: null },
    pricePerDay: { type: Number, required: true },
    foodTotal: { type: Number, default: 0 },
});

module.exports = mongoose.model('Room', roomSchema);
