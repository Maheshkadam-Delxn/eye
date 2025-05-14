import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// Get doctor's availability
export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const doctor = await User.findById(user.id).select('availability');
    
    return NextResponse.json(doctor.availability || []);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update doctor's availability
export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { availability } = await request.json();

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { message: 'Invalid availability format' },
        { status: 400 }
      );
    }

    // Validate availability format
    const isValidFormat = availability.every(day => {
      return (
        day.day &&
        Array.isArray(day.slots) &&
        day.slots.every(slot => slot.startTime && slot.endTime)
      );
    });

    if (!isValidFormat) {
      return NextResponse.json(
        { message: 'Invalid availability format' },
        { status: 400 }
      );
    }

    const doctor = await User.findById(user.id);
    doctor.availability = availability;
    await doctor.save();

    return NextResponse.json(doctor.availability);
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 