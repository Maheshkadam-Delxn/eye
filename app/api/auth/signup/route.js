import { NextResponse } from 'next/server'
import connectDB from '../../../../lib/db.js'
import User from '../../../../models/User.js'
import { createToken, setTokenCookie } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()
    
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if any user exists
    const userCount = await User.countDocuments()
    
    // If users exist, only admin can create new users
    if (userCount > 0) {
      return NextResponse.json(
        { message: 'Registration is closed. Please contact admin for new accounts.' },
        { status: 403 }
      )
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Create first user as admin
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin', // First user is always admin
    })

    const token = createToken(user)
    setTokenCookie(token)

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 