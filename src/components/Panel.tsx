import type { ReactNode } from 'react';

interface PanelProps {
	title: string;
	children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
	return (
		<div className="bg-gray-800 rounded-lg shadow">
			<div className="px-6 py-4 border-b border-gray-700">
				<h2 className="text-lg font-semibold text-white">{title}</h2>
			</div>
			<div className="p-6">{children}</div>
		</div>
	);
}
