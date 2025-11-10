// Import the Route domain entity
import { Route } from "../../domain/entities/Route.entity";

/**
 * Route Repository Interface (Port)
 * 
 * This is a CONTRACT that says:
 * "Any class that implements this MUST have these methods"
 * 
 * Why use an interface?
 * - Core layer doesn't depend on database implementation
 * - Easy to swap databases (PostgreSQL → MongoDB)
 * - Easy to create fake repository for testing
 * 
 * This follows DEPENDENCY INVERSION principle:
 * - High-level code (use cases) depend on abstractions (this interface)
 * - Low-level code (repository implementation) also depends on this interface
 */

export interface IRouteRepository {
  
  /**
   * Get all routes from database
   * 
   * @returns Promise with array of Route entities
   */
  findAll(): Promise<Route[]>;

  /**
   * Find a single route by its ID
   * 
   * @param id - The route's unique identifier
   * @returns Promise with Route or null if not found
   */
  findById(id: string): Promise<Route | null>;

  /**
   * Find a route by its route_id (like R001)
   * 
   * @param routeId - The route identifier (R001, R002, etc.)
   * @returns Promise with Route or null
   */
  findByRouteId(routeId: string): Promise<Route | null>;

  /**
   * Find the baseline route (only one can exist)
   * 
   * @returns Promise with baseline Route or null if none set
   */
  findBaseline(): Promise<Route | null>;

  /**
   * Save a new route to database
   * 
   * @param route - Route entity to save
   * @returns Promise with saved Route (includes generated ID)
   */
  save(route: Route): Promise<Route>;

  /**
   * Update an existing route
   * 
   * @param route - Route entity with changes
   * @returns Promise with updated Route
   */
  update(route: Route): Promise<Route>;

  /**
   * Delete a route by ID
   * 
   * @param id - The route's unique identifier
   * @returns Promise with true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Set a route as the baseline
   * (Also removes baseline status from other routes)
   * 
   * @param routeId - The route_id to set as baseline
   * @returns Promise with updated Route
   */
  setBaseline(routeId: string): Promise<Route>;
}