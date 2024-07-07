import { dev } from '$app/environment';

export const publicUrl = 'http://sicily.classics.ox.ac.uk/';

export const title = 'ISicily';
export const description = 'Brief description or overview of the ISicily publication.';
export const url = dev ? 'http://localhost:5173/' : publicUrl;

export const imageServer =
	'https://apheleia.classics.ox.ac.uk/iipsrv/iipsrv.fcgi?IIIF=/inscription_images/';
