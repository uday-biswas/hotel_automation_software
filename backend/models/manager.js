const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['manager', 'caterer', 'receptionist'], required: true },
});

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;
