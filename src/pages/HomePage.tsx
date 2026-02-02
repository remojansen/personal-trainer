import { RunningPaceEvolutionPanel } from '../components/RunningPaceEvolutionPanel';
import { WeightEvolutionPanel } from '../components/WeightEvolutionPanel';

export function HomePage() {
	return (
		<div className="min-h-screen bg-gray-900 py-8 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<RunningPaceEvolutionPanel />
					<WeightEvolutionPanel />
				</div>
			</div>
		</div>
	);
}
