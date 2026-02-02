import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { Activity, Stats, UserProfile } from './useUserData';

interface RaceBuddyDB extends DBSchema {
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
	stats: {
		key: 'user';
		value: Stats;
	};
}

const DB_NAME = 'race-buddy-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<RaceBuddyDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<RaceBuddyDB>> {
	if (dbInstance) return dbInstance;

	dbInstance = await openDB<RaceBuddyDB>(DB_NAME, DB_VERSION, {
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

			// Stats store
			if (!db.objectStoreNames.contains('stats')) {
				db.createObjectStore('stats');
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

// Stats operations
export async function loadStats(): Promise<Stats | undefined> {
	const db = await getDB();
	return db.get('stats', 'user');
}

export async function saveStats(stats: Stats): Promise<void> {
	const db = await getDB();
	await db.put('stats', stats, 'user');
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
