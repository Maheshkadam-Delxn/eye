import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: String,
    endTime: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['regular', 'follow-up', 'emergency'],
    default: 'regular'
  },
  medicalRecord: {
    symptoms: [String],
    diagnosis: String,
    prescription: [String],
    notes: String,
    attachments: [{
      name: String,
      url: String,
      type: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Index for efficient querying
appointmentSchema.index({ appointmentDate: 1, doctor: 1 })
appointmentSchema.index({ patient: 1, appointmentDate: -1 })

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)

export default Appointment 