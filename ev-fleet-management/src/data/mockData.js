// ── Indian EV Fleet Mock Data ─────────────────────────────────────────────────

export const vehicles = [
  {
    id: 'EV-001', model: 'Tata Nexon EV Max', manufacturer: 'Tata',
    image: 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
    driver: 'Arjun Sharma', driverId: 'D-001',
    batteryPercent: 78, batteryHealth: 94, speed: 54,
    location: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167,
    range: 287, revenue: 18400, status: 'running', isCharging: false,
    batteryCapacity: '40.5 kWh', totalDistance: 12450,
    serviceHistory: ['Tyre Rotation - Jan 2024', 'Battery Check - Mar 2024'],
    maintenanceRecords: ['Next service: Aug 2024', 'Software update pending'],
  },
  {
    id: 'EV-002', model: 'MG ZS EV', manufacturer: 'MG Motor',
    image: 'https://images.unsplash.com/photo-1605559424843-9073730702d0?w=400&h=250&fit=crop',
    driver: 'Priya Nair', driverId: 'D-002',
    batteryPercent: 45, batteryHealth: 88, speed: 0,
    location: 'Bandra, Mumbai', lat: 19.0596, lng: 72.8295,
    range: 185, revenue: 14200, status: 'charging', isCharging: true,
    batteryCapacity: '50.3 kWh', totalDistance: 8320,
    serviceHistory: ['Full Service - Feb 2024'],
    maintenanceRecords: ['Next service: Sep 2024'],
  },
  {
    id: 'EV-003', model: 'Hyundai Ioniq 5', manufacturer: 'Hyundai',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=250&fit=crop',
    driver: 'Rahul Verma', driverId: 'D-003',
    batteryPercent: 91, batteryHealth: 97, speed: 62,
    location: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245,
    range: 481, revenue: 22100, status: 'running', isCharging: false,
    batteryCapacity: '72.6 kWh', totalDistance: 5780,
    serviceHistory: ['Brake Check - Apr 2024'],
    maintenanceRecords: ['Next service: Oct 2024'],
  },
  {
    id: 'EV-004', model: 'Kia EV6', manufacturer: 'Kia',
    image: 'https://images.unsplash.com/photo-1610777988688-3671e03dbdf1?w=400&h=250&fit=crop',
    driver: 'Sneha Patel', driverId: 'D-004',
    batteryPercent: 23, batteryHealth: 79, speed: 0,
    location: 'Service Centre, Pune', lat: 18.5204, lng: 73.8567,
    range: 92, revenue: 8450, status: 'workshop', isCharging: false,
    batteryCapacity: '77.4 kWh', totalDistance: 22340,
    serviceHistory: ['Major Service - May 2024', 'Battery Inspection - Jan 2024'],
    maintenanceRecords: ['Current: Suspension Repair', 'Alignment check pending'],
  },
  {
    id: 'EV-005', model: 'BYD Atto 3', manufacturer: 'BYD',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    driver: 'Vikram Iyer', driverId: 'D-005',
    batteryPercent: 65, batteryHealth: 92, speed: 0,
    location: 'Chennai Airport, Chennai', lat: 12.9941, lng: 80.1709,
    range: 320, revenue: 16800, status: 'idle', isCharging: false,
    batteryCapacity: '60.48 kWh', totalDistance: 9870,
    serviceHistory: ['Tyre Change - Mar 2024'],
    maintenanceRecords: ['Next service: Jul 2024'],
  },
  {
    id: 'EV-006', model: 'Tata Tigor EV', manufacturer: 'Tata',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=250&fit=crop',
    driver: 'Deepa Krishnan', driverId: 'D-006',
    batteryPercent: 55, batteryHealth: 90, speed: 42,
    location: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341,
    range: 195, revenue: 11200, status: 'running', isCharging: false,
    batteryCapacity: '26 kWh', totalDistance: 7650,
    serviceHistory: ['Full Service - Feb 2024'],
    maintenanceRecords: ['Next service: Aug 2024'],
  },
  {
    id: 'EV-007', model: 'Ola S1 Pro', manufacturer: 'Ola Electric',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
    driver: 'Suresh Kumar', driverId: 'D-007',
    batteryPercent: 82, batteryHealth: 85, speed: 0,
    location: 'Charging Hub, Hyderabad', lat: 17.3850, lng: 78.4867,
    range: 181, revenue: 9800, status: 'charging', isCharging: true,
    batteryCapacity: '3.97 kWh', totalDistance: 15230,
    serviceHistory: ['Battery Health Check - Apr 2024'],
    maintenanceRecords: ['Next service: Sep 2024'],
  },
  {
    id: 'EV-008', model: 'Volvo XC40 Recharge', manufacturer: 'Volvo',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop',
    driver: 'Ananya Menon', driverId: 'D-008',
    batteryPercent: 70, batteryHealth: 96, speed: 58,
    location: 'Cyber City, Gurugram', lat: 28.4595, lng: 77.0266,
    range: 418, revenue: 24500, status: 'running', isCharging: false,
    batteryCapacity: '78 kWh', totalDistance: 6340,
    serviceHistory: ['Alignment - May 2024'],
    maintenanceRecords: ['Next service: Oct 2024'],
  },
];

