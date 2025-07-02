import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToProjects() {
  console.log('Starting migration to project-based structure...')

  try {
    // Find the first user with OWNER role to be the default project owner
    const ownerUser = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    })

    if (!ownerUser) {
      console.log('No owner user found. Creating default user...')
      throw new Error('Please ensure at least one user with OWNER role exists')
    }

    // Create default project for existing expenses
    const defaultProject = await prisma.project.create({
      data: {
        name: "Indu's Residency",
        description: "Default project for existing construction expenses",
        status: 'ACTIVE',
        ownerId: ownerUser.id
      }
    })

    console.log(`Created default project: ${defaultProject.name}`)

    // Add all existing users as members of the default project
    const allUsers = await prisma.user.findMany()
    
    for (const user of allUsers) {
      // Convert old UserRole to ProjectRole
      let projectRole: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'
      if (user.role === 'OWNER') {
        projectRole = 'OWNER'
      } else if (user.role === 'ARCHITECT') {
        projectRole = 'ADMIN'
      }

      await prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: defaultProject.id,
          role: projectRole
        }
      })

      console.log(`Added ${user.email} as ${projectRole} to project`)
    }

    // Update all existing expenses to belong to the default project
    const expensesUpdated = await prisma.expense.updateMany({
      where: { projectId: null },
      data: { projectId: defaultProject.id }
    })

    console.log(`Updated ${expensesUpdated.count} expenses to belong to default project`)

    console.log('Migration completed successfully!')

    // Show project summary
    const projectSummary = await prisma.project.findUnique({
      where: { id: defaultProject.id },
      include: {
        members: {
          include: {
            user: { select: { email: true, name: true } }
          }
        },
        expenses: true,
        _count: {
          select: {
            members: true,
            expenses: true
          }
        }
      }
    })

    console.log('\nProject Summary:')
    console.log(`Project: ${projectSummary?.name}`)
    console.log(`Members: ${projectSummary?._count.members}`)
    console.log(`Expenses: ${projectSummary?._count.expenses}`)
    console.log('\nMembers:')
    projectSummary?.members.forEach(member => {
      console.log(`- ${member.user.email} (${member.user.name}) - ${member.role}`)
    })

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateToProjects()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })