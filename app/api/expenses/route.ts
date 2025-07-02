import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/db'
import { getSession } from '../../lib/nextauth'

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, description, categoryId, projectId, date } = await request.json()

    if (!amount || !description || !categoryId || !projectId || !date) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify user has access to this project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: parseInt(projectId)
        }
      }
    })

    if (!projectMember) {
      return NextResponse.json(
        { message: 'Forbidden: You are not a member of this project' },
        { status: 403 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        categoryId: parseInt(categoryId),
        projectId: parseInt(projectId),
        userId: user.id,
        date: new Date(date),
      },
      include: {
        category: { select: { name: true } },
        user: { select: { name: true } },
      },
    })

    return NextResponse.json(
      { 
        message: 'Expense added successfully',
        expense
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add expense error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    
    const skip = (page - 1) * limit

    const where = categoryId ? { categoryId: parseInt(categoryId) } : {}

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          category: { select: { name: true } },
          user: { select: { name: true, role: true } },
        },
      }),
      prisma.expense.count({ where }),
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}