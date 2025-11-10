import { seedRoutes } from './seedRoutes';

/**
 * Run all seeds
 */

export async function runSeeds() {
  console.log('🌱 Starting database seeding...');
  
  await seedRoutes();
  
  console.log('✅ Database seeding complete!');
}