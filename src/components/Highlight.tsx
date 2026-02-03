interface HighlightProps {
	value: string | number;
	label: string;
	valueClassName?: string;
}

export function Highlight({
	value,
	label,
	valueClassName = 'text-white',
}: HighlightProps) {
	return (
		<div>
			<div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
			<div className="text-xs text-gray-400">{label}</div>
		</div>
	);
}
