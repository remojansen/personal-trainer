import { IoMdSettings } from 'react-icons/io';
import { UserProfileForm } from '../components/UserProfileForm';
import { useUserData } from '../hooks/useUserData';

export function SettingsPage() {
	const { userProfile, setUserProfile } = useUserData();

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
					/>
				</div>
			</div>
		</div>
	);
}
