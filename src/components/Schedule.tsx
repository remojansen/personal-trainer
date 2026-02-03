import {
	ActivityType,
	type ActivityTypeKey,
	type Schedule as ScheduleType,
} from '../hooks/useUserData';

const DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ACTIVITY_LABELS: Record<ActivityTypeKey, string> = {
	[ActivityType.RoadRun]: 'Road Run',
	[ActivityType.TreadmillRun]: 'Treadmill Run',
	[ActivityType.PoolSwim]: 'Pool Swim',
	[ActivityType.SeaSwim]: 'Sea Swim',
	[ActivityType.RoadCycle]: 'Road Cycle',
	[ActivityType.IndoorCycle]: 'Indoor Cycle',
	[ActivityType.StrengthTrainingLegs]: 'Strength: Legs',
	[ActivityType.StrengthTrainingArms]: 'Strength: Arms',
	[ActivityType.StrengthTrainingCore]: 'Strength: Core',
	[ActivityType.StrengthTrainingShoulders]: 'Strength: Shoulders',
	[ActivityType.StrengthTrainingBack]: 'Strength: Back',
	[ActivityType.StrengthTrainingChest]: 'Strength: Chest',
};

interface ScheduleProps {
	schedule: ScheduleType;
	onChange: (schedule: ScheduleType) => void;
}

export function Schedule({ schedule, onChange }: ScheduleProps) {
	const toggleActivity = (
		day: (typeof DAYS)[number],
		activity: ActivityTypeKey,
	) => {
		const dayActivities = schedule[day];
		const isActive = dayActivities.includes(activity);

		const newDayActivities = isActive
			? dayActivities.filter((a) => a !== activity)
			: [...dayActivities, activity];

		onChange({
			...schedule,
			[day]: newDayActivities,
		});
	};

	const isActive = (
		day: (typeof DAYS)[number],
		activity: ActivityTypeKey,
	): boolean => {
		return schedule[day].includes(activity);
	};

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse">
				<thead>
					<tr>
						<th className="text-left text-xs font-medium text-gray-400 pb-2 pr-2">
							Activity
						</th>
						{DAY_LABELS.map((day) => (
							<th
								key={day}
								className="text-center text-xs font-medium text-gray-400 pb-2 px-0.5"
							>
								{day}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Object.values(ActivityType).map((activity) => (
						<tr key={activity} className="border-t border-gray-800">
							<td className="py-1.5 pr-2 text-xs text-gray-300 whitespace-nowrap">
								{ACTIVITY_LABELS[activity]}
							</td>
							{DAYS.map((day) => (
								<td key={day} className="py-1.5 px-0.5 text-center">
									<button
										type="button"
										onClick={() => toggleActivity(day, activity)}
										className={`w-7 h-6 rounded text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
											isActive(day, activity)
												? 'bg-green-600 hover:bg-green-700 text-white'
												: 'bg-red-600 hover:bg-red-700 text-white'
										}`}
										aria-label={`${isActive(day, activity) ? 'Disable' : 'Enable'} ${ACTIVITY_LABELS[activity]} on ${day}`}
									>
										{isActive(day, activity) ? 'YES' : 'NO'}
									</button>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
