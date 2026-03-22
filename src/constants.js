export const SCHOOLS = [
  { id: 'utah', name: 'University of Utah', short: 'Utah', color: '#CC0000', dark: '#990000', live: true },
  { id: 'byu', name: 'Brigham Young University', short: 'BYU', color: '#002E5D', dark: '#001f40', live: true },
  { id: 'usu', name: 'Utah State University', short: 'USU', color: '#003366', dark: '#002244', live: true },
  { id: 'uvu', name: 'Utah Valley University', short: 'UVU', color: '#275D38', dark: '#1a3d25', live: true },
  { id: 'tcu', name: 'Texas Christian University', short: 'TCU', color: '#4D1979', dark: '#350f54', live: true },
  { id: 'mit', name: 'MIT', short: 'MIT', color: '#A31F34', dark: '#7a1727', live: false },
  { id: 'stanford', name: 'Stanford University', short: 'Stanford', color: '#8C1515', dark: '#6a1010', live: false },
  { id: 'harvard', name: 'Harvard University', short: 'Harvard', color: '#A51C30', dark: '#7d1524', live: false },
  { id: 'ucla', name: 'UCLA', short: 'UCLA', color: '#2774AE', dark: '#1d5882', live: false },
  { id: 'usc', name: 'USC', short: 'USC', color: '#990000', dark: '#700000', live: false },
  { id: 'nyu', name: 'NYU', short: 'NYU', color: '#57068C', dark: '#3d0463', live: false },
  { id: 'umich', name: 'University of Michigan', short: 'UMich', color: '#00274C', dark: '#001830', live: false },
  { id: 'uw', name: 'University of Washington', short: 'UW', color: '#4B2E83', dark: '#35205e', live: false },
]

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏠' },
  { id: 'housing', label: 'Housing', icon: '🏡' },
  { id: 'sublease', label: 'Sublease', icon: '🔑' },
  { id: 'looking', label: 'Looking', icon: '🔍' },
  { id: 'textbooks', label: 'Textbooks', icon: '📚' },
  { id: 'furniture', label: 'Furniture', icon: '🛋️' },
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'appliances', label: 'Appliances', icon: '🍳' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'misc', label: 'Misc', icon: '📦' },
]

export const CONDITIONS = ['Like New', 'Good', 'Fair', 'Parts Only']

export const REPORT_REASONS = [
  'Spam / duplicate',
  'Scam or fraud',
  'Inappropriate content',
  'Wrong category',
  'Already sold',
  'Misleading listing',
  'Other',
]

export const GRADES = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', 'Grad Student']

export const CARD_COLORS = [
  { bg: '#EEF2FF', accent: '#6366F1' },
  { bg: '#FFF7ED', accent: '#F97316' },
  { bg: '#F0FDF4', accent: '#22C55E' },
  { bg: '#FDF4FF', accent: '#A855F7' },
  { bg: '#FFF1F2', accent: '#F43F5E' },
  { bg: '#F0F9FF', accent: '#0EA5E9' },
  { bg: '#FEFCE8', accent: '#EAB308' },
  { bg: '#FDF2F8', accent: '#EC4899' },
]

export function getCardColor(id) {
  if (!id) return CARD_COLORS[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}
