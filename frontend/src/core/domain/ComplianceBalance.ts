export interface ComplianceBalance {
  shipId: string;
  year: number;
  routeId: string;
  energyInScope: number;
  fuelConsumption: number;
  ghgTarget: number;
  ghgActual: number;
  complianceBalance: number;
  complianceBalanceTonnes: number;
  isCompliant: boolean;
  status: 'compliant' | 'non-compliant';
  surplus: number;
  deficit: number;
  surplusTonnes: number;
  deficitTonnes: number;
  penalty: number;
  message: string;
}