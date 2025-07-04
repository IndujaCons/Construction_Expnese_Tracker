import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { getSession } from '../../../lib/nextauth'

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
    const projectId = parseInt(id)

    // Check if user is a member of this project
    const userMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      }
    })

    if (!userMembership) {
      return NextResponse.json(
        { message: 'Forbidden: You are not a member of this project' },
        { status: 403 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            members: true,
            expenses: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const projectId = parseInt(id)
    const { name, description, status } = await request.json()

    // Check if user is the owner or admin of this project
    const userMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      }
    })

    if (!userMembership || (userMembership.role !== 'OWNER' && userMembership.role !== 'ADMIN')) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to update this project' },
        { status: 403 }
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status })
      }
    })

    return NextResponse.json(
      { 
        message: 'Project updated successfully',
        project: updatedProject
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const projectId = parseInt(id)

    // Check if user is the owner of this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            expenses: true,
            members: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { message: 'Forbidden: Only the project owner can delete this project' },
        { status: 403 }
      )
    }

    // Delete all related data in order (expenses, members, then project)
    await prisma.expense.deleteMany({
      where: { projectId: projectId }
    })

    await prisma.projectMember.deleteMany({
      where: { projectId: projectId }
    })

    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json(
      { 
        message: 'Project deleted successfully',
        deletedProject: {
          id: project.id,
          name: project.name,
          expensesDeleted: project._count.expenses,
          membersRemoved: project._count.members
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}