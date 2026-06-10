/**
 * vehicleSpecs.js
 * Static specs for every Indian EV model used in the app.
 * Values match the training dataset exactly (Battery Capacity, Claimed Range,
 * Energy Consumption, Vehicle Weight) so the ML model gets clean inputs.
 */

export const VEHICLE_SPECS = {
  "Hyundai Creta EV":      { capacity: 51.4, claimedRange: 473, energyConsumption: 15.49, weight: 1735 },
  "Hyundai Ioniq 5":       { capacity: 72.6, claimedRange: 631, energyConsumption: 16.12, weight: 1910 },
  "Kia Carens Clavis EV":  { capacity: 51.4, claimedRange: 473, energyConsumption: 15.49, weight: 1690 },
  "Kia EV6":               { capacity: 77.4, claimedRange: 708, energyConsumption: 16.50, weight: 1960 },
  "Kia EV9":               { capacity: 99.8, claimedRange: 561, energyConsumption: 21.80, weight: 2585 },
  "MG Comet EV":           { capacity: 17.3, claimedRange: 230, energyConsumption: 10.50, weight:  950 },
  "MG Windsor EV":         { capacity: 38.0, claimedRange: 331, energyConsumption: 14.80, weight: 1580 },
  "MG ZS EV":              { capacity: 50.3, claimedRange: 461, energyConsumption: 16.83, weight: 1592 },
  "Mahindra BE 6":         { capacity: 59.0, claimedRange: 535, energyConsumption: 15.10, weight: 1890 },
  "Mahindra XEV 9e":       { capacity: 79.0, claimedRange: 656, energyConsumption: 18.81, weight: 2070 },
  "Mahindra XUV400 EV":    { capacity: 39.4, claimedRange: 456, energyConsumption: 18.50, weight: 1528 },
  "Tata Curvv EV":         { capacity: 55.0, claimedRange: 585, energyConsumption: 14.20, weight: 1680 },
  "Tata Nexon EV":         { capacity: 40.5, claimedRange: 465, energyConsumption: 18.93, weight: 1445 },
  "Tata Punch EV":         { capacity: 35.0, claimedRange: 421, energyConsumption: 14.93, weight: 1315 },
  "Tata Tiago EV":         { capacity: 24.0, claimedRange: 315, energyConsumption: 14.63, weight: 1150 },
};

export const MODEL_NAMES = Object.keys(VEHICLE_SPECS);
