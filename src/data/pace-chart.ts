export interface Pace {
	minutes: number;
	seconds: number;
}

export interface TotalTime {
	hours: number;
	minutes: number;
	seconds: number;
}

export interface PaceChartEntry {
	pacePerKm: Pace;
	times: {
		distanceKm: number;
		totalTime: TotalTime;
	}[];
}

function paceToSeconds(pace: Pace): number {
	return pace.minutes * 60 + pace.seconds;
}

function secondsToPace(totalSeconds: number): Pace {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return { minutes, seconds };
}

function secondsToTotalTime(totalSeconds: number): TotalTime {
	const hours = Math.floor(totalSeconds / 3600);
	const remaining = totalSeconds % 3600;
	const minutes = Math.floor(remaining / 60);
	const seconds = Math.round(remaining % 60);
	return { hours, minutes, seconds };
}

export function getPaceChart(): PaceChartEntry[] {
	const max1kmSpeed: Pace = { minutes: 2, seconds: 50 };
	const min1kmSpeed: Pace = { minutes: 10, seconds: 0 };
	const intervalInSeconds = 5;
	const distancesKms = [1, 5, 10, 20, 21.0975, 25, 30, 35, 40, 42.195];
	const paceChart: PaceChartEntry[] = [];
	const minPaceSeconds = paceToSeconds(max1kmSpeed);
	const maxPaceSeconds = paceToSeconds(min1kmSpeed);
	for (
		let paceSeconds = minPaceSeconds;
		paceSeconds <= maxPaceSeconds;
		paceSeconds += intervalInSeconds
	) {
		const pacePerKm = secondsToPace(paceSeconds);
		const times = distancesKms.map((distanceKm) => ({
			distanceKm,
			totalTime: secondsToTotalTime(paceSeconds * distanceKm),
		}));
		paceChart.push({ pacePerKm, times });
	}
	return paceChart;
}
