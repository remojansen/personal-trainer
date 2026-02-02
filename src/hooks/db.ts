import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { Activity, UserProfile, UserStatsEntry } from './useUserData';

interface PersonalTrainerDB extends DBSchema {
	userProfile: {
		key: 'user';
		value: UserProfile;
	};
	activities: {
		key: string;
		value: Activity;
		indexes: {
			'by-date': string;
			'by-type': string;
		};
	};
	statsEntries: {
		key: string;
		value: UserStatsEntry;
		indexes: {
			'by-date': string;
		};
	};
}

const DB_NAME = 'personal-trainer-db';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<PersonalTrainerDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<PersonalTrainerDB>> {
	if (dbInstance) return dbInstance;

	dbInstance = await openDB<PersonalTrainerDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// User Profile store
			if (!db.objectStoreNames.contains('userProfile')) {
				db.createObjectStore('userProfile');
			}

			// Activities store with indexes for efficient querying
			if (!db.objectStoreNames.contains('activities')) {
				const activityStore = db.createObjectStore('activities', {
					keyPath: 'id',
				});
				activityStore.createIndex('by-date', 'date');
				activityStore.createIndex('by-type', 'type');
			}

			// Stats entries store with date index
			if (!db.objectStoreNames.contains('statsEntries')) {
				const statsEntriesStore = db.createObjectStore('statsEntries', {
					keyPath: 'id',
				});
				statsEntriesStore.createIndex('by-date', 'date');
			}

			// Remove old stats store if it exists (migration from v1)
			if ((db.objectStoreNames as DOMStringList).contains('stats')) {
				db.deleteObjectStore('stats' as 'statsEntries');
			}
		},
	});

	return dbInstance;
}

// User Profile operations
export async function loadUserProfile(): Promise<UserProfile | undefined> {
	const db = await getDB();
	return db.get('userProfile', 'user');
}

export async function saveUserProfile(userProfile: UserProfile): Promise<void> {
	const db = await getDB();
	await db.put('userProfile', userProfile, 'user');
}

// Stats entry operations - designed for large datasets
export async function loadStatsEntries(
	limit?: number,
	offset = 0,
): Promise<UserStatsEntry[]> {
	const db = await getDB();
	const tx = db.transaction('statsEntries', 'readonly');
	const index = tx.store.index('by-date');

	const entries: UserStatsEntry[] = [];
	let cursor = await index.openCursor(null, 'prev'); // newest first
	let skipped = 0;

	while (cursor) {
		if (skipped < offset) {
			skipped++;
			cursor = await cursor.continue();
			continue;
		}

		entries.push(cursor.value);

		if (limit && entries.length >= limit) {
			break;
		}

		cursor = await cursor.continue();
	}

	return entries;
}

export async function loadAllStatsEntries(): Promise<UserStatsEntry[]> {
	const db = await getDB();
	return db.getAllFromIndex('statsEntries', 'by-date');
}

export async function getStatsEntryCount(): Promise<number> {
	const db = await getDB();
	return db.count('statsEntries');
}

export async function loadStatsEntryById(
	id: string,
): Promise<UserStatsEntry | undefined> {
	const db = await getDB();
	return db.get('statsEntries', id);
}

export async function loadStatsEntryByDate(
	date: string,
): Promise<UserStatsEntry | undefined> {
	const db = await getDB();
	return db.getFromIndex('statsEntries', 'by-date', date);
}

export async function saveStatsEntry(entry: UserStatsEntry): Promise<void> {
	const db = await getDB();
	await db.put('statsEntries', entry);
}

export async function saveStatsEntries(
	entries: UserStatsEntry[],
): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('statsEntries', 'readwrite');
	await Promise.all([...entries.map((entry) => tx.store.put(entry)), tx.done]);
}

export async function deleteStatsEntry(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('statsEntries', id);
}

// Activity operations - designed for large datasets
export async function loadActivities(
	limit?: number,
	offset = 0,
): Promise<Activity[]> {
	const db = await getDB();
	const tx = db.transaction('activities', 'readonly');
	const index = tx.store.index('by-date');

	const activities: Activity[] = [];
	let cursor = await index.openCursor(null, 'prev'); // newest first
	let skipped = 0;

	while (cursor) {
		if (skipped < offset) {
			skipped++;
			cursor = await cursor.continue();
			continue;
		}

		activities.push(cursor.value);

		if (limit && activities.length >= limit) {
			break;
		}

		cursor = await cursor.continue();
	}

	return activities;
}

export async function loadAllActivities(): Promise<Activity[]> {
	const db = await getDB();
	return db.getAllFromIndex('activities', 'by-date');
}

export async function getActivityCount(): Promise<number> {
	const db = await getDB();
	return db.count('activities');
}

export async function loadActivityById(
	id: string,
): Promise<Activity | undefined> {
	const db = await getDB();
	return db.get('activities', id);
}

export async function saveActivity(activity: Activity): Promise<void> {
	const db = await getDB();
	await db.put('activities', activity);
}

export async function saveActivities(activities: Activity[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('activities', 'readwrite');
	await Promise.all([
		...activities.map((activity) => tx.store.put(activity)),
		tx.done,
	]);
}

export async function deleteActivity(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('activities', id);
}

export async function loadActivitiesByType(
	type: Activity['type'],
): Promise<Activity[]> {
	const db = await getDB();
	return db.getAllFromIndex('activities', 'by-type', type);
}
