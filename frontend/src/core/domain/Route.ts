export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface RouteComparison {
  baseline: {
    routeId: string;
    vesselType: string;
    fuelType: string;
    ghgIntensity: number;
  };
  target: number;
  year: number;
  comparisons: Array<{
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number;
    percentDiffFromBaseline: number;
    compliant: boolean;
    surplus: number;
    deficit: number;
  }>;
}