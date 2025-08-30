// app/api/payments/process/route.js - Payment Processing Handler
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import Payment from '@/models/Payment'
import mongoose from 'mongoose'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { chapterId, amount, currency = 'KSH', description, paymentMethod = 'mpesa' } = body

    if (!chapterId || !amount) {
      return NextResponse.json({ 
        message: 'Chapter ID and amount are required' 
      }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json({ 
        message: 'Invalid chapter ID' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Verify chapter ownership and that it hasn't been paid
    const chapter = await Chapter.findOne({ 
      _id: chapterId, 
      userId: session.user.id 
    })

    if (!chapter) {
      return NextResponse.json({ 
        message: 'Chapter not found' 
      }, { status: 404 })
    }

    if (chapter.isPaid) {
      return NextResponse.json({ 
        message: 'Chapter has already been paid for' 
      }, { status: 400 })
    }

    // Create payment record
    const payment = new Payment({
      userId: session.user.id,
      chapterId,
      amount,
      currency,
      description: description || `Payment for Chapter ${chapter.chapterNumber}: ${chapter.title}`,
      paymentMethod,
      type: 'chapter_payment',
      status: 'processing'
    })

    await payment.save()

    // Simulate payment processing
    // In a real application, you would integrate with payment gateways like:
    // - M-Pesa STK Push for Kenyan payments
    // - Stripe for international cards
    // - PayPal
    
    try {
      // Mock payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate payment success (90% success rate for demo)
      const paymentSuccessful = Math.random() > 0.1
      
      if (paymentSuccessful) {
        // Mark payment as completed
        payment.status = 'completed'
        payment.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        await payment.save()

        // Update chapter
        chapter.isPaid = true
        chapter.paymentId = payment._id
        chapter.status = 'in_progress' // Move from draft to in_progress
        await chapter.save()

        console.log('Payment processed successfully:', payment.transactionId)

        return NextResponse.json({
          success: true,
          message: 'Payment processed successfully',
          payment: {
            id: payment._id,
            transactionId: payment.transactionId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status
          }
        })
      } else {
        // Payment failed
        payment.status = 'failed'
        payment.failureReason = 'Insufficient funds or payment declined'
        await payment.save()

        return NextResponse.json({ 
          message: 'Payment failed. Please try again or use a different payment method.' 
        }, { status: 400 })
      }

    } catch (paymentError) {
      console.error('Payment processing error:', paymentError)
      
      // Mark payment as failed
      payment.status = 'failed'
      payment.failureReason = paymentError.message
      await payment.save()

      return NextResponse.json({ 
        message: 'Payment processing failed. Please try again.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json({ 
      message: 'Internal server error: ' + error.message 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve payment history
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    await connectToDatabase()

    const payments = await Payment.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate('chapterId', 'title chapterNumber')
      .limit(50) // Limit to recent 50 payments

    return NextResponse.json({
      payments: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
        chapter: payment.chapterId ? {
          id: payment.chapterId._id,
          title: payment.chapterId.title,
          chapterNumber: payment.chapterId.chapterNumber
        } : null
      }))
    })

  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json({ 
      message: 'Failed to fetch payment history' 
    }, { status: 500 })
  }
}