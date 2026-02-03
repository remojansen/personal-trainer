import { Dropdown, type DropdownOption } from './Dropdown';

export type TimeRange = '1month' | '3months' | '6months' | '1year' | 'all';

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
	'1month': '1 Month',
	'3months': '3 Months',
	'6months': '1/2 Year',
	'1year': '1 Year',
	all: 'All',
};

export const TIME_RANGE_OPTIONS: DropdownOption<TimeRange>[] = (
	Object.keys(TIME_RANGE_LABELS) as TimeRange[]
).map((range) => ({
	value: range,
	label: TIME_RANGE_LABELS[range],
}));

export function getDaysForTimeRange(range: TimeRange): number {
	switch (range) {
		case '1month':
			return 30;
		case '3months':
			return 90;
		case '6months':
			return 180;
		case '1year':
			return 365;
		case 'all':
			return 10000; // Large number to get all data
	}
}

interface TimeframeFilterProps {
	value: TimeRange;
	onChange: (value: TimeRange) => void;
	disabled?: boolean;
	className?: string;
}

export function TimeframeFilter({
	value,
	onChange,
	disabled = false,
	className = '',
}: TimeframeFilterProps) {
	return (
		<Dropdown<TimeRange>
			options={TIME_RANGE_OPTIONS}
			value={value}
			onChange={onChange}
			disabled={disabled}
			className={className}
		/>
	);
}
