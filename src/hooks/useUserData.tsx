import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import {
	deleteActivity as deleteActivityFromDB,
	deleteStatsEntry as deleteStatsEntryFromDB,
	getActivityCount,
	getStatsEntryCount,
	loadActivities,
	loadAllActivities,
	loadAllStatsEntries,
	loadStatsEntries,
	loadStatsEntryByDate,
	loadUserProfile,
	saveActivities,
	saveActivity,
	saveStatsEntries,
	saveStatsEntry,
	saveUserProfile,
} from './db';

export interface UserProfile {
	heightCm: number | null;
	dateOfBirth: string | null;
	sex: 'male' | 'female' | null;
	targetWeightKg: number | null;
	targetDate: string | null;
	schedule: Schedule;
}

export const ActivityType = {
	RoadRun: 'RoadRun',
	TreadmillRun: 'TreadmillRun',
	PoolSwim: 'PoolSwim',
	SeaSwim: 'SeaSwim',
	RoadCycle: 'RoadCycle',
	IndoorCycle: 'IndoorCycle',
	StrengthTrainingLegs: 'StrengthTrainingLegs',
	StrengthTrainingArms: 'StrengthTrainingArms',
	StrengthTrainingCore: 'StrengthTrainingCore',
	StrengthTrainingShoulders: 'StrengthTrainingShoulders',
	StrengthTrainingBack: 'StrengthTrainingBack'
} as const;

export type ActivityTypeKey = typeof ActivityType[keyof typeof ActivityType];

export interface Schedule {
	monday: ActivityTypeKey[];
	tuesday: ActivityTypeKey[];
	wednesday: ActivityTypeKey[];
	thursday: ActivityTypeKey[];
	friday: ActivityTypeKey[];
	saturday: ActivityTypeKey[];
	sunday: ActivityTypeKey[];
}

export interface Activity {
	id: string;
	type: ActivityTypeKey;
	date: string;
	distanceInKm: number;
	durationInSeconds: number;
}

export interface UserStatsEntry {
	id: string;
	date: string;
	weightKg: number;
	bodyFatPercentage: number | null;
}

interface UserData {
	// Loading state
	isLoading: boolean;

	// Registration state
	isRegistered: boolean;

	// User Profile
	userProfile: UserProfile;
	setUserProfile: (userProfile: UserProfile) => void;

	// Activities - paginated for large datasets
	activities: Activity[];
	activityCount: number;
	loadMoreActivities: (limit?: number) => Promise<void>;
	loadAllUserActivities: () => Promise<Activity[]>;
	addActivity: (activity: Activity) => Promise<void>;
	updateActivities: (activities: Activity[]) => Promise<void>;
	deleteActivity: (id: string) => Promise<void>;

	// Stats entries - paginated for large datasets
	statsEntries: UserStatsEntry[];
	statsEntryCount: number;
	loadMoreStatsEntries: (limit?: number) => Promise<void>;
	loadAllUserStatsEntries: () => Promise<UserStatsEntry[]>;
	addStatsEntry: (entry: UserStatsEntry) => Promise<void>;
	updateStatsEntries: (entries: UserStatsEntry[]) => Promise<void>;
	deleteStatsEntry: (id: string) => Promise<void>;
}

const DEFAULT_SCHEDULE: Schedule = {
	monday: [],
	tuesday: [],
	wednesday: [],
	thursday: [],
	friday: [],
	saturday: [],
	sunday: [],
};

const DEFAULT_USER_PROFILE: UserProfile = {
	heightCm: null,
	dateOfBirth: null,
	sex: null,
	targetWeightKg: null,
	targetDate: null,
	schedule: DEFAULT_SCHEDULE,
};

const ACTIVITIES_PAGE_SIZE = 50;
const STATS_ENTRIES_PAGE_SIZE = 50;

const UserDataContext = createContext<UserData | undefined>(undefined);

interface UserDataProviderProps {
	children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [isRegistered, setIsRegistered] = useState(false);
	const [userProfile, setUserProfileState] =
		useState<UserProfile>(DEFAULT_USER_PROFILE);
	const [activities, setActivitiesState] = useState<Activity[]>([]);
	const [activityCount, setActivityCount] = useState(0);
	const [statsEntries, setStatsEntriesState] = useState<UserStatsEntry[]>([]);
	const [statsEntryCount, setStatsEntryCount] = useState(0);

	// Check if user has completed registration (has profile data)
	const checkIsRegistered = useCallback((profile: UserProfile) => {
		return (
			profile.heightCm !== null &&
			profile.dateOfBirth !== null &&
			profile.sex !== null
		);
	}, []);

