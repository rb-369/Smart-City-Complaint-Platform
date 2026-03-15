// mockData.js — FALLBACK DATA
// Used when the backend API is offline (development/demo purposes)
// In production all data comes from MongoDB via the API

export const MOCK_COMPLAINTS = [
  {
    id: 'CMP-001', title: 'Critical Pothole on NH-48',
    description: 'Massive pothole near Dhaula Kuan flyover. At least 4 vehicles damaged this week. Emergency repair needed.',
    category: 'Road Damage', ai_category: 'Road Damage',
    severity_score: 9, priority_level: 'Critical', status: 'In Progress',
    reported_by: 'Rahul Sharma',
    location: { lat: 28.591, lng: 77.156, address: 'NH-48, Dhaula Kuan' },
    created_at: '2024-01-25T09:15:00Z',
  },
  {
    id: 'CMP-002', title: 'Garbage Overflow — Sector 12 Market',
    description: 'Bins not emptied for 5 days. Visible rats near food stalls. Foul smell spreading to residences.',
    category: 'Garbage', ai_category: 'Garbage',
    severity_score: 7, priority_level: 'High', status: 'Pending',
    reported_by: 'Priya Nair',
    location: { lat: 28.614, lng: 77.218, address: 'Sector 12 Market' },
    created_at: '2024-01-25T11:30:00Z',
  },
  {
    id: 'CMP-003', title: 'Burst Water Main — MG Road',
    description: 'Underground pipe burst, water flooding both lanes of MG Road. Traffic completely blocked.',
    category: 'Water Leakage', ai_category: 'Water Leakage',
    severity_score: 8, priority_level: 'Critical', status: 'Resolved',
    reported_by: 'Amit Verma',
    location: { lat: 28.632, lng: 77.220, address: 'MG Road, Connaught Place' },
    created_at: '2024-01-24T14:00:00Z',
  },
  {
    id: 'CMP-004', title: 'Streetlights Out — Lajpat Nagar Block C',
    description: 'Entire block dark for 3 consecutive nights. A robbery was reported last night.',
    category: 'Electricity Issue', ai_category: 'Electricity Issue',
    severity_score: 8, priority_level: 'High', status: 'Pending',
    reported_by: 'Sunita Mehra',
    location: { lat: 28.569, lng: 77.243, address: 'Lajpat Nagar Block C' },
    created_at: '2024-01-24T18:45:00Z',
  },
  {
    id: 'CMP-005', title: 'Signal Failure — ITO Junction',
    description: 'All 4 traffic signals at ITO junction dead since morning. Near-miss accidents. Police deployed.',
    category: 'Traffic Issue', ai_category: 'Traffic Issue',
    severity_score: 9, priority_level: 'Critical', status: 'In Progress',
    reported_by: 'Deepak Joshi',
    location: { lat: 28.627, lng: 77.241, address: 'ITO Junction' },
    created_at: '2024-01-23T08:00:00Z',
  },
  {
    id: 'CMP-006', title: 'Broken Road — Vasant Kunj Sector D',
    description: 'Road surface completely deteriorated. Several vehicles have damaged tyres.',
    category: 'Road Damage', ai_category: 'Road Damage',
    severity_score: 6, priority_level: 'Medium', status: 'Pending',
    reported_by: 'Kavya Reddy',
    location: { lat: 28.521, lng: 77.157, address: 'Vasant Kunj Sector D' },
    created_at: '2024-01-23T10:30:00Z',
  },
  {
    id: 'CMP-007', title: 'Sewage Leakage — Civil Lines',
    description: 'Sewage pipe cracked and leaking onto pavement. Health hazard for school children.',
    category: 'Water Leakage', ai_category: 'Water Leakage',
    severity_score: 7, priority_level: 'High', status: 'Resolved',
    reported_by: 'Ravi Kumar',
    location: { lat: 28.677, lng: 77.225, address: 'Civil Lines, Old Delhi' },
    created_at: '2024-01-22T13:20:00Z',
  },
  {
    id: 'CMP-008', title: 'Illegal Waste Dumping — Saket',
    description: 'Construction debris dumped illegally near residential complex. Blocking pedestrian walkway.',
    category: 'Garbage', ai_category: 'Garbage',
    severity_score: 5, priority_level: 'Medium', status: 'Pending',
    reported_by: 'Anita Singh',
    location: { lat: 28.529, lng: 77.214, address: 'Saket District Centre' },
    created_at: '2024-01-22T09:00:00Z',
  },
  {
    id: 'CMP-009', title: 'Fallen Live Wire — Karol Bagh',
    description: 'Live electrical wire fallen on road after last night\'s storm. EXTREMELY DANGEROUS.',
    category: 'Electricity Issue', ai_category: 'Electricity Issue',
    severity_score: 10, priority_level: 'Critical', status: 'Resolved',
    reported_by: 'Mohit Arora',
    location: { lat: 28.652, lng: 77.190, address: 'Karol Bagh Main Market' },
    created_at: '2024-01-21T06:30:00Z',
  },
  {
    id: 'CMP-010', title: 'Pothole Cluster — Dwarka Sector 10',
    description: 'At least 8 potholes in a 200m stretch. During rain it floods completely.',
    category: 'Road Damage', ai_category: 'Road Damage',
    severity_score: 7, priority_level: 'High', status: 'In Progress',
    reported_by: 'Nisha Gupta',
    location: { lat: 28.576, lng: 77.048, address: 'Dwarka Sector 10' },
    created_at: '2024-01-21T15:00:00Z',
  },
  {
    id: 'CMP-011', title: 'No Water Supply — Rohini Sector 22',
    description: 'Water supply cut since 48 hours. Over 500 residents affected. Tanker requested but not arrived.',
    category: 'Water Leakage', ai_category: 'Water Leakage',
    severity_score: 6, priority_level: 'Medium', status: 'Pending',
    reported_by: 'Suresh Pillai',
    location: { lat: 28.741, lng: 77.091, address: 'Rohini Sector 22' },
    created_at: '2024-01-20T08:00:00Z',
  },
  {
    id: 'CMP-012', title: 'Overflowing Drain — Nehru Place',
    description: 'Stormwater drain overflowing onto main road. Vehicles stuck. Businesses unable to open.',
    category: 'Water Leakage', ai_category: 'Water Leakage',
    severity_score: 7, priority_level: 'High', status: 'Resolved',
    reported_by: 'Tanvi Jain',
    location: { lat: 28.548, lng: 77.251, address: 'Nehru Place Ring Road' },
    created_at: '2024-01-20T12:00:00Z',
  },
]

