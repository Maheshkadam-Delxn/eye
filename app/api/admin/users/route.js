import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// Get all users (with filters and pagination)
export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = { _id: { $ne: user.id } }; // Exclude current admin
    
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    if (role && ['doctor', 'receptionist'].includes(role)) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new user (doctor or receptionist)
export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate role
    if (!['doctor', 'receptionist'].includes(userData.role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be either doctor or receptionist' },
        { status: 400 }
      );
    }

    // Check for existing user with same email
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Additional validation for doctors
    if (userData.role === 'doctor' && !userData.specialization) {
      return NextResponse.json(
        { message: 'Specialization is required for doctors' },
        { status: 400 }
      );
    }

    const newUser = await User.create(userData);
    const { password, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent updating own account
    if (userId === user.id) {
      return NextResponse.json(
        { message: 'Cannot update own account through this endpoint' },
        { status: 400 }
      );
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing user role
    if (updateData.role && updateData.role !== userToUpdate.role) {
      return NextResponse.json(
        { message: 'Cannot change user role' },
        { status: 400 }
      );
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user
    Object.assign(userToUpdate, updateData);
    await userToUpdate.save();

    const { password, ...userWithoutPassword } = userToUpdate.toObject();
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deactivate/Activate user
export async function PATCH(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deactivating own account
    if (userId === user.id) {
      return NextResponse.json(
        { message: 'Cannot deactivate own account' },
        { status: 400 }
      );
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    userToUpdate.isActive = isActive;
    await userToUpdate.save();

    const { password, ...userWithoutPassword } = userToUpdate.toObject();
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 