import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserDataProvider } from './hooks/useUserData';
import './index.css';
import App from './App.tsx';

const root = document.getElementById('root');
if (root) {
	createRoot(root).render(
		<StrictMode>
			<BrowserRouter>
				<UserDataProvider>
					<App />
				</UserDataProvider>
			</BrowserRouter>
		</StrictMode>,
	);
}
