// Import TypeORM Repository
import { Repository } from 'typeorm';

// Import database connection
import { AppDataSource } from '../../../../infrastructure/database/connection';

// Import database model
import { RouteModel } from '../models/RouteModel';

// Import domain entity
import { Route, VesselType, FuelType } from '../../../../core/domain/entities/Route.entity';

// Import interface we're implementing
import { IRouteRepository } from '../../../../core/ports/outbound/IRouteRepository';

/**
 * Route Repository Implementation
 * 
 * This is the ADAPTER that connects our domain logic to PostgreSQL.
 * It implements the IRouteRepository interface.
 */

export class RouteRepository implements IRouteRepository {
  
  // TypeORM repository for database operations
  private repository: Repository<RouteModel>;

  /**
   * Constructor
   * 
   * Gets the TypeORM repository for RouteModel
   * This gives us methods like find(), save(), delete(), etc.
   */
  constructor() {
    this.repository = AppDataSource.getRepository(RouteModel);
  }

  /**
   * Get all routes from database
   */
  async findAll(): Promise<Route[]> {
    // Find all routes in database
    const routeModels = await this.repository.find();
    
    // Convert database models to domain entities
    return routeModels.map(model => this.toDomain(model));
  }

  /**
   * Find route by UUID
   */
  async findById(id: string): Promise<Route | null> {
    // Find one route by ID
    const routeModel = await this.repository.findOne({
      where: { id: id }
    });

    // If not found, return null
    if (!routeModel) {
      return null;
    }

    // Convert to domain entity
    return this.toDomain(routeModel);
  }

  /**
   * Find route by route_id (like R001)
   */
  async findByRouteId(routeId: string): Promise<Route | null> {
    const routeModel = await this.repository.findOne({
      where: { route_id: routeId }
    });

    if (!routeModel) {
      return null;
    }

    return this.toDomain(routeModel);
  }

  /**
   * Find the baseline route
   */
  async findBaseline(): Promise<Route | null> {
    const routeModel = await this.repository.findOne({
      where: { is_baseline: true }
    });

    if (!routeModel) {
      return null;
    }

    return this.toDomain(routeModel);
  }

  /**
   * Save a new route
   */
  async save(route: Route): Promise<Route> {
    // Convert domain entity to database model
    const routeModel = this.toModel(route);

    // Save to database
    const savedModel = await this.repository.save(routeModel);

    // Convert back to domain entity
    return this.toDomain(savedModel);
  }

  /**
   * Update existing route
   */
  async update(route: Route): Promise<Route> {
    // Get the ID from route
    const id = route.getId();

    if (!id) {
      throw new Error('Cannot update route without ID');
    }

    // Convert to model
    const routeModel = this.toModel(route);
    routeModel.id = id; // Make sure ID is set

    // Update in database
    const updatedModel = await this.repository.save(routeModel);

    // Convert back to domain
    return this.toDomain(updatedModel);
  }

  /**
   * Delete a route
   */
  async delete(id: string): Promise<boolean> {
    // Try to delete
    const result = await this.repository.delete(id);

    // Check if anything was deleted
    return (result.affected !== null && result.affected !== undefined && result.affected > 0);
  }

  /**
   * Set a route as baseline
   * (Also removes baseline from other routes)
   */
  async setBaseline(routeId: string): Promise<Route> {
    // Step 1: Remove baseline from all routes
    await this.repository.update(
      { is_baseline: true },  // Find routes where is_baseline = true
      { is_baseline: false }  // Set them to false
    );

    // Step 2: Set the new baseline
    await this.repository.update(
      { route_id: routeId },    // Find route with this route_id
      { is_baseline: true }     // Set as baseline
    );

    // Step 3: Get and return the updated route
    const updatedRoute = await this.findByRouteId(routeId);

    if (!updatedRoute) {
      throw new Error(`Route ${routeId} not found`);
    }

    return updatedRoute;
  }

  /**
   * HELPER: Convert database model to domain entity
   * 
   * Database uses snake_case (route_id)
   * Domain uses camelCase (routeId)
   */
  private toDomain(model: RouteModel): Route {
    return new Route({
      id: model.id,
      routeId: model.route_id,
      vesselType: model.vessel_type as VesselType,
      fuelType: model.fuel_type as FuelType,
      year: model.year,
      ghgIntensity: Number(model.ghg_intensity),  // Convert from decimal
      fuelConsumption: Number(model.fuel_consumption),
      distance: Number(model.distance),
      isBaseline: model.is_baseline,
    });
  }

  /**
   * HELPER: Convert domain entity to database model
   */
  private toModel(route: Route): RouteModel {
    const model = new RouteModel();
    
    // Set all properties
    model.route_id = route.getRouteId();
    model.vessel_type = route.getVesselType();
    model.fuel_type = route.getFuelType();
    model.year = route.getYear();
    model.ghg_intensity = route.getGHGIntensity();
    model.fuel_consumption = route.getFuelConsumption();
    model.distance = route.getDistance();
    model.is_baseline = route.getIsBaseline();

    return model;
  }
}