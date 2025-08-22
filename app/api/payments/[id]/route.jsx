// app/api/payments/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Chapter from '@/models/Chapter'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid payment ID' }, { status: 400 })
    }

    await connectToDatabase()

    const payment = await Payment.findOne({ 
      _id: id, 
      userId: session.user.id 
    }).populate('chapterId', 'title chapterNumber wordCount status')

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid payment ID' }, { status: 400 })
    }

    await connectToDatabase()

    const payment = await Payment.findOne({ 
      _id: id, 
      userId: session.user.id 
    })

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    // Update allowed fields
    const allowedUpdates = [
      'status', 'transactionId', 'failureReason', 'refundAmount', 'refundReason'
    ]

    const updates = {}
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    // Handle payment completion
    if (updates.status === 'completed' && payment.status !== 'completed') {
      // Generate transaction ID if not provided
      if (!updates.transactionId) {
        updates.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Mark associated chapter as paid
      if (payment.chapterId) {
        await Chapter.findByIdAndUpdate(
          payment.chapterId,
          { 
            isPaid: true,
            paymentId: payment._id
          }
        )
      }
    }

    // Handle payment failure
    if (updates.status === 'failed' && payment.status !== 'failed') {
      // Ensure chapter is not marked as paid
      if (payment.chapterId) {
        await Chapter.findByIdAndUpdate(
          payment.chapterId,
          { 
            isPaid: false,
            $unset: { paymentId: 1 }
          }
        )
      }
    }

    Object.assign(payment, updates)
    await payment.save()

    // Populate chapter info for response
    await payment.populate('chapterId', 'title chapterNumber wordCount status')

    return NextResponse.json({ 
      message: 'Payment updated successfully',
      payment 
    })
  } catch (error) {
    console.error('Update payment error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid payment ID' }, { status: 400 })
    }

    await connectToDatabase()

    const payment = await Payment.findOne({ 
      _id: id, 
      userId: session.user.id 
    })

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    // Can only delete pending or failed payments
    if (!['pending', 'failed'].includes(payment.status)) {
      return NextResponse.json({ 
        message: 'Cannot delete completed or processing payments' 
      }, { status: 400 })
    }

    // Remove payment reference from chapter if exists
    if (payment.chapterId) {
      await Chapter.findByIdAndUpdate(
        payment.chapterId,
        { 
          isPaid: false,
          $unset: { paymentId: 1 }
        }
      )
    }

    await Payment.findByIdAndDelete(id)

    return NextResponse.json({ 
      message: 'Payment deleted successfully' 
    })
  } catch (error) {
    console.error('Delete payment error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}