	// Load initial data from IndexedDB
	useEffect(() => {
		async function loadInitialData() {
			try {
				const [
					savedUserProfile,
					initialActivities,
					activityCountResult,
					initialStatsEntries,
					statsEntryCountResult,
				] = await Promise.all([
					loadUserProfile(),
					loadActivities(ACTIVITIES_PAGE_SIZE, 0),
					getActivityCount(),
					loadStatsEntries(STATS_ENTRIES_PAGE_SIZE, 0),
					getStatsEntryCount(),
				]);

				if (savedUserProfile) {
					setUserProfileState(savedUserProfile);
					setIsRegistered(checkIsRegistered(savedUserProfile));
				}
				setActivitiesState(initialActivities);
				setActivityCount(activityCountResult);
				setStatsEntriesState(initialStatsEntries);
				setStatsEntryCount(statsEntryCountResult);
			} catch (error) {
				console.error('Failed to load data from IndexedDB:', error);
			} finally {
				setIsLoading(false);
			}
		}

		loadInitialData();
	}, [checkIsRegistered]);

	// User Profile - persist to IndexedDB
	const setUserProfile = useCallback(
		(newUserProfile: UserProfile) => {
			setUserProfileState(newUserProfile);
			setIsRegistered(checkIsRegistered(newUserProfile));
			saveUserProfile(newUserProfile).catch((error) => {
				console.error('Failed to save user profile:', error);
			});
		},
		[checkIsRegistered],
	);

	// Load more stats entries (pagination)
	const loadMoreStatsEntries = useCallback(
		async (limit = STATS_ENTRIES_PAGE_SIZE) => {
			const moreEntries = await loadStatsEntries(limit, statsEntries.length);
			setStatsEntriesState((prev) => [...prev, ...moreEntries]);
		},
		[statsEntries.length],
	);

	// Load all stats entries (use sparingly for large datasets)
	const loadAllUserStatsEntries = useCallback(async () => {
		return loadAllStatsEntries();
	}, []);

	// Add single stats entry (or update if entry for date already exists)
	const addStatsEntry = useCallback(async (entry: UserStatsEntry) => {
		const existingEntry = await loadStatsEntryByDate(entry.date);
		if (existingEntry) {
			// Update existing entry, keeping the original id
			const updatedEntry = { ...entry, id: existingEntry.id };
			await saveStatsEntry(updatedEntry);
			setStatsEntriesState((prev) =>
				prev.map((e) => (e.id === existingEntry.id ? updatedEntry : e)),
			);
		} else {
			await saveStatsEntry(entry);
			setStatsEntriesState((prev) => [entry, ...prev]); // newest first
			setStatsEntryCount((prev) => prev + 1);
		}
	}, []);

	// Bulk update stats entries
	const updateStatsEntries = useCallback(
		async (newEntries: UserStatsEntry[]) => {
			await saveStatsEntries(newEntries);
			// Reload entries to ensure consistency
			const [reloadedEntries, count] = await Promise.all([
				loadStatsEntries(STATS_ENTRIES_PAGE_SIZE, 0),
				getStatsEntryCount(),
			]);
			setStatsEntriesState(reloadedEntries);
			setStatsEntryCount(count);
		},
		[],
	);

	// Delete stats entry
	const deleteStatsEntry = useCallback(async (id: string) => {
		await deleteStatsEntryFromDB(id);
		setStatsEntriesState((prev) => prev.filter((e) => e.id !== id));
		setStatsEntryCount((prev) => prev - 1);
	}, []);

	// Load more activities (pagination)
	const loadMoreActivities = useCallback(
		async (limit = ACTIVITIES_PAGE_SIZE) => {
			const moreActivities = await loadActivities(limit, activities.length);
			setActivitiesState((prev) => [...prev, ...moreActivities]);
		},
		[activities.length],
	);

	// Load all activities (use sparingly for large datasets)
	const loadAllUserActivities = useCallback(async () => {
		return loadAllActivities();
	}, []);

	// Add single activity
	const addActivity = useCallback(async (activity: Activity) => {
		await saveActivity(activity);
		setActivitiesState((prev) => [activity, ...prev]); // newest first
		setActivityCount((prev) => prev + 1);
	}, []);

	// Bulk update activities
	const updateActivities = useCallback(async (newActivities: Activity[]) => {
		await saveActivities(newActivities);
		// Reload activities to ensure consistency
		const [reloadedActivities, count] = await Promise.all([
			loadActivities(ACTIVITIES_PAGE_SIZE, 0),
			getActivityCount(),
		]);
		setActivitiesState(reloadedActivities);
		setActivityCount(count);
	}, []);

	// Delete activity
	const deleteActivity = useCallback(async (id: string) => {
		await deleteActivityFromDB(id);
		setActivitiesState((prev) => prev.filter((a) => a.id !== id));
		setActivityCount((prev) => prev - 1);
	}, []);

	return (
		<UserDataContext.Provider
			value={{
				isLoading,
				isRegistered,
				userProfile,
				setUserProfile,
				activities,
				activityCount,
				loadMoreActivities,
				loadAllUserActivities,
				addActivity,
				updateActivities,
				deleteActivity,
				statsEntries,
				statsEntryCount,
				loadMoreStatsEntries,
				loadAllUserStatsEntries,
				addStatsEntry,
				updateStatsEntries,
				deleteStatsEntry,
			}}
		>
			{children}
		</UserDataContext.Provider>
	);
}

export function useUserData(): UserData {
	const context = useContext(UserDataContext);
	if (context === undefined) {
		throw new Error('useUserData must be used within a UserDataProvider');
	}
	return context;
}
