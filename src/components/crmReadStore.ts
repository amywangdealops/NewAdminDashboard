export type Visibility = 'Visible' | 'Hidden';
export type Editability = 'Read-only' | 'Editable';

export interface ReadField {
  id: number;
  order: number;
  crmField: string;
  displayName: string;
  editable: Editability;
  visible: Visibility;
}

export type ReadFieldFormData = Omit<ReadField, 'id'>;

const STORAGE_KEY = 'admin_crm_read';

function getStored(): ReadField[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(fields: ReadField[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

const SEED: ReadField[] = [
  { id: 1, order: 1, crmField: 'Amount', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 2, order: 2, crmField: 'CloseDate', displayName: 'Close Date', editable: 'Read-only', visible: 'Visible' },
  { id: 3, order: 3, crmField: 'Description', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 4, order: 4, crmField: 'Id', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 5, order: 5, crmField: 'Name', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 6, order: 6, crmField: 'StageName', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 7, order: 7, crmField: 'account.segment', displayName: 'Segment', editable: 'Read-only', visible: 'Visible' },
  { id: 8, order: 8, crmField: 'AccountId', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 9, order: 9, crmField: 'BillingCountry', displayName: 'Region', editable: 'Read-only', visible: 'Visible' },
  { id: 10, order: 10, crmField: 'Contract_Start_Date_c', displayName: 'StartDate', editable: 'Editable', visible: 'Visible' },
  { id: 11, order: 11, crmField: 'Opportunity_Record_Type_Name_c', displayName: 'RecordType', editable: 'Read-only', visible: 'Visible' },
  { id: 12, order: 12, crmField: 'OwnerId', displayName: '', editable: 'Read-only', visible: 'Hidden' },
  { id: 13, order: 13, crmField: 'Previous_Opportunity_c', displayName: 'PreviousOppId', editable: 'Read-only', visible: 'Visible' },
  { id: 14, order: 14, crmField: 'username', displayName: 'Owner', editable: 'Read-only', visible: 'Visible' },
];

export function listReadFields(): ReadField[] {
  const stored = getStored();
  if (stored.length === 0) {
    saveAll(SEED);
    return [...SEED];
  }
  return stored;
}

export function createReadField(data: ReadFieldFormData): ReadField {
  const all = getStored().length > 0 ? getStored() : [...SEED];
  const field: ReadField = { ...data, id: Date.now() };
  all.push(field);
  saveAll(all);
  return field;
}

export function updateReadField(id: number, data: Partial<ReadFieldFormData>): ReadField {
  const all = getStored().length > 0 ? getStored() : [...SEED];
  const idx = all.findIndex(f => f.id === id);
  if (idx === -1) throw new Error('Field not found');
  all[idx] = { ...all[idx], ...data };
  saveAll(all);
  return all[idx];
}

export function deleteReadField(id: number): void {
  const all = getStored().filter(f => f.id !== id);
  saveAll(all);
}
