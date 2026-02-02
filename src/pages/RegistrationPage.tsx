import { useState } from 'react';
import { FaRunning } from 'react-icons/fa';
import { UserProfileForm } from '../components/UserProfileForm';
import { type UserProfile, useUserData } from '../hooks/useUserData';

export function RegistrationPage() {
	const { userProfile, setUserProfile } = useUserData();
	const [localUserProfile, setLocalUserProfile] =
		useState<UserProfile>(userProfile);

	const isFormComplete =
		localUserProfile.heightCm !== null &&
		localUserProfile.weightKg !== null &&
		localUserProfile.dateOfBirth !== null &&
		localUserProfile.sex !== null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isFormComplete) {
			setUserProfile(localUserProfile);
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 flex items-center justify-center py-8 px-4">
			<div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-purple-900 rounded-full mb-4">
						<FaRunning className="text-3xl text-purple-400" />
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">
						Welcome to Race Buddy
					</h1>
					<p className="text-gray-400">
						Let's set up your profile to get started
					</p>
				</div>

				<form onSubmit={handleSubmit}>
					<UserProfileForm
						userProfile={localUserProfile}
						onChange={setLocalUserProfile}
					/>

					<button
						type="submit"
						disabled={!isFormComplete}
						className={`w-full mt-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
							isFormComplete
								? 'bg-purple-600 text-white hover:bg-purple-700'
								: 'bg-gray-700 text-gray-500 cursor-not-allowed'
						}`}
					>
						Get Started
					</button>
				</form>
			</div>
		</div>
	);
}
