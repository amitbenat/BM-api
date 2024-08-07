const mongoose = require('mongoose');

const statusStates = ['pending', 'closed'];
const typeStates = [
  'בקשת השחרה',
  'בקשת אישור כניסה רגלי',
  'בקשת אישור כניסה רכוב',
  'בקשת קידוד חוגר',
  'בקשת טופס חתימה על שו"ס',
];
const requestSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      // required: true
    },
    status: {
      type: String,
      enum: statusStates,
      // required: true
    },
    isValid: {
      type: Boolean,
      // required: true,
      default: false,
    },
    type: {
      type: String,
      enum: typeStates,
      // required: true
    },
    reasonIfNeeded: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
