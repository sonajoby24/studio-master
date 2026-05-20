export function calculateVendorScore(vendor: any) {
  const ratingWeight = 0.4;
  const deliveryWeight = 0.3;
  const pricingWeight = 0.3;

  const ratingScore = (vendor.rating || 0) * 20;

  const deliveryScore =
    100 - (vendor.deliveryDays || 10) * 5;

  const pricingScore =
    100 - (vendor.averagePrice || 100000) / 1000;

  const finalScore =
    ratingScore * ratingWeight +
    deliveryScore * deliveryWeight +
    pricingScore * pricingWeight;

  return Math.round(finalScore);
}