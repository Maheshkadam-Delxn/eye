import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    pastSurgeries: [String]
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

export default Patient; 