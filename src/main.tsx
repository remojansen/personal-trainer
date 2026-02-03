import { registerSW } from 'virtual:pwa-register';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserDataProvider } from './hooks/useUserData';
import './index.css';
import App from './App.tsx';

// Register service worker
registerSW({
	onRegisteredSW(_swUrl, r) {
		// Check for updates periodically
		r &&
			setInterval(
				() => {
					r.update();
				},
				60 * 60 * 1000,
			); // Check every hour
	},
});

const root = document.getElementById('root');
if (root) {
	createRoot(root).render(
		<StrictMode>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<UserDataProvider>
					<App />
				</UserDataProvider>
			</BrowserRouter>
		</StrictMode>,
	);
}
