import type { ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	primaryAction?: {
		label: string;
		onClick: () => void;
	};
	secondaryAction?: {
		label: string;
		onClick: () => void;
	};
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	primaryAction,
	secondaryAction,
}: ModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				type="button"
				className="absolute inset-0 bg-black/60"
				onClick={onClose}
				aria-label="Close modal"
			/>
			<div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
				<div className="px-6 py-4 border-b border-gray-700">
					<h3 className="text-lg font-semibold text-white">{title}</h3>
				</div>
				<div className="px-6 py-4 text-gray-300">{children}</div>
				{(primaryAction || secondaryAction) && (
					<div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
						{secondaryAction && (
							<Button
								variant="secondary"
								onClick={secondaryAction.onClick}
							>
								{secondaryAction.label}
							</Button>
						)}
						{primaryAction && (
							<Button
								variant="primary"
								color="blue"
								onClick={primaryAction.onClick}
							>
								{primaryAction.label}
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
