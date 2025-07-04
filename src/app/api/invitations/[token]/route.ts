import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { getSession } from '../../../lib/nextauth'

// Get invitation details by token (for invitation page)
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const invitation = await prisma.projectInvitation.findUnique({
      where: {
        token: token
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ 
        message: 'Invalid or expired invitation' 
      }, { status: 404 })
    }

    // Check if invitation has expired
    if (invitation.expires < new Date()) {
      return NextResponse.json({ 
        message: 'This invitation has expired' 
      }, { status: 410 })
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json({ 
        message: 'This invitation has already been accepted' 
      }, { status: 410 })
    }

    return NextResponse.json({ 
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        project: invitation.project,
        inviter: invitation.inviter,
        expires: invitation.expires
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Get invitation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Accept invitation (user must be logged in)
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ 
        message: 'You must be logged in to accept an invitation' 
      }, { status: 401 })
    }

    const { token } = await params

    const invitation = await prisma.projectInvitation.findUnique({
      where: {
        token: token
      },
      include: {
        project: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ 
        message: 'Invalid or expired invitation' 
      }, { status: 404 })
    }

    // Check if invitation has expired
    if (invitation.expires < new Date()) {
      return NextResponse.json({ 
        message: 'This invitation has expired' 
      }, { status: 410 })
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json({ 
        message: 'This invitation has already been accepted' 
      }, { status: 410 })
    }

    // Check if the logged-in user's email matches the invitation
    if (user.email !== invitation.email) {
      return NextResponse.json({ 
        message: 'This invitation is for a different email address' 
      }, { status: 403 })
    }

    // Check if user is already a member of the project
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: invitation.projectId
        }
      }
    })

    if (existingMember) {
      // Mark invitation as accepted even though user is already a member
      await prisma.projectInvitation.update({
        where: {
          id: invitation.id
        },
        data: {
          acceptedAt: new Date()
        }
      })

      return NextResponse.json({ 
        message: 'You are already a member of this project',
        projectId: invitation.projectId
      }, { status: 200 })
    }

    // Use transaction to ensure both operations succeed
    const result = await prisma.$transaction(async (tx) => {
      // Add user to project
      const projectMember = await tx.projectMember.create({
        data: {
          userId: user.id,
          projectId: invitation.projectId,
          role: invitation.role
        }
      })

      // Mark invitation as accepted
      await tx.projectInvitation.update({
        where: {
          id: invitation.id
        },
        data: {
          acceptedAt: new Date()
        }
      })

      return projectMember
    })

    return NextResponse.json({ 
      message: 'Successfully joined the project!',
      projectId: invitation.projectId,
      projectName: invitation.project.name,
      role: invitation.role
    }, { status: 200 })

  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}