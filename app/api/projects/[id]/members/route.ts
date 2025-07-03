import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { getSession } from '../../../../lib/nextauth'

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

    // Get all project members
    const members = await prisma.projectMember.findMany({
      where: {
        projectId: projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, etc.
        { joinedAt: 'asc' }
      ]
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Get project members error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { email, role = 'MEMBER' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if current user has permission to invite (OWNER or ADMIN)
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
        { message: 'Forbidden: You do not have permission to invite members' },
        { status: 403 }
      )
    }

    // Find the user to invite
    const inviteUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!inviteUser) {
      return NextResponse.json(
        { message: 'User not found. They need to sign up first.' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: inviteUser.id,
          projectId: projectId
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { message: 'User is already a member of this project' },
        { status: 400 }
      )
    }

    // Add user as project member
    const newMember = await prisma.projectMember.create({
      data: {
        userId: inviteUser.id,
        projectId: projectId,
        role: role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Member added successfully',
        member: newMember
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add project member error:', error)
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
    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json(
        { message: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Check if current user has permission to remove members (OWNER or ADMIN)
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
        { message: 'Forbidden: You do not have permission to remove members' },
        { status: 403 }
      )
    }

    // Get the member to be removed
    const memberToRemove = await prisma.projectMember.findUnique({
      where: {
        id: memberId,
        projectId: projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!memberToRemove) {
      return NextResponse.json(
        { message: 'Member not found in this project' },
        { status: 404 }
      )
    }

    // Prevent removing the project owner
    if (memberToRemove.role === 'OWNER') {
      return NextResponse.json(
        { message: 'Cannot remove the project owner' },
        { status: 400 }
      )
    }

    // Prevent non-owners from removing admins (only owners can remove admins)
    if (memberToRemove.role === 'ADMIN' && userMembership.role !== 'OWNER') {
      return NextResponse.json(
        { message: 'Only project owners can remove admins' },
        { status: 403 }
      )
    }

    // Prevent users from removing themselves (they should leave the project instead)
    if (memberToRemove.userId === user.id) {
      return NextResponse.json(
        { message: 'You cannot remove yourself. Use the leave project option instead.' },
        { status: 400 }
      )
    }

    // Remove the member
    await prisma.projectMember.delete({
      where: {
        id: memberId
      }
    })

    return NextResponse.json(
      { 
        message: `${memberToRemove.user.name || memberToRemove.user.email} has been removed from the project`,
        removedMember: {
          id: memberToRemove.id,
          userId: memberToRemove.userId,
          name: memberToRemove.user.name,
          email: memberToRemove.user.email,
          role: memberToRemove.role
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Remove project member error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}