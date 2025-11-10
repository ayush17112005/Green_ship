export interface PoolMember {
  shipId: string;
  complianceBalance: number;
  complianceBalanceTonnes: number;
  contribution: 'surplus' | 'deficit';
}

export interface Pool {
  id?: string;
  poolName: string;
  year: number;
  memberCount: number;
  members: PoolMember[];
  totalCB: number;
  totalCBTonnes: number;
  totalSurplus: number;
  totalDeficit: number;
  totalSurplusTonnes: number;
  totalDeficitTonnes: number;
  surplusMembers?: number;
  deficitMembers?: number;
  isCompliant: boolean;
  status: 'compliant' | 'non-compliant';
  penalty: number;
  penaltyPerMember: number;
  createdBy?: string;
  createdAt: string;
  description?: string;
}

export interface PoolSummary {
  id?: string;
  poolName: string;
  year: number;
  memberCount: number;
  totalCBTonnes: number;
  isCompliant: boolean;
  status: 'compliant' | 'non-compliant';
  createdAt: string;
}