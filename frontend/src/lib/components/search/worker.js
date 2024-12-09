import { load, search } from './search';

/** @typedef {'idle' | 'load' | 'ready' | 'search' | 'results' | 'error'} WorkerStatus */

addEventListener('message', async (event) => {
	const { type, data } = event.data;

	if (type === 'load') {
		load(data);
		postMessage({ type: 'ready' });
	}

	if (type === 'search') {
		const results = search(data);
		postMessage({ type: 'results', data: results });
	}
});
