import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Appointment from '@/models/Appointment'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    await connectDB()

    // Get counts
    const [
      doctors,
      receptionists,
      appointments,
      todayAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'receptionist' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      }),
    ])

    return NextResponse.json({
      doctors,
      receptionists,
      appointments,
      todayAppointments,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 