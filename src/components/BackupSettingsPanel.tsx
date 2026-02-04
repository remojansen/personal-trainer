import { useCallback } from 'react';
import { useBackup } from '../hooks/useBackup';

interface BackupSettingsPanelProps {
	onDataRestored?: () => void;
}

export function BackupSettingsPanel({
	onDataRestored,
}: BackupSettingsPanelProps) {
	const {
		isSupported,
		isMobile,
		hasFolderAccess,
		folderName,
		lastBackupDate,
		isLoading,
		error,
		syncStatus,
		selectBackupFolder,
		removeBackupFolder,
		manualBackup,
		manualRestore,
	} = useBackup(onDataRestored);

	const formatDate = useCallback((dateString: string | null) => {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}, []);

	const getSyncStatusText = () => {
		switch (syncStatus) {
			case 'syncing':
				return 'Syncing...';
			case 'synced':
				return 'Synced';
			case 'error':
				return 'Sync error';
			default:
				return '';
		}
	};

	const getSyncStatusColor = () => {
		switch (syncStatus) {
			case 'syncing':
				return 'text-yellow-400';
			case 'synced':
				return 'text-green-400';
			case 'error':
				return 'text-red-400';
			default:
				return 'text-gray-400';
		}
	};

	if (!isSupported) {
		return (
			<div className="bg-gray-800 rounded-lg p-4">
				<h3 className="text-lg font-medium text-white mb-2">Cloud Backup</h3>
				<p className="text-gray-400 text-sm">
					Cloud backup isn't available in this browser. Please use Chrome, Edge,
					or another Chromium-based browser on a computer for backup support.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-medium text-white mb-2">Cloud Backup</h3>
				<p className="text-gray-400 text-sm mb-4">
					Select a cloud-synced folder (Google Drive, Dropbox, iCloud, or
					OneDrive) to automatically back up your data. Your data will sync
					across devices through your cloud provider.
				</p>
			</div>

			{error && (
				<div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
					<p className="text-red-300 text-sm">{error}</p>
				</div>
			)}

			{isMobile && !hasFolderAccess && (
				<div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3">
					<p className="text-yellow-300 text-sm">
						<strong>Heads up:</strong> Backup may not work on phones or tablets.
						If you run into issues, try setting up backup from a computer
						instead.
					</p>
				</div>
			)}

			{!hasFolderAccess ? (
				<div className="bg-gray-800 rounded-lg p-4">
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0">
							<svg
								className="w-8 h-8 text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Cloud icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h4 className="text-white font-medium mb-1">
								Set Up Cloud Backup
							</h4>
							<p className="text-gray-400 text-sm mb-3">
								Choose a folder that's synced to the cloud (like Google Drive,
								Dropbox, iCloud Drive, or OneDrive folder) to enable automatic
								backups.
							</p>
							<button
								type="button"
								onClick={selectBackupFolder}
								disabled={isLoading}
								className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
							>
								{isLoading ? 'Selecting...' : 'Select Backup Folder'}
							</button>
						</div>
					</div>

					<div className="mt-4 pt-4 border-t border-gray-700">
						<h5 className="text-gray-300 text-sm font-medium mb-2">
							Recommended Cloud Folders:
						</h5>
						<ul className="text-gray-400 text-sm space-y-1">
							<li className="flex items-center gap-2">
								<span className="text-blue-400">•</span>
								<strong>Google Drive:</strong> ~/Google Drive/ or ~/My Drive/
							</li>
							<li className="flex items-center gap-2">
								<span className="text-blue-400">•</span>
								<strong>Dropbox:</strong> ~/Dropbox/
							</li>
							<li className="flex items-center gap-2">
								<span className="text-blue-400">•</span>
								<strong>iCloud:</strong> ~/Library/Mobile Documents/
							</li>
							<li className="flex items-center gap-2">
								<span className="text-blue-400">•</span>
								<strong>OneDrive:</strong> ~/OneDrive/
							</li>
						</ul>
					</div>
				</div>
			) : (
				<div className="bg-gray-800 rounded-lg p-4 space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
								<svg
									className="w-5 h-5 text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Checkmark icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<div>
								<h4 className="text-white font-medium">Backup Active</h4>
								<p className="text-gray-400 text-sm">
									Folder: <span className="text-gray-300">{folderName}</span>
								</p>
							</div>
						</div>
						{syncStatus !== 'idle' && (
							<span className={`text-sm ${getSyncStatusColor()}`}>
								{getSyncStatusText()}
							</span>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4 pt-2">
						<div>
							<p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
								Last Backup
							</p>
							<p className="text-gray-300 text-sm">
								{formatDate(lastBackupDate)}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-2 pt-2">
						<button
							type="button"
							onClick={manualBackup}
							disabled={isLoading || syncStatus === 'syncing'}
							className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
						>
							{syncStatus === 'syncing' ? 'Backing up...' : 'Backup Now'}
						</button>
						<button
							type="button"
							onClick={manualRestore}
							disabled={isLoading || syncStatus === 'syncing'}
							className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
						>
							Restore from Backup
						</button>
						<button
							type="button"
							onClick={removeBackupFolder}
							disabled={isLoading}
							className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
						>
							Remove
						</button>
					</div>

					<p className="text-gray-500 text-xs pt-2">
						Data is automatically synced when you open the app. The most recent
						version (local or backup) is always used.
					</p>
				</div>
			)}
		</div>
	);
}
