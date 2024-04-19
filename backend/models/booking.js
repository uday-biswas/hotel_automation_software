const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    customerEmail: { type: String, required: true },
    roomNumber: { type: Number, required: true },
    checkinDate: { type: Date, required: true },
    expectedCheckoutDate: { type: Date, required: true },
    exactCheckoutDate: { type: Date, default: null },
    advancePaid: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    isCheckout: { type: Boolean, default: false },
});

module.exports = mongoose.model('Booking', bookingSchema);
