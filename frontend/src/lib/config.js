import { dev } from '$app/environment';

export const publicUrl = 'http://sicily.classics.ox.ac.uk/';

export const title = 'I.Sicily';
export const description = `${title} is dedicated to the inscribed texts from ancient Sicily, combining an open access digital corpus with news, blogs and other resources.`;
export const url = dev ? 'http://localhost:5173/' : publicUrl;

export const search = {
	limit: 20
};

export const imageServer =
	'https://apheleia.classics.ox.ac.uk/iipsrv/iipsrv.fcgi?IIIF=inscription_images/';
export const imageThumbParams = 'full/400,/0/default.jpg';
