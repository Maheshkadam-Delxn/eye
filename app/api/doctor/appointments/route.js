import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import { verifyAuth } from '@/lib/auth';

// Get doctor's appointments
export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = { doctor: user.id };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phoneNumber')
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

// Update appointment status and add medical records
export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, status, medicalRecord } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: user.id
    });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (status) appointment.status = status;
    if (medicalRecord) appointment.medicalRecord = {
      ...appointment.medicalRecord,
      ...medicalRecord
    };

    await appointment.save();

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 