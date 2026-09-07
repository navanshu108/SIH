export const crops = {
  soybean: {
    name: 'Soybean',
    scientificName: 'Glycine max',
    durationDays: 110,
    stages: ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Pod Formation', 'Maturity'],
    thresholds: {
      maxFloodDays: 3,
      criticalDepthCm: 15,
      sensitiveStages: ['Flowering', 'Pod Formation']
    }
  }
};

export const alternateCrops = [
  { name: 'Green Gram', duration: '60-70 d', waterNeed: 'Low', suitability: 89 },
  { name: 'Black Gram', duration: '70-80 d', waterNeed: 'Low', suitability: 82 },
  { name: 'Sesame', duration: '75-85 d', waterNeed: 'Low', suitability: 73 }
];