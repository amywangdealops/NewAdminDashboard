export const TIME_PERIODS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Quarter', 'This Year'] as const;

export type TimePeriod = typeof TIME_PERIODS[number];

export const KPI_DATA: Record<TimePeriod, {
  totalApprovals: number;
  avgTime: number;
  pending: number;
  rejectionRate: number;
  vpReviews: number;
  cfoReviews: number;
}> = {
  'Last 7 Days':   { totalApprovals: 87,  avgTime: 3.2, pending: 14, rejectionRate: 8.0, vpReviews: 11, cfoReviews: 3 },
  'Last 30 Days':  { totalApprovals: 342, avgTime: 4.1, pending: 23, rejectionRate: 9.4, vpReviews: 48, cfoReviews: 12 },
  'Last 90 Days':  { totalApprovals: 1024,avgTime: 4.4, pending: 31, rejectionRate: 10.2,vpReviews: 139, cfoReviews: 38 },
  'This Quarter':  { totalApprovals: 891, avgTime: 4.3, pending: 28, rejectionRate: 9.8, vpReviews: 124, cfoReviews: 34 },
  'This Year':     { totalApprovals: 2847,avgTime: 4.6, pending: 23, rejectionRate: 11.1,vpReviews: 412, cfoReviews: 108 },
};

export const BOTTLENECK_STAGES = [
  { stage: 'Deal Desk Review',       avgDays: 0.8, dealCount: 156, pctOfTotal: 46, trend: -5,  color: '#22c55e' },
  { stage: 'VP of Sales Approval',   avgDays: 2.4, dealCount: 48,  pctOfTotal: 14, trend: 12,  color: '#ef4444' },
  { stage: 'Finance / CFO Review',   avgDays: 3.1, dealCount: 34,  pctOfTotal: 10, trend: 8,   color: '#ef4444' },
  { stage: 'Legal Review',           avgDays: 1.9, dealCount: 22,  pctOfTotal: 6,  trend: -2,  color: '#f59e0b' },
  { stage: 'Head of Mid-Market',     avgDays: 1.5, dealCount: 41,  pctOfTotal: 12, trend: 3,   color: '#f59e0b' },
  { stage: 'L2 Escalation',          avgDays: 1.2, dealCount: 41,  pctOfTotal: 12, trend: -1,  color: '#22c55e' },
];

export const RULE_TRIGGER_DATA = [
  { rule: 'Payment Terms → Deal Desk',             count: 234, pct: 22, avgTime: '2.1h', rejRate: 4,  category: 'terms' },
  { rule: 'Billing Frequency Change → Deal Desk',  count: 189, pct: 18, avgTime: '1.8h', rejRate: 3,  category: 'terms' },
  { rule: 'Discount > 20% → L2 Approval',          count: 167, pct: 16, avgTime: '3.2h', rejRate: 12, category: 'pricing' },
  { rule: 'Custom Product → L2',                    count: 156, pct: 15, avgTime: '4.6h', rejRate: 9,  category: 'custom' },
  { rule: 'Price Lock → VP of Sales',               count: 98,  pct: 9,  avgTime: '8.4h', rejRate: 18, category: 'pricing' },
  { rule: 'ACV > $200K → VP Approval',              count: 72,  pct: 7,  avgTime: '6.2h', rejRate: 7,  category: 'pricing' },
  { rule: 'Net 90+ Terms → Finance',                count: 54,  pct: 5,  avgTime: '5.8h', rejRate: 15, category: 'terms' },
  { rule: 'Multi-Year > 3yr → CFO',                 count: 38,  pct: 4,  avgTime: '12.1h',rejRate: 22, category: 'terms' },
  { rule: 'Non-Standard Entity → Legal',            count: 31,  pct: 3,  avgTime: '9.2h', rejRate: 6,  category: 'custom' },
  { rule: 'Expansion – Billing Mismatch → Deal Desk', count: 18, pct: 1, avgTime: '3.4h', rejRate: 5, category: 'custom' },
];

export const APPROVER_PERFORMANCE = [
  { name: 'Yi-an Zhang',      group: 'Deal Desk',         avgTime: '1.4h', approvals: 142, pending: 3,  rejections: 6,  sla: 94, avatar: 'YZ' },
  { name: 'Spyri Karasavva',  group: 'Deal Desk',         avgTime: '2.2h', approvals: 128, pending: 5,  rejections: 8,  sla: 87, avatar: 'SK' },
  { name: 'Amy Wang',         group: 'Finance Team',      avgTime: '3.8h', approvals: 64,  pending: 2,  rejections: 4,  sla: 78, avatar: 'AW' },
  { name: 'Miles Zimmerman',  group: 'Finance Team / L2', avgTime: '5.2h', approvals: 96,  pending: 8,  rejections: 11, sla: 68, avatar: 'MZ' },
  { name: 'Danek Li',         group: 'VP of Sales',       avgTime: '8.4h', approvals: 48,  pending: 6,  rejections: 9,  sla: 52, avatar: 'DL' },
  { name: 'Ankitr Wadhina',   group: 'Head of Mid-Market',avgTime: '6.1h', approvals: 41,  pending: 4,  rejections: 5,  sla: 61, avatar: 'AK' },
];