export const drivers = [
  { id: 'D-001', name: 'Arjun Sharma',   vehicle: 'EV-001', vehicleModel: 'Tata Nexon EV Max',   trips: 124, overspeed: 2,  hardBraking: 5,  aggressiveAccel: 3,  safetyScore: 92, efficiencyScore: 88, avatar: 'AS', todayEarnings: 2450,  totalEarnings: 84200,  avgSpeed: 48, energyConsumed: 18.4 },
  { id: 'D-002', name: 'Priya Nair',      vehicle: 'EV-002', vehicleModel: 'MG ZS EV',            trips: 98,  overspeed: 0,  hardBraking: 1,  aggressiveAccel: 2,  safetyScore: 98, efficiencyScore: 95, avatar: 'PN', todayEarnings: 1800,  totalEarnings: 68900,  avgSpeed: 42, energyConsumed: 14.2 },
  { id: 'D-003', name: 'Rahul Verma',     vehicle: 'EV-003', vehicleModel: 'Hyundai Ioniq 5',     trips: 156, overspeed: 8,  hardBraking: 12, aggressiveAccel: 15, safetyScore: 68, efficiencyScore: 72, avatar: 'RV', todayEarnings: 3100,  totalEarnings: 121000, avgSpeed: 56, energyConsumed: 28.6 },
  { id: 'D-004', name: 'Sneha Patel',     vehicle: 'EV-004', vehicleModel: 'Kia EV6',             trips: 87,  overspeed: 1,  hardBraking: 3,  aggressiveAccel: 4,  safetyScore: 90, efficiencyScore: 82, avatar: 'SP', todayEarnings: 0,     totalEarnings: 52300,  avgSpeed: 44, energyConsumed: 22.1 },
  { id: 'D-005', name: 'Vikram Iyer',     vehicle: 'EV-005', vehicleModel: 'BYD Atto 3',          trips: 203, overspeed: 5,  hardBraking: 7,  aggressiveAccel: 6,  safetyScore: 84, efficiencyScore: 90, avatar: 'VI', todayEarnings: 1950,  totalEarnings: 145600, avgSpeed: 46, energyConsumed: 16.8 },
  { id: 'D-006', name: 'Deepa Krishnan', vehicle: 'EV-006', vehicleModel: 'Tata Tigor EV',        trips: 142, overspeed: 3,  hardBraking: 4,  aggressiveAccel: 5,  safetyScore: 87, efficiencyScore: 91, avatar: 'DK', todayEarnings: 2280,  totalEarnings: 97800,  avgSpeed: 45, energyConsumed: 15.6 },
  { id: 'D-007', name: 'Suresh Kumar',    vehicle: 'EV-007', vehicleModel: 'Ola S1 Pro',          trips: 178, overspeed: 12, hardBraking: 18, aggressiveAccel: 20, safetyScore: 59, efficiencyScore: 65, avatar: 'SK', todayEarnings: 1480,  totalEarnings: 103400, avgSpeed: 58, energyConsumed: 31.2 },
  { id: 'D-008', name: 'Ananya Menon',    vehicle: 'EV-008', vehicleModel: 'Volvo XC40 Recharge', trips: 115, overspeed: 1,  hardBraking: 2,  aggressiveAccel: 1,  safetyScore: 97, efficiencyScore: 94, avatar: 'AM', todayEarnings: 2670,  totalEarnings: 78900,  avgSpeed: 43, energyConsumed: 13.9 },
];

