import type { ReactNode } from 'react';

interface HighlightGroupProps {
	children: ReactNode;
}

export function HighlightGroup({ children }: HighlightGroupProps) {
	return (
		<div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-6">{children}</div>
	);
}
