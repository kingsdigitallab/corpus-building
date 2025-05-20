import { dev } from '$app/environment';

export const publicUrl = 'http://sicily.classics.ox.ac.uk/';

export const title = 'I.Sicily';
export const description = `${title} is dedicated to the inscribed texts from ancient Sicily, combining an open access digital corpus with news, blogs and other resources.`;
export const heroImageDescription =
	'A small horned altar of limestone, damaged across the top from front to back between the horns. The altar has mouldings around the base and the top on all four sides, with a smooth field in between on all four faces';
export const url = dev ? 'http://localhost:5173/' : publicUrl;

export const search = {
	limit: 20,
	maxLimit: 5000,
	minDate: -700,
	maxDate: 1830,
	minLetterHeight: 0,
	maxLetterHeight: 100
};

export const xmlServerPath =
	'https://raw.githubusercontent.com/ISicily/ISicily/refs/heads/master/inscriptions/';

export const imageServer =
	'https://apheleia.classics.ox.ac.uk/iipsrv/iipsrv.fcgi?IIIF=inscription_images/';
export const imageThumbParams = 'full/400,/0/default.jpg';

export const EMPTY_PLACEHOLDER = 'No data';

export const digitalEditionUrls = /** @type {const} */ ({
	DOI: 'https://doi.org/',
	EDCS: 'https://db.edcs.eu/epigr/epi_url.php?s_sprache=de&p_edcs_id=EDCS-',
	EDH: 'https://edh.ub.uni-heidelberg.de/edh/inschrift/HD',
	EDR: 'http://www.edr-edr.it/edr_programmi/res_complex_comune.php?do=book&id_nr=EDR',
	PHI: 'https://epigraphy.packhum.org/text/',
	TM: 'https://www.trismegistos.org/text/',
	URI: ''
});

export const mapStyle = dev
	? 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=brTBbnRxuiKp6PgjwFPr'
	: 'https://api.maptiler.com/maps/9e2a14f9-e024-4ae4-97f8-2cb320835962/style.json?key=679dKSf11rkW5OwDMgMR';