export const alerts = [
  { id: 1, type: 'low_battery',    title: 'Low Battery Alert',           message: 'EV-004 (Kia EV6) battery at 23%. Immediate charging required.',                          vehicle: 'EV-004', time: '5 min ago',   severity: 'critical' },
  { id: 2, type: 'battery_health', title: 'Battery Health Degradation',  message: 'EV-007 (Ola S1 Pro) battery health dropped to 85%. Schedule inspection.',               vehicle: 'EV-007', time: '18 min ago',  severity: 'warning'  },
  { id: 3, type: 'offline',        title: 'Vehicle Offline',              message: 'EV-004 is at service centre in Pune. Expected return: 2 days.',                          vehicle: 'EV-004', time: '2 hours ago', severity: 'warning'  },
  { id: 4, type: 'maintenance',    title: 'Maintenance Due',              message: 'EV-005 (BYD Atto 3) is due for scheduled maintenance this week.',                        vehicle: 'EV-005', time: '3 hours ago', severity: 'info'     },
  { id: 5, type: 'overspeed',      title: 'Over-Speeding Alert',          message: 'Driver Suresh Kumar exceeded speed limit (92 km/h in 60 km/h zone) on NH-44.',          vehicle: 'EV-007', time: '1 hour ago',  severity: 'critical' },
  { id: 6, type: 'maintenance',    title: 'Tyre Check Required',          message: 'EV-001 (Tata Nexon EV Max) tyre pressure low on rear-left. Check immediately.',          vehicle: 'EV-001', time: '4 hours ago', severity: 'info'     },
];

// ── Revenue by period (INR ₹) ────────────────────────────────────────────────
export const revenueByPeriod = {
  daily: [
    { label: '6AM',  revenue: 2800,  target: 2500  },
    { label: '8AM',  revenue: 5200,  target: 4500  },
    { label: '10AM', revenue: 6800,  target: 6000  },
    { label: '12PM', revenue: 7400,  target: 7000  },
    { label: '2PM',  revenue: 6200,  target: 6500  },
    { label: '4PM',  revenue: 8100,  target: 7500  },
    { label: '6PM',  revenue: 9400,  target: 8500  },
    { label: '8PM',  revenue: 7800,  target: 7000  },
    { label: '10PM', revenue: 4100,  target: 4000  },
  ],
  weekly: [
    { label: 'Mon', revenue: 42000,  target: 38000 },
    { label: 'Tue', revenue: 51000,  target: 45000 },
    { label: 'Wed', revenue: 48000,  target: 45000 },
    { label: 'Thu', revenue: 62000,  target: 50000 },
    { label: 'Fri', revenue: 71000,  target: 60000 },
    { label: 'Sat', revenue: 84000,  target: 70000 },
    { label: 'Sun', revenue: 56000,  target: 55000 },
  ],
  monthly: [
    { label: 'W1', revenue: 284000, target: 260000 },
    { label: 'W2', revenue: 312000, target: 280000 },
    { label: 'W3', revenue: 298000, target: 280000 },
    { label: 'W4', revenue: 346000, target: 320000 },
  ],
  yearly: [
    { label: 'Jan', revenue: 1120000, target: 1000000 },
    { label: 'Feb', revenue: 980000,  target: 1000000 },
    { label: 'Mar', revenue: 1240000, target: 1100000 },
    { label: 'Apr', revenue: 1180000, target: 1100000 },
    { label: 'May', revenue: 1360000, target: 1200000 },
    { label: 'Jun', revenue: 1410000, target: 1300000 },
    { label: 'Jul', revenue: 1290000, target: 1300000 },
    { label: 'Aug', revenue: 1520000, target: 1400000 },
    { label: 'Sep', revenue: 1480000, target: 1400000 },
    { label: 'Oct', revenue: 1630000, target: 1500000 },
    { label: 'Nov', revenue: 1710000, target: 1600000 },
    { label: 'Dec', revenue: 1890000, target: 1750000 },
  ],
};

