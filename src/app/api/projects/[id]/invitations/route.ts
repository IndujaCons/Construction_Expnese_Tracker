import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { getSession } from '../../../../lib/nextauth'
import crypto from 'crypto'

// Send invitation to any email (user doesn't need to exist)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectIdStr } = await params
    const projectId = parseInt(projectIdStr)
    const { email, role = 'MEMBER' } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    // Check if user has permission to invite (OWNER or ADMIN)
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      },
      include: {
        project: true
      }
    })

    if (!projectMember || !['OWNER', 'ADMIN'].includes(projectMember.role)) {
      return NextResponse.json({ 
        message: 'Forbidden: Only project owners and admins can send invitations' 
      }, { status: 403 })
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        user: {
          email: email
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ 
        message: 'User is already a member of this project' 
      }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.projectInvitation.findUnique({
      where: {
        email_projectId: {
          email: email,
          projectId: projectId
        }
      }
    })

    if (existingInvitation) {
      // Update existing invitation with new token and expiry
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const updatedInvitation = await prisma.projectInvitation.update({
        where: {
          id: existingInvitation.id
        },
        data: {
          token,
          expires,
          role,
          invitedBy: user.id,
          acceptedAt: null // Reset acceptance
        },
        include: {
          project: true,
          inviter: true
        }
      })

      return NextResponse.json({ 
        message: 'Invitation updated and resent',
        invitation: {
          id: updatedInvitation.id,
          email: updatedInvitation.email,
          role: updatedInvitation.role,
          inviteLink: `${process.env.NEXTAUTH_URL}/invite/${updatedInvitation.token}`,
          projectName: updatedInvitation.project.name,
          inviterName: updatedInvitation.inviter.name
        }
      }, { status: 200 })
    }

    // Create new invitation
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invitation = await prisma.projectInvitation.create({
      data: {
        email,
        projectId,
        role,
        token,
        expires,
        invitedBy: user.id
      },
      include: {
        project: true,
        inviter: true
      }
    })

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        inviteLink: `${process.env.NEXTAUTH_URL}/invite/${invitation.token}`,
        projectName: invitation.project.name,
        inviterName: invitation.inviter.name
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Invitation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Get all invitations for a project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectIdStr } = await params
    const projectId = parseInt(projectIdStr)

    // Check if user has permission to view invitations
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      }
    })

    if (!projectMember || !['OWNER', 'ADMIN'].includes(projectMember.role)) {
      return NextResponse.json({ 
        message: 'Forbidden: Only project owners and admins can view invitations' 
      }, { status: 403 })
    }

    const invitations = await prisma.projectInvitation.findMany({
      where: {
        projectId: projectId,
        acceptedAt: null // Only pending invitations
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ invitations }, { status: 200 })

  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// Cancel invitation
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectIdStr } = await params
    const projectId = parseInt(projectIdStr)
    const { invitationId } = await request.json()

    // Check if user has permission to cancel invitations
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      }
    })

    if (!projectMember || !['OWNER', 'ADMIN'].includes(projectMember.role)) {
      return NextResponse.json({ 
        message: 'Forbidden: Only project owners and admins can cancel invitations' 
      }, { status: 403 })
    }

    // Delete the invitation
    await prisma.projectInvitation.delete({
      where: {
        id: invitationId,
        projectId: projectId
      }
    })

    return NextResponse.json({ message: 'Invitation cancelled' }, { status: 200 })

  } catch (error) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}