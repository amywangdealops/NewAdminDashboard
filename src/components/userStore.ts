export type UserRole = 'User' | 'Admin' | 'Dealops Internal Staff';
export type UserPermission = 'Full Access' | 'Edit' | 'View Only';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  manager: string | null;
  slackId: string;
  permission: UserPermission;
}

const STORAGE_KEY = 'admin_users';

const SEED_USERS: User[] = [
  { id: 1, name: 'Aimee Villaiona', role: 'User', manager: 'Sunil Joseph', slackId: 'U08KSRW3KMH', permission: 'View Only' },
  { id: 2, name: 'Albert Wong', role: 'Admin', manager: 'Miki Cisic', slackId: 'U08HV8D0VH9', permission: 'Full Access' },
  { id: 3, name: 'Alex Choi', role: 'Admin', manager: 'Albert Wong', slackId: 'U0A7D92F70Q', permission: 'Full Access' },
  { id: 4, name: 'Alvin Mak', role: 'User', manager: 'Russel Dulay', slackId: 'U09M37E9T9', permission: 'Edit' },
  { id: 5, name: 'Amy Wang', role: 'Dealops Internal Staff', manager: null, slackId: 'U08LFUNGS74', permission: 'Full Access' },
  { id: 6, name: 'Averi Haugesag', role: 'User', manager: 'Miki Cisic', slackId: 'U0A33MQKA48', permission: 'View Only' },
  { id: 7, name: 'Avi', role: 'Dealops Internal Staff', manager: null, slackId: 'U0936PUFH4M', permission: 'Full Access' },
  { id: 8, name: 'David Woods', role: 'User', manager: 'Miki Cisic', slackId: 'U0A2NTQAKMF', permission: 'Edit' },
  { id: 9, name: 'Devan Joseph', role: 'User', manager: 'Miki Cisic', slackId: 'U07EA3B7U3V', permission: 'Edit' },
  { id: 10, name: 'Dulanya', role: 'Admin', manager: null, slackId: 'U0AEDDRHQ8L', permission: 'Full Access' },
  { id: 11, name: 'Elizabeth Megido', role: 'User', manager: 'Albert Wong', slackId: 'U0A1RM973H6', permission: 'View Only' },
  { id: 12, name: 'Emir Alti', role: 'User', manager: null, slackId: 'U024N0F0F5B', permission: 'View Only' },
  { id: 13, name: 'Hilarie Williams', role: 'User', manager: 'Sunil Joseph', slackId: 'U09BNNYHQNM', permission: 'Edit' },
  { id: 14, name: 'Jackson Stevens', role: 'User', manager: 'Miki Cisic', slackId: 'U07QY7UISTZ', permission: 'View Only' },
  { id: 15, name: 'Jake Nordman', role: 'User', manager: 'Sunil Joseph', slackId: 'U09GZBEJYTH', permission: 'Edit' },
  { id: 16, name: 'John Basar', role: 'User', manager: 'Miki Cisic', slackId: 'U0815I49666', permission: 'View Only' },
  { id: 17, name: 'Jordan Pransky', role: 'User', manager: 'Miki Cisic', slackId: 'U08SP0YN8IJ', permission: 'Edit' },
  { id: 18, name: 'Lily Roosevelt', role: 'User', manager: 'Sunil Joseph', slackId: 'U06EBFWBB0E', permission: 'View Only' },
  { id: 19, name: 'Mary Kosakowska', role: 'User', manager: null, slackId: 'U07UT3EUQS7', permission: 'View Only' },
];

function getStoredUsers(): User[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAll(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const ALL_ROLES: UserRole[] = ['Admin', 'Dealops Internal Staff', 'User'];
export const ALL_PERMISSIONS: UserPermission[] = ['Full Access', 'Edit', 'View Only'];

export function listUsers(): User[] {
  const stored = getStoredUsers();
  if (stored.length === 0 || !stored[0].permission) {
    saveAll(SEED_USERS);
    return [...SEED_USERS];
  }
  return stored;
}

export function updateUser(id: number, data: Partial<Omit<User, 'id'>>): User {
  const users = listUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...data };
  saveAll(users);
  return users[idx];
}

export function bulkAddUsers(incoming: Omit<User, 'id'>[]): User[] {
  const users = listUsers();
  let nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  for (const entry of incoming) {
    const duplicate = users.find(
      u => u.name === entry.name && u.slackId === entry.slackId,
    );
    if (duplicate) {
      Object.assign(duplicate, entry);
    } else {
      users.push({ ...entry, id: nextId++ });
    }
  }
  saveAll(users);
  return users;
}

export function getManagerOptions(users: User[]): string[] {
  const managers = new Set<string>();
  for (const u of users) {
    if (u.manager) managers.add(u.manager);
  }
  return Array.from(managers).sort();
}