// Backward compat
export const revenueData = revenueByPeriod.weekly.map(d => ({ day: d.label, revenue: d.revenue, target: d.target }));

// ── Driver earnings by period (INR ₹) ────────────────────────────────────────
export const driverEarningsByPeriod = {
  daily: [
    { label: '6AM',  earnings: 350  },
    { label: '8AM',  earnings: 680  },
    { label: '10AM', earnings: 820  },
    { label: '12PM', earnings: 940  },
    { label: '2PM',  earnings: 760  },
    { label: '4PM',  earnings: 1100 },
    { label: '6PM',  earnings: 1380 },
    { label: '8PM',  earnings: 950  },
    { label: '10PM', earnings: 520  },
  ],
  weekly: [
    { label: 'Mon', earnings: 1800 },
    { label: 'Tue', earnings: 2200 },
    { label: 'Wed', earnings: 1950 },
    { label: 'Thu', earnings: 2450 },
    { label: 'Fri', earnings: 2900 },
    { label: 'Sat', earnings: 3200 },
    { label: 'Sun', earnings: 2450 },
  ],
  monthly: [
    { label: 'W1', earnings: 14200 },
    { label: 'W2', earnings: 16800 },
    { label: 'W3', earnings: 15400 },
    { label: 'W4', earnings: 18600 },
  ],
  yearly: [
    { label: 'Jan', earnings: 58000  },
    { label: 'Feb', earnings: 52000  },
    { label: 'Mar', earnings: 64000  },
    { label: 'Apr', earnings: 61000  },
    { label: 'May', earnings: 72000  },
    { label: 'Jun', earnings: 75000  },
    { label: 'Jul', earnings: 68000  },
    { label: 'Aug', earnings: 80000  },
    { label: 'Sep', earnings: 77000  },
    { label: 'Oct', earnings: 85000  },
    { label: 'Nov', earnings: 90000  },
    { label: 'Dec', earnings: 98000  },
  ],
};

// ── Driver expenses by period (INR ₹) ────────────────────────────────────────
export const driverExpensesByPeriod = {
  daily: {
    charging:    [210, 180, 240, 195, 160, 310, 270, 220, 140],
    maintenance: [0,   0,   0,   0,   0,   800, 0,   0,   0  ],
    labels:      ['6AM','8AM','10AM','12PM','2PM','4PM','6PM','8PM','10PM'],
  },
  weekly: {
    charging:    [380, 420, 390, 450, 410, 480, 360],
    maintenance: [0,   0,   1200, 0,  0,   0,   0  ],
    labels:      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  },
  monthly: {
    charging:    [1640, 1820, 1580, 1960],
    maintenance: [1200, 0,    2400, 800 ],
    labels:      ['W1','W2','W3','W4'],
  },
  yearly: {
    charging:    [4800,  4200,  5100,  4900,  5600,  5800,  5200,  6100,  5900,  6400,  6800,  7200 ],
    maintenance: [2400,  0,     1800,  3200,  0,     4500,  1200,  0,     2800,  0,     1600,  3000 ],
    labels:      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },
};

