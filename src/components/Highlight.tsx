interface HighlightProps {
	emoji: string;
	value: string | number;
	label: string;
	valueClassName?: string;
}

export function Highlight({
	emoji,
	value,
	label,
	valueClassName = 'text-white',
}: HighlightProps) {
	return (
		<div className="flex items-center gap-3">
			<div className="text-3xl">{emoji}</div>
			<div>
				<div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
				<div className="text-xs text-gray-400">{label}</div>
			</div>
		</div>
	);
}
