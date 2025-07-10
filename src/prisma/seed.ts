import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@construction.local' },
    update: {},
    create: {
      email: 'owner@construction.local',
      name: 'House Owner',
      password: hashedPassword,
      role: 'OWNER',
    },
  })

  const wife = await prisma.user.upsert({
    where: { email: 'wife@construction.local' },
    update: {},
    create: {
      email: 'wife@construction.local',
      name: 'Owner Wife',
      password: hashedPassword,
      role: 'WIFE',
    },
  })

  const architect = await prisma.user.upsert({
    where: { email: 'architect@construction.local' },
    update: {},
    create: {
      email: 'architect@construction.local',
      name: 'Project Architect',
      password: hashedPassword,
      role: 'ARCHITECT',
    },
  })

  // Create construction expense categories
  const categories = [
    { name: 'Architect Fees', description: 'Design, supervision, and approval fees' },
    { name: 'Cement', description: 'Cement bags and bulk cement' },
    { name: 'Steel/TMT Bars', description: 'Steel reinforcement bars and materials' },
    { name: 'Bricks', description: 'Bricks and blocks for construction' },
    { name: 'Sand', description: 'Construction sand (river sand, M-sand)' },
    { name: 'Gravel/Aggregate', description: 'Stone chips and aggregate materials' },
    { name: 'Wood/Timber', description: 'Wooden materials and timber' },
    { name: 'Plumbing Materials', description: 'Pipes, fittings, and plumbing supplies' },
    { name: 'Electrical Materials', description: 'Wires, switches, and electrical components' },
    { name: 'Paint', description: 'Paints, primers, and finishing materials' },
    { name: 'Mason Labor', description: 'Mason and masonry work charges' },
    { name: 'Helper Labor', description: 'Helper and general labor charges' },
    { name: 'Electrician Fees', description: 'Electrical work and installation charges' },
    { name: 'Plumber Fees', description: 'Plumbing work and installation charges' },
    { name: 'Painter Fees', description: 'Painting and finishing work charges' },
    { name: 'Equipment Rental', description: 'Tool rentals and machinery costs' },
    { name: 'Permits/Legal', description: 'Municipal approvals and NOCs' },
    { name: 'Utilities', description: 'Construction electricity and water charges' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log(`Database has been seeded. 🌱`)
  console.log(`Created users: ${owner.name}, ${wife.name}, ${architect.name}`)
  console.log(`Created ${categories.length} expense categories`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })