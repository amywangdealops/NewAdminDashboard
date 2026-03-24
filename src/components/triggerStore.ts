// Simple localStorage-based store for approval triggers created via templates or wizard

export interface StoredTrigger {
  id: number;
  name: string;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  category: string; // 'pricing' | 'terms' | 'custom'
  impact: { deals: number; avgTime: string };
  createdAt: string;
  fromTemplate?: string;
}

export interface TriggerData {
  id: number;
  name: string;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  category: string;
  impact: { deals: number; avgTime: string };
  createdAt?: string;
  fromTemplate?: string;
}

export const HARDCODED_TRIGGERS: TriggerData[] = [
  {
    id: 1,
    name: "High Discount Approval",
    when: "Discount > 20%",
    then: ["Deal Desk", "VP of Sales"],
    scope: ["Enterprise", "US"],
    status: "active",
    impact: { deals: 234, avgTime: "2.3h" },
    category: "pricing",
  },
  {
    id: 2,
    name: "Extended Payment Terms",
    when: "Payment Terms = Net 90",
    then: ["Finance", "Head of Sales"],
    scope: ["Enterprise", "EMEA"],
    status: "active",
    impact: { deals: 156, avgTime: "4.1h" },
    category: "terms",
  },
  {
    id: 3,
    name: "Auto-Renewal Disabled",
    when: "Auto-renewal = Off",
    then: ["Legal", "Customer Success"],
    scope: ["All segments"],
    status: "active",
    impact: { deals: 89, avgTime: "1.8h" },
    category: "terms",
  },
  {
    id: 4,
    name: "Custom Product Addition",
    when: "Product type = Custom",
    then: ["Product Team", "Engineering"],
    scope: ["Enterprise"],
    status: "active",
    impact: { deals: 45, avgTime: "6.2h" },
    category: "custom",
  },
  {
    id: 5,
    name: "Large Deal Override",
    when: "ACV > $500K",
    then: ["VP of Sales", "CFO"],
    scope: ["Enterprise", "Mid-Market"],
    status: "active",
    impact: { deals: 18, avgTime: "8.1h" },
    category: "pricing",
  },
  {
    id: 6,
    name: "Multi-Year Commitment",
    when: "Contract length > 1 year",
    then: ["Deal Desk", "Finance"],
    scope: ["All segments"],
    status: "active",
    impact: { deals: 112, avgTime: "3.5h" },
    category: "terms",
  },
  {
    id: 7,
    name: "Non-Standard Billing",
    when: "Billing Frequency ≠ Annual",
    then: ["Deal Desk"],
    scope: ["Mid-Market"],
    status: "paused",
    impact: { deals: 67, avgTime: "1.2h" },
    category: "terms",
  },
];

const STORAGE_KEY = 'approval_triggers';

export function getSavedTriggers(): StoredTrigger[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getAllTriggers(): TriggerData[] {
  return [
    ...HARDCODED_TRIGGERS,
    ...getSavedTriggers().map((st) => ({
      id: st.id,
      name: st.name,
      when: st.when,
      then: st.then,
      scope: st.scope,
      status: st.status as 'active' | 'paused',
      category: st.category,
      impact: st.impact,
      createdAt: st.createdAt,
      fromTemplate: st.fromTemplate,
    })),
  ];
}

export function saveTrigger(
  trigger: Omit<StoredTrigger, 'id' | 'createdAt'>
): StoredTrigger {
  const triggers = getSavedTriggers();
  const newTrigger: StoredTrigger = {
    ...trigger,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  triggers.push(newTrigger);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
  return newTrigger;
}

export function deleteTrigger(id: number): void {
  const triggers = getSavedTriggers().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
}

// --- Conflict / overlap matching for the builder ---

export type MatchLevel = 'exact' | 'field-overlap';

export interface MatchedTrigger {
  trigger: TriggerData;
  matchLevel: MatchLevel;
  matchedField: string;
}

const FIELD_ALIASES: Record<string, string[]> = {
  'discount': ['discount'],
  'payment terms': ['payment terms'],
  'billing frequency': ['billing frequency', 'billing'],
  'price protection': ['price protection'],
  'price lock': ['price lock'],
  'product type': ['product type'],
  'product': ['product'],
  'subscription term': ['subscription term'],
  'contract length': ['contract length', 'contract'],
  'revenue': ['revenue', 'acv', 'arr'],
  'deal size': ['deal size', 'acv'],
  'region': ['region'],
};

function normalizeField(field: string): string {
  return field.toLowerCase().trim();
}

function triggerFieldMatches(triggerWhen: string, conditionField: string): boolean {
  const whenLower = triggerWhen.toLowerCase();
  const fieldLower = normalizeField(conditionField);

  if (whenLower.startsWith(fieldLower)) return true;

  const aliases = FIELD_ALIASES[fieldLower];
  if (aliases) {
    return aliases.some((alias) => whenLower.startsWith(alias));
  }

  return false;
}

export function matchTriggersByConditions(
  conditions: { field: string; operator: string; value: string }[],
  triggers: TriggerData[],
): MatchedTrigger[] {
  if (conditions.length === 0) return [];

  const seen = new Set<number>();
  const results: MatchedTrigger[] = [];

  for (const trigger of triggers) {
    if (seen.has(trigger.id)) continue;

    for (const cond of conditions) {
      const condStr = `${cond.field} ${cond.operator} ${cond.value}`;
      const isExact = trigger.when.toLowerCase() === condStr.toLowerCase();

      if (isExact) {
        seen.add(trigger.id);
        results.push({ trigger, matchLevel: 'exact', matchedField: cond.field });
        break;
      }

      if (triggerFieldMatches(trigger.when, cond.field)) {
        seen.add(trigger.id);
        results.push({ trigger, matchLevel: 'field-overlap', matchedField: cond.field });
        break;
      }
    }
  }

  return results.sort((a, b) => {
    if (a.matchLevel === 'exact' && b.matchLevel !== 'exact') return -1;
    if (a.matchLevel !== 'exact' && b.matchLevel === 'exact') return 1;
    return 0;
  });
}


