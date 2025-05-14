import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Patient from '@/models/Patient';
import { verifyAuth } from '@/lib/auth';

// Get all patients (with search and pagination)
export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || !['receptionist', 'doctor'].includes(user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const skip = (page - 1) * limit;
    
    const [patients, total] = await Promise.all([
      Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(query)
    ]);

    return NextResponse.json({
      patients,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new patient
export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'receptionist') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const patientData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'address'];
    const missingFields = requiredFields.filter(field => !patientData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for existing patient with same email
    const existingPatient = await Patient.findOne({ email: patientData.email });
    if (existingPatient) {
      return NextResponse.json(
        { message: 'Patient with this email already exists' },
        { status: 400 }
      );
    }

    const patient = await Patient.create(patientData);

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update patient
export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'receptionist') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { patientId, ...updateData } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { message: 'Patient ID is required' },
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

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== patient.email) {
      const existingPatient = await Patient.findOne({ email: updateData.email });
      if (existingPatient) {
        return NextResponse.json(
          { message: 'Patient with this email already exists' },
          { status: 400 }
        );
      }
    }

    Object.assign(patient, updateData);
    await patient.save();

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 