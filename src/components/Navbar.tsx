import { IoSettingsSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';

export function Navbar() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link to="/" className="flex items-center gap-2">
						<span className="text-2xl">💪</span>
						<span className="text-xl font-bold text-white">
							Personal Trainer
						</span>
					</Link>
					<div className="flex items-center gap-4">
						<Link to="/settings" className="text-gray-300 hover:text-white">
							<IoSettingsSharp className="h-6 w-6" />
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
