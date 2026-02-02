import { StatsChart } from '../components/StatsChart';

export function HomePage() {
	return (
		<div className="min-h-screen bg-gray-900 py-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 gap-6">
					<StatsChart />
				</div>
			</div>
		</div>
	);
}
