import { useCallback, useEffect, useState } from 'react';
import { BackupSettingsPanel } from '../components/BackupSettingsPanel';
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

	// Reload page when data is restored from backup
	const handleDataRestored = useCallback(() => {
		window.location.reload();
	}, []);

	return (
		<div className="min-h-screen bg-gray-950 py-8">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-gray-900 rounded-lg shadow p-6">
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

				<div className="bg-gray-900 rounded-lg shadow p-6 mt-6">
					<h2 className="text-xl font-semibold text-white mb-4">
						Training Schedule
					</h2>
					<Schedule
						schedule={userProfile.schedule}
						onChange={handleScheduleChange}
					/>
				</div>

				<div className="bg-gray-900 rounded-lg shadow p-6 mt-6">
					<h2 className="text-xl font-semibold text-white mb-4">
						Notifications
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-white font-medium">
									Calorie Intake Reminders
								</p>
								<p className="text-sm text-gray-400">
									Remind me to log breakfast, lunch, and dinner
								</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={userProfile.calorieReminderEnabled !== false}
								onClick={() =>
									setUserProfile({
										...userProfile,
										calorieReminderEnabled:
											userProfile.calorieReminderEnabled === false,
									})
								}
								className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
									userProfile.calorieReminderEnabled !== false
										? 'bg-purple-600'
										: 'bg-gray-600'
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										userProfile.calorieReminderEnabled !== false
											? 'translate-x-5'
											: 'translate-x-0'
									}`}
								/>
							</button>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-white font-medium">
									Weight Logging Reminders
								</p>
								<p className="text-sm text-gray-400">
									Remind me to log my weight every 7 days
								</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={userProfile.weightReminderEnabled !== false}
								onClick={() =>
									setUserProfile({
										...userProfile,
										weightReminderEnabled:
											userProfile.weightReminderEnabled === false,
									})
								}
								className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
									userProfile.weightReminderEnabled !== false
										? 'bg-purple-600'
										: 'bg-gray-600'
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										userProfile.weightReminderEnabled !== false
											? 'translate-x-5'
											: 'translate-x-0'
									}`}
								/>
							</button>
						</div>
					</div>
				</div>

				<div className="bg-gray-900 rounded-lg shadow p-6 mt-6">
					<h2 className="text-xl font-semibold text-white mb-4">
						Backup & Sync
					</h2>
					<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
						<div className="flex items-start gap-3">
							<span className="text-xl">💡</span>
							<p className="text-sm text-gray-400">
								<span className="text-gray-300 font-medium">Tip:</span> Your
								data is only stored on this device. Remember to back it up
								periodically using the cloud sync feature below.
							</p>
						</div>
					</div>
					<BackupSettingsPanel onDataRestored={handleDataRestored} />
				</div>
			</div>
		</div>
	);
}
