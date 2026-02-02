import type { UserProfile } from '../hooks/useUserData';

interface UserProfileFormProps {
	userProfile: UserProfile;
	onChange: (userProfile: UserProfile) => void;
}

export function UserProfileForm({
	userProfile,
	onChange,
}: UserProfileFormProps) {
	return (
		<div className="space-y-6">
			<div>
				<label
					htmlFor="heightCm"
					className="block text-sm font-medium text-gray-300 mb-2"
				>
					Height (cm)
				</label>
				<input
					type="number"
					id="heightCm"
					value={userProfile.heightCm ?? ''}
					onChange={(e) =>
						onChange({
							...userProfile,
							heightCm: e.target.value ? Number(e.target.value) : null,
						})
					}
					className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg text-white placeholder-gray-400"
					placeholder="175"
					min="50"
					max="250"
				/>
			</div>

			<div>
				<label
					htmlFor="weightKg"
					className="block text-sm font-medium text-gray-300 mb-2"
				>
					Weight (kg)
				</label>
				<input
					type="number"
					id="weightKg"
					value={userProfile.weightKg ?? ''}
					onChange={(e) =>
						onChange({
							...userProfile,
							weightKg: e.target.value ? Number(e.target.value) : null,
						})
					}
					className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg text-white placeholder-gray-400"
					placeholder="70"
					min="20"
					max="300"
					step="0.1"
				/>
			</div>

			<div>
				<label
					htmlFor="dateOfBirth"
					className="block text-sm font-medium text-gray-300 mb-2"
				>
					Date of Birth
				</label>
				<input
					type="date"
					id="dateOfBirth"
					value={userProfile.dateOfBirth ?? ''}
					onChange={(e) =>
						onChange({
							...userProfile,
							dateOfBirth: e.target.value || null,
						})
					}
					className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg text-white"
				/>
			</div>

			<div>
				<span className="block text-sm font-medium text-gray-300 mb-2">
					Sex
				</span>
				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => onChange({ ...userProfile, sex: 'male' })}
						className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
							userProfile.sex === 'male'
								? 'bg-purple-600 text-white'
								: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
						}`}
					>
						Male
					</button>
					<button
						type="button"
						onClick={() => onChange({ ...userProfile, sex: 'female' })}
						className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
							userProfile.sex === 'female'
								? 'bg-purple-600 text-white'
								: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
						}`}
					>
						Female
					</button>
				</div>
			</div>
		</div>
	);
}
