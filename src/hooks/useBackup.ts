import { useCallback, useEffect, useState } from 'react';
import {
	getDB,
	loadAllActivities,
	loadAllDietEntries,
	loadAllStatsEntries,
	loadUserProfile,
	saveActivities,
	saveDietEntries,
	saveStatsEntries,
	saveUserProfile,
} from './db';
import type {
	Activity,
	DietEntry,
	UserProfile,
	UserStatsEntry,
} from './useUserData';

const BACKUP_FILENAME = 'race-buddy-backup.json';
const LOCAL_MODIFIED_KEY = 'race-buddy-last-modified';

export interface BackupData {
	version: number;
	lastModified: string;
	data: {
		userProfile: UserProfile | undefined;
		activities: Activity[];
		statsEntries: UserStatsEntry[];
		dietEntries: DietEntry[];
	};
}

interface BackupState {
	isSupported: boolean;
	hasFolderAccess: boolean;
	folderName: string | null;
	lastBackupDate: string | null;
	isLoading: boolean;
	error: string | null;
	syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

interface UseBackupReturn extends BackupState {
	selectBackupFolder: () => Promise<void>;
	removeBackupFolder: () => Promise<void>;
	manualBackup: () => Promise<void>;
	manualRestore: () => Promise<void>;
	syncBackup: () => Promise<void>;
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
	return 'showDirectoryPicker' in window;
}

// Store the folder handle in IndexedDB
async function storeFolderHandle(
	handle: FileSystemDirectoryHandle,
): Promise<void> {
	const db = await getDB();
	await db.put('backupFolderHandle', handle, 'handle');
}

// Get the stored folder handle from IndexedDB
async function getStoredFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
	const db = await getDB();
	const handle = await db.get('backupFolderHandle', 'handle');
	return handle || null;
}

// Remove the stored folder handle
async function removeStoredFolderHandle(): Promise<void> {
	const db = await getDB();
	await db.delete('backupFolderHandle', 'handle');
}

// Get local last modified timestamp
function getLocalLastModified(): string | null {
	return localStorage.getItem(LOCAL_MODIFIED_KEY);
}

// Set local last modified timestamp
function setLocalLastModified(timestamp: string): void {
	localStorage.setItem(LOCAL_MODIFIED_KEY, timestamp);
}

// Export all IndexedDB data
async function exportAllData(): Promise<BackupData['data']> {
	const [userProfile, activities, statsEntries, dietEntries] =
		await Promise.all([
			loadUserProfile(),
			loadAllActivities(),
			loadAllStatsEntries(),
			loadAllDietEntries(),
		]);

	return {
		userProfile,
		activities,
		statsEntries,
		dietEntries,
	};
}

// Import all data to IndexedDB
async function importAllData(data: BackupData['data']): Promise<void> {
	const promises: Promise<void>[] = [];

	if (data.userProfile) {
		promises.push(saveUserProfile(data.userProfile));
	}

	if (data.activities && data.activities.length > 0) {
		promises.push(saveActivities(data.activities));
	}

	if (data.statsEntries && data.statsEntries.length > 0) {
		promises.push(saveStatsEntries(data.statsEntries));
	}

	if (data.dietEntries && data.dietEntries.length > 0) {
		promises.push(saveDietEntries(data.dietEntries));
	}

	await Promise.all(promises);
}

// Read backup file from folder
async function readBackupFile(
	folderHandle: FileSystemDirectoryHandle,
): Promise<BackupData | null> {
	try {
		const fileHandle = await folderHandle.getFileHandle(BACKUP_FILENAME);
		const file = await fileHandle.getFile();
		const content = await file.text();
		return JSON.parse(content) as BackupData;
	} catch {
		// File doesn't exist or can't be read
		return null;
	}
}

// Write backup file to folder
async function writeBackupFile(
	folderHandle: FileSystemDirectoryHandle,
	data: BackupData,
): Promise<void> {
	const fileHandle = await folderHandle.getFileHandle(BACKUP_FILENAME, {
		create: true,
	});
	const writable = await fileHandle.createWritable();
	await writable.write(JSON.stringify(data, null, 2));
	await writable.close();
}

