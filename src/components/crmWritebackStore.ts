export type CrmObject = 'Quote' | 'Opportunity';

export interface WritebackField {
  id: number;
  dealopsField: string;
  crmObject: CrmObject;
  crmFieldName: string;
  lastModified: string;
  status: 'On' | 'Off';
}

export type WritebackFieldFormData = Omit<WritebackField, 'id' | 'lastModified'>;

const STORAGE_KEY = 'admin_crm_writeback';

function getStored(): WritebackField[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(fields: WritebackField[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

const SEED: WritebackField[] = [
  { id: 1, dealopsField: 'Quote: Name', crmObject: 'Quote', crmFieldName: 'Name', lastModified: '01/29/2026', status: 'On' },
  { id: 2, dealopsField: '', crmObject: 'Quote', crmFieldName: 'Service_Term_c', lastModified: '01/29/2026', status: 'On' },
  { id: 3, dealopsField: '', crmObject: 'Opportunity', crmFieldName: 'Service_Term_c', lastModified: '01/29/2026', status: 'On' },
  { id: 4, dealopsField: 'Term: Start Date', crmObject: 'Quote', crmFieldName: 'Contract_Start_Date_c', lastModified: '01/29/2026', status: 'On' },
  { id: 5, dealopsField: '', crmObject: 'Quote', crmFieldName: 'Contract_End_Date_c', lastModified: '01/29/2026', status: 'On' },
  { id: 6, dealopsField: 'Term: Opt Out', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_c', lastModified: '01/29/2026', status: 'Off' },
  { id: 7, dealopsField: '', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_Date_c', lastModified: '01/29/2026', status: 'On' },
  { id: 8, dealopsField: '', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_Reason_c', lastModified: '01/29/2026', status: 'On' },
  { id: 9, dealopsField: 'Term: Opt Out (Length)', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_Length_c', lastModified: '01/29/2026', status: 'Off' },
  { id: 10, dealopsField: 'Term: Opt Out', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_Dealops_c', lastModified: '01/29/2026', status: 'On' },
  { id: 11, dealopsField: '', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_Date_Dealops_c', lastModified: '01/29/2026', status: 'On' },
  { id: 12, dealopsField: '', crmObject: 'Opportunity', crmFieldName: 'Opt_Out_Length_Dealops_c', lastModified: '01/29/2026', status: 'On' },
  { id: 13, dealopsField: 'Term: Auto Renewal', crmObject: 'Quote', crmFieldName: 'Auto_Renew_c', lastModified: '01/29/2026', status: 'Off' },
  { id: 14, dealopsField: 'Term: Billing Frequency', crmObject: 'Quote', crmFieldName: 'Billing_Schedule_c', lastModified: '01/29/2026', status: 'Off' },
  { id: 15, dealopsField: 'Term: Payment Terms', crmObject: 'Quote', crmFieldName: 'Payment_Terms_c', lastModified: '01/29/2026', status: 'On' },
  { id: 16, dealopsField: '', crmObject: 'Quote', crmFieldName: 'Status', lastModified: '01/29/2026', status: 'On' },
  { id: 17, dealopsField: '', crmObject: 'Quote', crmFieldName: 'TCV_c', lastModified: '01/29/2026', status: 'On' },
  { id: 18, dealopsField: 'Quote: Annual Revenue', crmObject: 'Quote', crmFieldName: 'ARR_c', lastModified: '01/29/2026', status: 'On' },
  { id: 19, dealopsField: 'Quote: Monthly Revenue', crmObject: 'Quote', crmFieldName: 'REPLACE_WITH_YOUR_MRR_FIELD', lastModified: '01/29/2026', status: 'Off' },
];

export function listWritebackFields(): WritebackField[] {
  const stored = getStored();
  if (stored.length === 0) {
    saveAll(SEED);
    return [...SEED];
  }
  return stored;
}

export function createWritebackField(data: WritebackFieldFormData): WritebackField {
  const all = getStored().length > 0 ? getStored() : [...SEED];
  const field: WritebackField = {
    ...data,
    id: Date.now(),
    lastModified: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
  };
  all.push(field);
  saveAll(all);
  return field;
}

export function updateWritebackField(id: number, data: Partial<WritebackFieldFormData>): WritebackField {
  const all = getStored().length > 0 ? getStored() : [...SEED];
  const idx = all.findIndex(f => f.id === id);
  if (idx === -1) throw new Error('Field not found');
  all[idx] = {
    ...all[idx],
    ...data,
    lastModified: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
  };
  saveAll(all);
  return all[idx];
}

export function deleteWritebackField(id: number): void {
  const all = getStored().filter(f => f.id !== id);
  saveAll(all);
}