// ── Stat multipliers per period ───────────────────────────────────────────────
export const statsByPeriod = {
  daily:   { fleetRevenue: 58200,   energyToday: 38.4,  revenueGrowth: 4.2,  energyGrowth: -1.1 },
  weekly:  { fleetRevenue: 414000,  energyToday: 284.6, revenueGrowth: 12.4, energyGrowth: -3.2 },
  monthly: { fleetRevenue: 1240000, energyToday: 1180,  revenueGrowth: 8.1,  energyGrowth: 2.4  },
  yearly:  { fleetRevenue: 15600000,energyToday: 14260, revenueGrowth: 22.7, energyGrowth: 9.8  },
};

export const energyData = [
  { time: '00:00', consumed: 12 }, { time: '04:00', consumed: 8  },
  { time: '08:00', consumed: 45 }, { time: '12:00', consumed: 68 },
  { time: '16:00', consumed: 72 }, { time: '20:00', consumed: 55 },
  { time: '23:59', consumed: 30 },
];

export const batteryHealthData = [
  { month: 'Jan', avgHealth: 96 }, { month: 'Feb', avgHealth: 95 },
  { month: 'Mar', avgHealth: 94 }, { month: 'Apr', avgHealth: 93 },
  { month: 'May', avgHealth: 91 }, { month: 'Jun', avgHealth: 90 },
  { month: 'Jul', avgHealth: 89 },
];

export const distanceData = [
  { day: 'Mon', distance: 342 }, { day: 'Tue', distance: 418 },
  { day: 'Wed', distance: 389 }, { day: 'Thu', distance: 521 },
  { day: 'Fri', distance: 478 }, { day: 'Sat', distance: 612 },
  { day: 'Sun', distance: 290 },
];

export const chargingPatternData = [
  { hour: '0AM',  sessions: 2  }, { hour: '2AM',  sessions: 1  },
  { hour: '4AM',  sessions: 3  }, { hour: '6AM',  sessions: 5  },
  { hour: '8AM',  sessions: 8  }, { hour: '10AM', sessions: 6  },
  { hour: '12PM', sessions: 4  }, { hour: '2PM',  sessions: 7  },
  { hour: '4PM',  sessions: 9  }, { hour: '6PM',  sessions: 11 },
  { hour: '8PM',  sessions: 8  }, { hour: '10PM', sessions: 5  },
];

// ── Indian EV models & cities ────────────────────────────────────────────────
export const evModels = [
  'Tata Nexon EV Max', 'Tata Nexon EV Prime', 'Tata Tigor EV', 'Tata Punch EV',
  'MG ZS EV', 'MG Comet EV',
  'Hyundai Ioniq 5', 'Hyundai Kona Electric',
  'Kia EV6',
  'BYD Atto 3', 'BYD Seal',
  'Mahindra XUV400', 'Mahindra BE 6e',
  'Ola S1 Pro', 'Ola S1 Air',
  'Volvo XC40 Recharge', 'BMW iX1',
  'Citroen eC3',
];

export const cities = [
  'New Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kochi', 'Chandigarh', 'Noida', 'Gurugram',
];

// ── Indian charging stations ─────────────────────────────────────────────────
export const chargingStations = [
  { id: 'CS-1', name: 'Tata Power EZ Charge',     location: 'Connaught Place, Delhi',  distance: 2.4,  available: 3, total: 6, power: '50 kW'  },
  { id: 'CS-2', name: 'EESL Fast Charger',         location: 'IGI Airport, Delhi',       distance: 18.6, available: 1, total: 4, power: '25 kW'  },
  { id: 'CS-3', name: 'BPCL EV Station',           location: 'NH-48, Gurugram',          distance: 12.1, available: 5, total: 8, power: '150 kW' },
  { id: 'CS-4', name: 'Ather Grid Fast Charger',   location: 'Cyber City, Gurugram',     distance: 5.8,  available: 2, total: 4, power: '22 kW'  },
];

