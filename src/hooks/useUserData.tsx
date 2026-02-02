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
	getActivityCount,
	loadActivities,
	loadAllActivities,
	loadStats,
	loadUserProfile,
	saveActivities,
	saveActivity,
	saveStats,
	saveUserProfile,
} from './db';

export interface UserProfile {
	heightCm: number | null;
	dateOfBirth: string | null;
	weightKg: number | null;
	sex: 'male' | 'female' | null;
}

export interface Activity {
	id: string;
	type: 'run' | 'race' | 'training';
	name: string;
	date: string;
	distance: number;
	duration: number;
	pace: number;
}

export interface Stats {
	totalDistance: number;
	totalRaces: number;
	totalActivities: number;
	averagePace: number;
	personalBest: number | null;
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

	// Stats
	stats: Stats;
	setStats: (stats: Stats) => void;
}

const DEFAULT_USER_PROFILE: UserProfile = {
	heightCm: null,
	dateOfBirth: null,
	weightKg: null,
	sex: null,
};

const DEFAULT_STATS: Stats = {
	totalDistance: 0,
	totalRaces: 0,
	totalActivities: 0,
	averagePace: 0,
	personalBest: null,
};

const ACTIVITIES_PAGE_SIZE = 50;

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
	const [stats, setStatsState] = useState<Stats>(DEFAULT_STATS);

	// Check if user has completed registration (has profile data)
	const checkIsRegistered = useCallback((profile: UserProfile) => {
		return (
			profile.heightCm !== null &&
			profile.weightKg !== null &&
			profile.dateOfBirth !== null &&
			profile.sex !== null
		);
	}, []);

	// Load initial data from IndexedDB
	useEffect(() => {
		async function loadInitialData() {
			try {
				const [savedUserProfile, savedStats, initialActivities, count] =
					await Promise.all([
						loadUserProfile(),
						loadStats(),
						loadActivities(ACTIVITIES_PAGE_SIZE, 0),
						getActivityCount(),
					]);

				if (savedUserProfile) {
					setUserProfileState(savedUserProfile);
					setIsRegistered(checkIsRegistered(savedUserProfile));
				}
				if (savedStats) setStatsState(savedStats);
				setActivitiesState(initialActivities);
				setActivityCount(count);
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

	// Stats - persist to IndexedDB
	const setStats = useCallback((newStats: Stats) => {
		setStatsState(newStats);
		saveStats(newStats).catch((error) => {
			console.error('Failed to save stats:', error);
		});
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
				stats,
				setStats,
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
