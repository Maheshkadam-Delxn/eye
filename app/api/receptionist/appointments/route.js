import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import Patient from '@/models/Patient';
import { verifyAuth } from '@/lib/auth';

// Get all appointments (with filters)
export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'receptionist') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const doctorId = searchParams.get('doctor');

    let query = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }
    
    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email')
      .sort({ appointmentDate: 1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new appointment
export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'receptionist') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      type = 'regular'
    } = await request.json();

    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if doctor exists and is available
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { message: 'Time slot is not available' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      type,
      status: 'confirmed',
      createdBy: user.id
    });

    await appointment.populate('patient', 'name email phoneNumber');
    await appointment.populate('doctor', 'name email');

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update appointment
export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'receptionist') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, status, timeSlot } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (status) appointment.status = status;
    if (timeSlot) {
      // Check if new slot is available
      const existingAppointment = await Appointment.findOne({
        doctor: appointment.doctor,
        appointmentDate: appointment.appointmentDate,
        'timeSlot.startTime': timeSlot.startTime,
        'timeSlot.endTime': timeSlot.endTime,
        _id: { $ne: appointmentId },
        status: { $nin: ['cancelled'] }
      });

      if (existingAppointment) {
        return NextResponse.json(
          { message: 'Time slot is not available' },
          { status: 400 }
        );
      }

      appointment.timeSlot = timeSlot;
    }

    await appointment.save();
    await appointment.populate('patient', 'name email phoneNumber');
    await appointment.populate('doctor', 'name email');

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 