// ── Trip history (Indian cities) ─────────────────────────────────────────────
export const tripHistory = [
  { id: 'T-001', date: '2024-06-08', from: 'Connaught Place', to: 'IGI Airport',       distance: 22.4, duration: '38 min', earnings: 680,  energyUsed: 8.2  },
  { id: 'T-002', date: '2024-06-08', from: 'IGI Airport',      to: 'Cyber City',        distance: 14.8, duration: '26 min', earnings: 450,  energyUsed: 5.4  },
  { id: 'T-003', date: '2024-06-07', from: 'Cyber City',        to: 'Saket',            distance: 18.6, duration: '34 min', earnings: 560,  energyUsed: 6.8  },
  { id: 'T-004', date: '2024-06-07', from: 'Saket',             to: 'Noida Sector 18',  distance: 28.4, duration: '52 min', earnings: 840,  energyUsed: 10.2 },
  { id: 'T-005', date: '2024-06-06', from: 'Noida',             to: 'Connaught Place',  distance: 24.2, duration: '44 min', earnings: 720,  energyUsed: 8.8  },
];

// ── Per-vehicle expenses (INR ₹) ─────────────────────────────────────────────
export const vehicleExpenses = {
  'EV-001': {
    total: 48200, charging: 12400, maintenance: 8900, insurance: 12000, misc: 14900,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 2100, note: 'Monthly charging cost'     },
      { date: 'May 2024', type: 'Maintenance', amount: 3400, note: 'Tyre rotation + alignment' },
      { date: 'May 2024', type: 'Charging',    amount: 1950, note: 'Monthly charging cost'     },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3000, note: 'Quarterly premium'         },
      { date: 'Apr 2024', type: 'Charging',    amount: 2050, note: 'Monthly charging cost'     },
      { date: 'Mar 2024', type: 'Maintenance', amount: 5500, note: 'Battery health check'      },
    ],
  },
  'EV-002': {
    total: 61400, charging: 18200, maintenance: 12400, insurance: 15000, misc: 15800,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 3100, note: 'Monthly charging cost' },
      { date: 'May 2024', type: 'Maintenance', amount: 6200, note: 'Full service'           },
      { date: 'May 2024', type: 'Charging',    amount: 2900, note: 'Monthly charging cost' },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3750, note: 'Quarterly premium'     },
    ],
  },
  'EV-003': {
    total: 39800, charging: 9800, maintenance: 5600, insurance: 12000, misc: 12400,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 1650, note: 'Monthly charging cost' },
      { date: 'May 2024', type: 'Maintenance', amount: 2800, note: 'Brake check'           },
      { date: 'May 2024', type: 'Charging',    amount: 1580, note: 'Monthly charging cost' },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3000, note: 'Quarterly premium'     },
    ],
  },
  'EV-004': {
    total: 92400, charging: 21000, maintenance: 34000, insurance: 15000, misc: 22400,
    history: [
      { date: 'Jun 2024', type: 'Maintenance', amount: 12000, note: 'Suspension repair (workshop)' },
      { date: 'Jun 2024', type: 'Maintenance', amount: 4800,  note: 'Alignment check'              },
      { date: 'May 2024', type: 'Maintenance', amount: 8900,  note: 'Major service'                },
      { date: 'Jan 2024', type: 'Maintenance', amount: 8300,  note: 'Battery inspection'           },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3750,  note: 'Quarterly premium'            },
    ],
  },
  'EV-005': {
    total: 51200, charging: 15400, maintenance: 7800, insurance: 12000, misc: 16000,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 2600, note: 'Monthly charging cost' },
      { date: 'May 2024', type: 'Maintenance', amount: 3900, note: 'Tyre change'           },
      { date: 'May 2024', type: 'Charging',    amount: 2480, note: 'Monthly charging cost' },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3000, note: 'Quarterly premium'     },
    ],
  },
  'EV-006': {
    total: 43600, charging: 11800, maintenance: 6400, insurance: 12000, misc: 13400,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 1980, note: 'Monthly charging cost' },
      { date: 'May 2024', type: 'Maintenance', amount: 3200, note: 'Full service'           },
      { date: 'May 2024', type: 'Charging',    amount: 1920, note: 'Monthly charging cost' },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3000, note: 'Quarterly premium'     },
    ],
  },
  'EV-007': {
    total: 76800, charging: 23400, maintenance: 21000, insurance: 15000, misc: 17400,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 3980, note: 'Monthly charging cost' },
      { date: 'May 2024', type: 'Maintenance', amount: 7600, note: 'Battery health check'  },
      { date: 'May 2024', type: 'Charging',    amount: 3850, note: 'Monthly charging cost' },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3750, note: 'Quarterly premium'     },
    ],
  },
  'EV-008': {
    total: 37400, charging: 9400, maintenance: 4800, insurance: 12000, misc: 11200,
    history: [
      { date: 'Jun 2024', type: 'Charging',    amount: 1580, note: 'Monthly charging cost' },
      { date: 'May 2024', type: 'Maintenance', amount: 2400, note: 'Alignment'             },
      { date: 'May 2024', type: 'Charging',    amount: 1520, note: 'Monthly charging cost' },
      { date: 'Apr 2024', type: 'Insurance',   amount: 3000, note: 'Quarterly premium'     },
    ],
  },
};