export const EXECUTIVE_REVIEWS = [
  { level: 'VP of Sales',  deals: 48,  pctOfTotal: 14.0, avgDealSize: '$187K', avgTime: '8.4h', topTrigger: 'Price Lock > 12mo',        approvalRate: 81 },
  { level: 'CFO',          deals: 12,  pctOfTotal: 3.5,  avgDealSize: '$520K', avgTime: '12.1h',topTrigger: 'Multi-Year > 3yr',          approvalRate: 75 },
  { level: 'Head of Mid-Market', deals: 41, pctOfTotal: 12.0, avgDealSize: '$95K', avgTime: '6.1h', topTrigger: 'Non-Standard Terms', approvalRate: 88 },
  { level: 'Legal',        deals: 22,  pctOfTotal: 6.4,  avgDealSize: '$245K', avgTime: '9.2h', topTrigger: 'Non-Standard Entity',       approvalRate: 91 },
];

export const THRESHOLD_IMPACT = [
  { threshold: 'Discount > 20%',      currentTriggers: 167, ifLowered: { label: '> 15%', triggers: 241, delta: '+44%' }, ifRaised: { label: '> 25%', triggers: 98,  delta: '-41%' }, avgDealImpact: '$12K', recommendation: 'Current threshold well-balanced' },
  { threshold: 'ACV > $200K',         currentTriggers: 72,  ifLowered: { label: '> $150K', triggers: 118, delta: '+64%' }, ifRaised: { label: '> $300K', triggers: 31,  delta: '-57%' }, avgDealImpact: '$47K', recommendation: 'Consider raising — low rejection rate (7%)' },
  { threshold: 'Payment Terms Net 90+',currentTriggers: 54,  ifLowered: { label: 'Net 60+', triggers: 142, delta: '+163%' }, ifRaised: { label: 'Net 120+', triggers: 12, delta: '-78%' }, avgDealImpact: '$8K',  recommendation: 'Keep current — high rejection rate (15%)' },
  { threshold: 'Multi-Year > 3yr',    currentTriggers: 38,  ifLowered: { label: '> 2yr', triggers: 89, delta: '+134%' }, ifRaised: { label: '> 4yr', triggers: 11,  delta: '-71%' }, avgDealImpact: '$62K', recommendation: 'Consider lowering — CFO rejects 22%' },
  { threshold: 'Price Lock > 12mo',   currentTriggers: 98,  ifLowered: { label: '> 6mo', triggers: 187, delta: '+91%' }, ifRaised: { label: '> 18mo', triggers: 42,  delta: '-57%' }, avgDealImpact: '$23K', recommendation: 'Current threshold appropriate' },
];

export const WEEKLY_TREND = [
  { week: 'Jan 6',  approvals: 78,  avgTime: 4.8, rejections: 9 },
  { week: 'Jan 13', approvals: 82,  avgTime: 4.5, rejections: 7 },
  { week: 'Jan 20', approvals: 91,  avgTime: 4.2, rejections: 10 },
  { week: 'Jan 27', approvals: 85,  avgTime: 4.6, rejections: 8 },
  { week: 'Feb 3',  approvals: 87,  avgTime: 4.1, rejections: 7 },
  { week: 'Feb 10', approvals: 42,  avgTime: 3.2, rejections: 3 },
];

export const APPROVAL_TIME_DISTRIBUTION = [
  { bucket: '< 1 hour',     count: 68,  pct: 20, color: '#22c55e' },
  { bucket: '1 – 2 hours',  count: 85,  pct: 25, color: '#22c55e' },
  { bucket: '2 – 4 hours',  count: 92,  pct: 27, color: '#3b82f6' },
  { bucket: '4 – 8 hours',  count: 58,  pct: 17, color: '#f59e0b' },
  { bucket: '8 – 24 hours', count: 27,  pct: 8,  color: '#ef4444' },
  { bucket: '> 24 hours',   count: 12,  pct: 3,  color: '#dc2626' },
];

export const RULE_CATEGORY_SUMMARY = [
  { cat: 'Pricing', count: 337, rules: 3, color: '#3b82f6', pct: 32, topRule: 'Discount > 20%', topCount: 167 },
  { cat: 'Commercial Terms', count: 515, rules: 4, color: '#8b5cf6', pct: 49, topRule: 'Payment Terms', topCount: 234 },
  { cat: 'Custom', count: 205, rules: 3, color: '#f59e0b', pct: 19, topRule: 'Custom Product → L2', topCount: 156 },
];

export const EXEC_WEEKLY_VOLUME = [
  { week: 'Jan 6', vp: 11, cfo: 3 },
  { week: 'Jan 13', vp: 13, cfo: 2 },
  { week: 'Jan 20', vp: 14, cfo: 4 },
  { week: 'Jan 27', vp: 10, cfo: 3 },
  { week: 'Feb 3', vp: 12, cfo: 2 },
  { week: 'Feb 10', vp: 5, cfo: 1 },
];
