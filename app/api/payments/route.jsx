// app/api/payments/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Chapter from '@/models/Chapter'

export async function GET(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status')

    await connectToDatabase()

    let query = { userId: session.user.id }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('chapterId', 'title chapterNumber')

    const total = await Payment.countDocuments(query)

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: '$status',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    return NextResponse.json({
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      totals
    })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      amount, 
      currency = 'USD', 
      paymentMethod, 
      description, 
      chapterId, 
      type = 'chapter_payment',
      metadata = {}
    } = body

    // Validate required fields
    if (!amount || !paymentMethod || !description) {
      return NextResponse.json({ 
        message: 'Amount, payment method, and description are required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // If paying for a chapter, verify chapter exists and belongs to user
    if (chapterId) {
      const chapter = await Chapter.findOne({ 
        _id: chapterId, 
        userId: session.user.id 
      })

      if (!chapter) {
        return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
      }

      // Check if chapter is already paid
      if (chapter.isPaid) {
        return NextResponse.json({ 
          message: 'Chapter is already paid for' 
        }, { status: 400 })
      }
    }

    const payment = new Payment({
      userId: session.user.id,
      chapterId,
      amount,
      currency,
      paymentMethod,
      description,
      type,
      metadata,
      status: 'pending'
    })

    await payment.save()

    // Here you would integrate with actual payment processors like Stripe, PayPal, etc.
    // For demo purposes, we'll simulate payment processing

    return NextResponse.json({ 
      message: 'Payment initiated successfully',
      payment,
      // In real implementation, return payment URL or intent
      paymentUrl: `/dashboard/payment/${payment._id}`
    }, { status: 201 })
  } catch (error) {
    console.error('Create payment error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}