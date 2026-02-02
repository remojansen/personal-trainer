import { useEffect, useState } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { Schedule } from '../components/Schedule';
import { UserProfileForm } from '../components/UserProfileForm';
import type { Schedule as ScheduleType } from '../hooks/useUserData';
import { useUserData } from '../hooks/useUserData';

export function SettingsPage() {
	const { userProfile, setUserProfile, statsEntries, addStatsEntry } =
		useUserData();

	// Get the most recent weight from stats entries
	const latestWeight =
		statsEntries.length > 0 ? statsEntries[0].weightKg : null;
	const [weightKg, setWeightKg] = useState<number | null>(latestWeight);

	// Sync local weight state when stats entries load
	useEffect(() => {
		if (statsEntries.length > 0) {
			setWeightKg(statsEntries[0].weightKg);
		}
	}, [statsEntries]);

	const handleWeightChange = async (newWeight: number | null) => {
		setWeightKg(newWeight);
		if (newWeight !== null) {
			// Add a new stats entry with the updated weight
			await addStatsEntry({
				id: crypto.randomUUID(),
				date: new Date().toISOString().split('T')[0],
				weightKg: newWeight,
				bodyFatPercentage:
					statsEntries.length > 0 ? statsEntries[0].bodyFatPercentage : null,
			});
		}
	};

	const handleScheduleChange = (newSchedule: ScheduleType) => {
		setUserProfile({
			...userProfile,
			schedule: newSchedule,
		});
	};

	return (
		<div className="min-h-screen bg-gray-900 py-8">
			<div className="max-w-3xl mx-auto px-4">
				<div className="flex items-center gap-3 mb-8">
					<IoMdSettings className="text-3xl text-gray-300" />
					<h1 className="text-3xl font-bold text-white">Settings</h1>
				</div>
				<div className="bg-gray-800 rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold text-white mb-4">
						User Profile
					</h2>
					<UserProfileForm
						userProfile={userProfile}
						onChange={setUserProfile}
						weightKg={weightKg}
						onWeightChange={handleWeightChange}
					/>
				</div>

				<div className="bg-gray-800 rounded-lg shadow p-6 mt-6">
					<h2 className="text-xl font-semibold text-white mb-4">
						Training Schedule
					</h2>
					<Schedule
						schedule={userProfile.schedule}
						onChange={handleScheduleChange}
					/>
				</div>
			</div>
		</div>
	);
}
