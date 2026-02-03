export function Copyright() {
	const year = new Date().getFullYear();
	return (
		<footer className="py-6 text-center text-sm text-gray-500 bg-gray-950">
			&copy; {year} Personal Trainer. All rights reserved.
		</footer>
	);
}
