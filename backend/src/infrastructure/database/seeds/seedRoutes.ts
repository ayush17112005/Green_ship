import { AppDataSource } from '../connection';
import { RouteModel } from '../../../adapters/outbound/postgres/models/RouteModel';

/**
 * Seed Routes
 * 
 * Adds sample routes to database for testing
 */

export async function seedRoutes() {
  console.log('🌱 Seeding routes...');

  const routeRepository = AppDataSource.getRepository(RouteModel);

  // Check if routes already exist
  const existingCount = await routeRepository.count();
  
  if (existingCount > 0) {
    console.log(`✅ Routes already seeded (${existingCount} routes exist)`);
    return;
  }

  // Create sample routes
  const routes = [
    {
      route_id: 'R001',
      vessel_type: 'Container',
      fuel_type: 'HFO',
      year: 2024,
      ghg_intensity: 91.0,
      fuel_consumption: 5000,
      distance: 12000,
      is_baseline: true, // This is the baseline
    },
    {
      route_id: 'R002',
      vessel_type: 'BulkCarrier',
      fuel_type: 'LNG',
      year: 2024,
      ghg_intensity: 88.0,
      fuel_consumption: 4800,
      distance: 11500,
      is_baseline: false,
    },
    {
      route_id: 'R003',
      vessel_type: 'Tanker',
      fuel_type: 'HFO',
      year: 2024,
      ghg_intensity: 93.5,
      fuel_consumption: 5200,
      distance: 13000,
      is_baseline: false,
    },
    {
      route_id: 'R004',
      vessel_type: 'Container',
      fuel_type: 'MGO',
      year: 2025,
      ghg_intensity: 87.5,
      fuel_consumption: 4700,
      distance: 11000,
      is_baseline: false,
    },
  ];

  // Save to database
  await routeRepository.save(routes);

  console.log(`✅ Seeded ${routes.length} routes successfully!`);
}