export function useBackup(onDataRestored?: () => void): UseBackupReturn {
	const [state, setState] = useState<BackupState>({
		isSupported: isFileSystemAccessSupported(),
		hasFolderAccess: false,
		folderName: null,
		lastBackupDate: null,
		isLoading: true,
		error: null,
		syncStatus: 'idle',
	});

	const [folderHandle, setFolderHandle] =
		useState<FileSystemDirectoryHandle | null>(null);

	// Guard to prevent concurrent sync operations
	const [isSyncing, setIsSyncing] = useState(false);

	// Initialize - check for stored folder handle
	useEffect(() => {
		async function init() {
			if (!isFileSystemAccessSupported()) {
				setState((prev) => ({ ...prev, isLoading: false }));
				return;
			}

			try {
				const storedHandle = await getStoredFolderHandle();
				if (storedHandle) {
					// Verify we still have permission
					const permission = await storedHandle.queryPermission({
						mode: 'readwrite',
					});
					if (permission === 'granted') {
						setFolderHandle(storedHandle);

						// Read the backup file to get the last backup date
						const backup = await readBackupFile(storedHandle);
						const lastBackupDate = backup?.lastModified || null;

						setState((prev) => ({
							...prev,
							hasFolderAccess: true,
							folderName: storedHandle.name,
							lastBackupDate,
							isLoading: false,
						}));
						return;
					}
				}
			} catch (e) {
				console.warn('Failed to restore folder handle:', e);
			}

			setState((prev) => ({ ...prev, isLoading: false }));
		}

		init();
	}, []);

	// Perform backup
	const performBackup = useCallback(
		async (handle: FileSystemDirectoryHandle) => {
			const now = new Date().toISOString();
			const data = await exportAllData();

			const backupData: BackupData = {
				version: 1,
				lastModified: now,
				data,
			};

			await writeBackupFile(handle, backupData);
			setLocalLastModified(now);

			setState((prev) => ({
				...prev,
				lastBackupDate: now,
				syncStatus: 'synced',
			}));
		},
		[],
	);

	// Select backup folder
	const selectBackupFolder = useCallback(async () => {
		if (!isFileSystemAccessSupported()) {
			setState((prev) => ({
				...prev,
				error: 'File System Access API is not supported in this browser',
			}));
			return;
		}

		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			const handle = await window.showDirectoryPicker({
				mode: 'readwrite',
				startIn: 'documents',
			});

			await storeFolderHandle(handle);
			setFolderHandle(handle);

			setState((prev) => ({
				...prev,
				hasFolderAccess: true,
				folderName: handle.name,
				isLoading: false,
			}));

			// Check if backup file exists and sync
			const existingBackup = await readBackupFile(handle);
			const localLastModified = getLocalLastModified();

			if (existingBackup) {
				const backupTime = new Date(existingBackup.lastModified).getTime();
				const localTime = localLastModified
					? new Date(localLastModified).getTime()
					: 0;

				// If timestamps are equal, already synced - do nothing
				if (backupTime === localTime) {
					setState((prev) => ({
						...prev,
						lastBackupDate: existingBackup.lastModified,
						syncStatus: 'synced',
					}));
					return;
				}

				// If backup is newer, restore from backup
				if (backupTime > localTime) {
					setState((prev) => ({ ...prev, syncStatus: 'syncing' }));
					await importAllData(existingBackup.data);
					setLocalLastModified(existingBackup.lastModified);
					setState((prev) => ({
						...prev,
						lastBackupDate: existingBackup.lastModified,
						syncStatus: 'synced',
					}));
					onDataRestored?.();
					return;
				}

				// Local is newer - backup local data
				await performBackup(handle);
				return;
			}

			// No backup exists - create initial backup
			await performBackup(handle);
		} catch (e) {
			if ((e as Error).name === 'AbortError') {
				// User cancelled
				setState((prev) => ({ ...prev, isLoading: false }));
				return;
			}
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: `Failed to select folder: ${(e as Error).message}`,
			}));
		}
	}, [onDataRestored, performBackup]);

	// Remove backup folder
	const removeBackupFolder = useCallback(async () => {
		try {
			await removeStoredFolderHandle();
			setFolderHandle(null);
			setState((prev) => ({
				...prev,
				hasFolderAccess: false,
				folderName: null,
				lastBackupDate: null,
				error: null,
			}));
		} catch (e) {
			setState((prev) => ({
				...prev,
				error: `Failed to remove folder: ${(e as Error).message}`,
			}));
		}
	}, []);

	// Manual backup
	const manualBackup = useCallback(async () => {
		if (!folderHandle) {
			setState((prev) => ({ ...prev, error: 'No backup folder selected' }));
			return;
		}

		try {
			setState((prev) => ({ ...prev, syncStatus: 'syncing', error: null }));
			await performBackup(folderHandle);
		} catch (e) {
			setState((prev) => ({
				...prev,
				syncStatus: 'error',
				error: `Backup failed: ${(e as Error).message}`,
			}));
		}
	}, [folderHandle, performBackup]);

	// Manual restore
	const manualRestore = useCallback(async () => {
		if (!folderHandle) {
			setState((prev) => ({ ...prev, error: 'No backup folder selected' }));
			return;
		}

		try {
			setState((prev) => ({ ...prev, syncStatus: 'syncing', error: null }));

			const backup = await readBackupFile(folderHandle);
			if (!backup) {
				setState((prev) => ({
					...prev,
					syncStatus: 'error',
					error: 'No backup file found',
				}));
				return;
			}

			await importAllData(backup.data);
			setLocalLastModified(backup.lastModified);
			setState((prev) => ({
				...prev,
				lastBackupDate: backup.lastModified,
				syncStatus: 'synced',
			}));
			onDataRestored?.();
		} catch (e) {
			setState((prev) => ({
				...prev,
				syncStatus: 'error',
				error: `Restore failed: ${(e as Error).message}`,
			}));
		}
	}, [folderHandle, onDataRestored]);

	// Sync backup (auto-sync logic)
	const syncBackup = useCallback(async () => {
		if (!folderHandle || isSyncing) return;

		try {
			setIsSyncing(true);

			// Verify permission is still granted
			const permission = await folderHandle.queryPermission({
				mode: 'readwrite',
			});
			if (permission !== 'granted') {
				// Try to request permission
				const newPermission = await folderHandle.requestPermission({
					mode: 'readwrite',
				});
				if (newPermission !== 'granted') {
					setState((prev) => ({
						...prev,
						hasFolderAccess: false,
						error: 'Permission to backup folder was revoked',
					}));
					setIsSyncing(false);
					return;
				}
			}

			setState((prev) => ({ ...prev, syncStatus: 'syncing', error: null }));

			const backup = await readBackupFile(folderHandle);
			const localLastModified = getLocalLastModified();

			if (backup) {
				const backupTime = new Date(backup.lastModified).getTime();
				const localTime = localLastModified
					? new Date(localLastModified).getTime()
					: 0;

				// If timestamps are equal, already synced - do nothing
				if (backupTime === localTime) {
					setState((prev) => ({
						...prev,
						lastBackupDate: backup.lastModified,
						syncStatus: 'synced',
					}));
					setIsSyncing(false);
					return;
				}

				if (backupTime > localTime) {
					// Backup is newer - restore from backup
					await importAllData(backup.data);
					setLocalLastModified(backup.lastModified);
					setState((prev) => ({
						...prev,
						lastBackupDate: backup.lastModified,
						syncStatus: 'synced',
					}));
					setIsSyncing(false);
					onDataRestored?.();
					return;
				}

				// Local is newer - backup local data
				await performBackup(folderHandle);
				setIsSyncing(false);
				return;
			}

			// No backup exists - create backup
			await performBackup(folderHandle);
			setIsSyncing(false);
		} catch (e) {
			console.error('Sync failed:', e);
			setState((prev) => ({
				...prev,
				syncStatus: 'error',
				error: `Sync failed: ${(e as Error).message}`,
			}));
			setIsSyncing(false);
		}
	}, [folderHandle, isSyncing, performBackup, onDataRestored]);

	return {
		...state,
		selectBackupFolder,
		removeBackupFolder,
		manualBackup,
		manualRestore,
		syncBackup,
	};
}

// Update local modified timestamp (call this after any data change)
export function updateLocalModified(): void {
	setLocalLastModified(new Date().toISOString());
}
