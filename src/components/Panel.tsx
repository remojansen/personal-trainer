import type { ReactNode } from 'react';
import { Button } from './Button';

interface PanelProps {
	title: string;
	children: ReactNode;
	cta?: {
		cta: string;
		onCta: () => void;
	};
}

export function Panel({ title, children, cta }: PanelProps) {
	return (
		<div className="bg-gray-900 rounded-lg shadow min-w-0">
			<div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-white">{title}</h2>
				{cta && (
					<Button variant="primary" color="blue" onClick={cta.onCta}>
						{cta.cta}
					</Button>
				)}
			</div>
			<div className="p-6 min-w-0">{children}</div>
		</div>
	);
}