// ── Unassigned drivers ────────────────────────────────────────────────────────
export const unassignedDrivers = [
  { id: 'D-009', name: 'Rohan Mehta',   avatar: 'RM', phone: '+91 98765 43210', email: 'rohan@evfleet.in',  joined: 'Jun 2024', license: 'DL-0420110123456' },
  { id: 'D-010', name: 'Kavya Reddy',   avatar: 'KR', phone: '+91 87654 32109', email: 'kavya@evfleet.in',  joined: 'May 2024', license: 'TS-0920200034567' },
  { id: 'D-011', name: 'Amit Joshi',    avatar: 'AJ', phone: '+91 76543 21098', email: 'amit@evfleet.in',   joined: 'Jun 2024', license: 'MH-0120190045678' },
];

export const dashboardStats = {
  totalVehicles: 8, activeVehicles: 4, workshopVehicles: 1, totalDrivers: 8,
  fleetRevenue: 414000, energyToday: 284.6, avgBatteryHealth: 90.1, chargingVehicles: 2,
  revenueGrowth: 12.4, energyGrowth: -3.2, healthGrowth: -1.1, activeGrowth: 0,
};

// ── Indian EV base ranges (km) ────────────────────────────────────────────────
export const indianEVBaseRange = {
  'Tata Nexon EV Max':    437,
  'Tata Nexon EV Prime':  312,
  'Tata Tigor EV':        306,
  'Tata Punch EV':        421,
  'MG ZS EV':             461,
  'MG Comet EV':          230,
  'Hyundai Ioniq 5':      631,
  'Hyundai Kona Electric':452,
  'Kia EV6':              708,
  'BYD Atto 3':           521,
  'BYD Seal':             650,
  'Mahindra XUV400':      456,
  'Mahindra BE 6e':       535,
  'Ola S1 Pro':           195,
  'Ola S1 Air':           151,
  'Volvo XC40 Recharge':  418,
  'BMW iX1':              440,
  'Citroen eC3':          320,
};

export const allBrands     = ['All Brands', ...new Set(vehicles.map(v => v.manufacturer))];
export const allVehicleIds = ['All Vehicles', ...vehicles.map(v => `${v.id} – ${v.model}`)];
