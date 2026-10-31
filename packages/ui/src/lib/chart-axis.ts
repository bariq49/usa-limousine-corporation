export function chartTickAmount(categoryCount: number, isMobile: boolean, isTablet: boolean) {
  if (categoryCount <= 12) {
    return categoryCount;
  }
  if (isMobile) {
    return Math.min(categoryCount, 5);
  }
  if (isTablet) {
    return Math.min(categoryCount, 8);
  }
  return Math.min(categoryCount, 12);
}

export function shouldTrimChartLabels(categoryCount: number) {
  return categoryCount > 12;
}