// Pre-calculated analytics — mirrors what GET /analytics returns
export const MOCK_ANALYTICS = {
  total:    12,
  pending:  5,
  progress: 3,
  resolved: 4,
  critical: 3,
  byCategory: {
    'Road Damage':       4,
    'Garbage':           2,
    'Water Leakage':     4,
    'Electricity Issue': 2,
    'Traffic Issue':     1,
  },
  byPriority: { Critical: 3, High: 5, Medium: 3, Low: 1 },
  trend: [
    { date: '19 Jan', count: 1 },
    { date: '20 Jan', count: 3 },
    { date: '21 Jan', count: 2 },
    { date: '22 Jan', count: 2 },
    { date: '23 Jan', count: 2 },
    { date: '24 Jan', count: 1 },
    { date: '25 Jan', count: 1 },
  ],
}

// Category display config (icon + color) — used in both Dashboard and MapView
export const CATEGORY_CONFIG = {
  'Road Damage':       { color: '#FFAB00', icon: '🕳️', chartColor: '#FFAB00' },
  'Garbage':           { color: '#00E676', icon: '🗑️', chartColor: '#00E676' },
  'Water Leakage':     { color: '#00D4FF', icon: '💧', chartColor: '#00D4FF' },
  'Electricity Issue': { color: '#FF4560', icon: '⚡', chartColor: '#FF4560' },
  'Traffic Issue':     { color: '#7B61FF', icon: '🚦', chartColor: '#7B61FF' },
}

// Priority color map — used in both Dashboard and MapView
export const PRIORITY_COLORS = {
  Critical: '#FF4560',
  High:     '#FFAB00',
  Medium:   '#00D4FF',
  Low:      '#00E676',
}