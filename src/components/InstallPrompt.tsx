import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Button } from './Button';

export function InstallPrompt() {
	const { isInstallable, promptInstall } = usePWAInstall();
	const [dismissed, setDismissed] = useState(false);

	if (!isInstallable || dismissed) {
		return null;
	}

	const handleInstall = async () => {
		await promptInstall();
	};

	const handleDismiss = () => {
		setDismissed(true);
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 shadow-lg z-50">
			<div className="max-w-md mx-auto flex items-center justify-between gap-4">
				<div className="flex-1">
					<p className="text-white font-medium">Install Personal Trainer</p>
					<p className="text-gray-400 text-sm">
						Add to your home screen for quick access
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						color="gray"
						size="sm"
						onClick={handleDismiss}
					>
						Not now
					</Button>
					<Button color="purple" size="sm" onClick={handleInstall}>
						Install
					</Button>
				</div>
			</div>
		</div>
	);
}
