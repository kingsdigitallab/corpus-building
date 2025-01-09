import { dev } from '$app/environment';

export const publicUrl = 'http://sicily.classics.ox.ac.uk/';

export const title = 'I.Sicily';
export const description = `${title} is dedicated to the inscribed texts from ancient Sicily, combining an open access digital corpus with news, blogs and other resources.`;
export const url = dev ? 'http://localhost:5173/' : publicUrl;

export const search = {
	limit: 20,
	maxLimit: 5000
};

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

export const mapStyle = 'https://api.maptiler.com/maps/outdoor/style.json?key=brTBbnRxuiKp6PgjwFPr';
