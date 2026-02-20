export const STANDARD_MILEAGE_RATE = 0.67;

export function calculateMileageDeduction(miles: number): number {
  return miles * STANDARD_MILEAGE_RATE;
}

export function formatMiles(miles: number): string {
  return `${Math.round(miles)} mi`;
}

export function calculateMonthlyRevenueShare(
  grossRevenue: number,
  appShareSoFar: number,
  threshold: number = 500
): { appShare: number; driverShare: number; hasReachedThreshold: boolean } {
  if (appShareSoFar >= threshold) {
    return {
      appShare: grossRevenue * 0.1,
      driverShare: grossRevenue * 0.9,
      hasReachedThreshold: true,
    };
  }

  const remainingToThreshold = threshold - appShareSoFar;
  const fiftyPercentShare = grossRevenue * 0.5;

  if (fiftyPercentShare <= remainingToThreshold) {
    return {
      appShare: fiftyPercentShare,
      driverShare: grossRevenue - fiftyPercentShare,
      hasReachedThreshold: false,
    };
  }

  const appShare = remainingToThreshold;
  const driverShare = grossRevenue - appShare;
  
  return {
    appShare,
    driverShare,
    hasReachedThreshold: appShareSoFar + appShare >= threshold,
  };
}
