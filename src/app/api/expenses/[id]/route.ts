import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { getSession } from '../../../lib/nextauth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const expenseId = parseInt(id)
    if (isNaN(expenseId)) {
      return NextResponse.json(
        { message: 'Invalid expense ID' },
        { status: 400 }
      )
    }

    // First, find the expense to check ownership
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        user: { select: { id: true, name: true } },
        category: { select: { name: true } },
      },
    })

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found' },
        { status: 404 }
      )
    }

    // Check if the current user is the one who created this expense
    if (expense.userId !== user.id) {
      return NextResponse.json(
        { message: 'Forbidden: You can only delete expenses you created' },
        { status: 403 }
      )
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: expenseId },
    })

    return NextResponse.json(
      { 
        message: 'Expense deleted successfully',
        deletedExpense: {
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category.name,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const expenseId = parseInt(id)
    if (isNaN(expenseId)) {
      return NextResponse.json(
        { message: 'Invalid expense ID' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        category: { select: { name: true } },
        user: { select: { name: true, role: true } },
      },
    })

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Get expense error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}