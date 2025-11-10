/**
 * Pool Entity
 * 
 * Represents a pooling agreement between multiple ships.
 * 
 * Business Rules:
 * - A pool must have at least 2 members
 * - Pool aggregates compliance balances from all members
 * - Pool is compliant if total CB >= 0
 * - Each member's contribution is tracked
 * - Pool has a validity period (year range)
 */

/**
 * Pool Member Information
 */
export interface PoolMember {
  shipId: string;
  complianceBalance: number;  // Individual CB in gCO₂e
  contribution: number;        // Positive = surplus, Negative = deficit
  contributionTonnes: number;
}

/**
 * Pool Properties
 */
export interface IPoolProps {
  id?: string;                      // UUID
  poolName: string;                 // Name of the pool
  year: number;                     // Year of pooling agreement
  members: PoolMember[];            // All ships in the pool
  totalCB: number;                  // Aggregated CB (sum of all members)
  isCompliant: boolean;             // Pool compliance status
  createdBy?: string;               // Who created the pool
  createdAt?: Date;
  description?: string;
}

/**
 * Pool Entity
 */
export class Pool {
  
  // Private properties
  private readonly id?: string;
  private readonly poolName: string;
  private readonly year: number;
  private members: PoolMember[];
  private totalCB: number;
  private isCompliant: boolean;
  private readonly createdBy?: string;
  private readonly createdAt: Date;
  private readonly description?: string;

  /**
   * Constructor
   */
  constructor(props: IPoolProps) {
    // Validate
    this.validate(props);
    
    // Set properties
    this.id = props.id;
    this.poolName = props.poolName;
    this.year = props.year;
    this.members = props.members;
    this.totalCB = props.totalCB;
    this.isCompliant = props.isCompliant;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt || new Date();
    this.description = props.description;
  }

  /**
   * Validation
   */
  private validate(props: IPoolProps): void {
    if (!props.poolName || props.poolName.trim() === '') {
      throw new Error('Pool name is required');
    }

    if (props.year < 2025 || props.year > 2030) {
      throw new Error('Year must be between 2025 and 2030');
    }

    if (!props.members || props.members.length < 2) {
      throw new Error('Pool must have at least 2 members');
    }

    // Check for duplicate members
    const shipIds = props.members.map(m => m.shipId);
    const uniqueShipIds = new Set(shipIds);
    
    if (shipIds.length !== uniqueShipIds.size) {
      throw new Error('Pool cannot have duplicate members');
    }
  }

  /**
   * STATIC FACTORY: Create Pool
   * 
   * Automatically calculates total CB and compliance status
   * 
   * @param poolName - Name of the pool
   * @param year - Year
   * @param members - Array of PoolMember
   * @param createdBy - Creator
   * @param description - Optional description
   */
  static createPool(
    poolName: string,
    year: number,
    members: PoolMember[],
    createdBy?: string,
    description?: string
  ): Pool {
    
    // Calculate total CB (sum of all member contributions)
    const totalCB = members.reduce((sum, member) => sum + member.complianceBalance, 0);
    
    // Pool is compliant if total CB >= 0
    const isCompliant = totalCB >= 0;

    return new Pool({
      poolName,
      year,
      members,
      totalCB,
      isCompliant,
      createdBy,
      description,
    });
  }

  /**
   * BUSINESS LOGIC: Add Member to Pool
   * 
   * @param member - New pool member
   */
  addMember(member: PoolMember): void {
    // Check if already in pool
    const exists = this.members.some(m => m.shipId === member.shipId);
    
    if (exists) {
      throw new Error(`Ship ${member.shipId} is already in the pool`);
    }

    // Add member
    this.members.push(member);

    // Recalculate total CB
    this.recalculateTotalCB();
  }

  /**
   * BUSINESS LOGIC: Remove Member from Pool
   * 
   * @param shipId - Ship to remove
   */
  removeMember(shipId: string): void {
    const index = this.members.findIndex(m => m.shipId === shipId);
    
    if (index === -1) {
      throw new Error(`Ship ${shipId} is not in the pool`);
    }

    // Remove member
    this.members.splice(index, 1);

    // Check minimum members
    if (this.members.length < 2) {
      throw new Error('Pool must have at least 2 members');
    }

    // Recalculate total CB
    this.recalculateTotalCB();
  }

  /**
   * BUSINESS LOGIC: Recalculate Total CB
   */
  private recalculateTotalCB(): void {
    this.totalCB = this.members.reduce((sum, member) => sum + member.complianceBalance, 0);
    this.isCompliant = this.totalCB >= 0;
  }

  /**
   * BUSINESS LOGIC: Get Surplus Members
   */
  getSurplusMembers(): PoolMember[] {
    return this.members.filter(m => m.complianceBalance > 0);
  }

  /**
   * BUSINESS LOGIC: Get Deficit Members
   */
  getDeficitMembers(): PoolMember[] {
    return this.members.filter(m => m.complianceBalance < 0);
  }

  /**
   * BUSINESS LOGIC: Get Total Surplus
   */
  getTotalSurplus(): number {
    return this.getSurplusMembers()
      .reduce((sum, m) => sum + m.complianceBalance, 0);
  }

  /**
   * BUSINESS LOGIC: Get Total Deficit
   */
  getTotalDeficit(): number {
    return Math.abs(
      this.getDeficitMembers()
        .reduce((sum, m) => sum + m.complianceBalance, 0)
    );
  }

  /**
   * BUSINESS LOGIC: Get Member by Ship ID
   */
  getMember(shipId: string): PoolMember | undefined {
    return this.members.find(m => m.shipId === shipId);
  }

  /**
   * BUSINESS LOGIC: Get Total CB in Tonnes
   */
  getTotalCBInTonnes(): number {
    return this.totalCB / 1000000;
  }

  /**
   * BUSINESS LOGIC: Calculate Penalty (if non-compliant)
   * 
   * Penalty is shared among all members
   */
  calculatePenalty(): number {
    if (this.isCompliant) {
      return 0;
    }

    // Deficit in tonnes
    const deficitTonnes = Math.abs(this.totalCB) / 1000000;
    
    // 2400 EUR per tonne
    return deficitTonnes * 2400;
  }

  /**
   * BUSINESS LOGIC: Get Penalty Per Member
   */
  getPenaltyPerMember(): number {
    const totalPenalty = this.calculatePenalty();
    
    if (totalPenalty === 0) {
      return 0;
    }

    return totalPenalty / this.members.length;
  }

  // ========================================
  // GETTERS
  // ========================================

  getId(): string | undefined {
    return this.id;
  }

  getPoolName(): string {
    return this.poolName;
  }

  getYear(): number {
    return this.year;
  }

  getMembers(): PoolMember[] {
    return [...this.members]; // Return copy to prevent mutation
  }

  getMemberCount(): number {
    return this.members.length;
  }

  getTotalCB(): number {
    return this.totalCB;
  }

  getIsCompliant(): boolean {
    return this.isCompliant;
  }

  getCreatedBy(): string | undefined {
    return this.createdBy;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  /**
   * Convert to plain object
   */
  toObject(): IPoolProps {
    return {
      id: this.id,
      poolName: this.poolName,
      year: this.year,
      members: this.members,
      totalCB: this.totalCB,
      isCompliant: this.isCompliant,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      description: this.description,
    };
  }
}