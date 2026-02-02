import { Panel } from '../components/Panel';

export function HomePage() {
	return (
		<div className="min-h-screen bg-gray-900 py-8 px-4">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Panel title="Overview">
						<p className="text-gray-300">Welcome to Race Buddy!</p>
					</Panel>
					<Panel title="Recent Activity">
						<p className="text-gray-300">No recent activity yet.</p>
					</Panel>
					<Panel title="Upcoming Races">
						<p className="text-gray-300">No upcoming races scheduled.</p>
					</Panel>
					<Panel title="Training Stats">
						<p className="text-gray-300">Start training to see your stats.</p>
					</Panel>
					<Panel title="Goals">
						<p className="text-gray-300">Set your racing goals here.</p>
					</Panel>
					<Panel title="Performance">
						<p className="text-gray-300">Track your performance over time.</p>
					</Panel>
				</div>
			</div>
		</div>
	);
}
