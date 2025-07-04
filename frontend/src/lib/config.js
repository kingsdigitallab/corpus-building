import { dev } from '$app/environment';

export const publicUrl = 'http://sicily.classics.ox.ac.uk/';

export const title = 'I.Sicily';
export const subtitle = 'Inscriptions of Ancient Sicily';
export const description = `${title} is dedicated to the inscribed texts from ancient Sicily, combining an open access digital corpus with news, blogs and other resources.`;
export const url = dev ? 'http://localhost:5173/' : publicUrl;

export const heroImages = [
	{
		image: 'ISic000147_tiled.png',
		description:
			'Funerary inscription for P. Cestius Catullus: Funerary stele in yellow limestone with a rounded top. Otherwise well-squared, but for slight chipping on left side. Traces of a rougher surface in lower half of front face, and slight discolouration; both features suggest that the lower part of the stele was buried in antiquity to that level.'
	},
	{
		image: 'ISic000668_tiled_HALF.png',
		description:
			'Centuripe renews kinship with Lanuvium: A large fragment of a thick slab of compact grey limestone, with veins and crystalline structure. The slab is intact on the left and at the top. The upper left corner is broken, and the face along the upper edge has suffered some chipping and damage.The stone is broken off below and to the right. The preserved top and left sides have straight but only roughly chiselled finish. The face has been polished smooth. It is possible that the damage / hole in the left end of the top side is a damaged clamp hole. The rear is uneven and only very roughly worked, but never to a flat face, excpet perhaps for a narrow margin down the intact left rear edge and along the top rear. Two modern brackets for hanging the stone on a wall have been fixed to the rear face at some time since original discovery, by drilling screws into the rear face. The stone was originally wider than 43 cm (the total maximum preserved width), but the widest part of the surviving face is only 40cm.'
	},
	{
		image: 'ISic000827_tiled_HALF.png',
		description:
			'Oath and letter of a king: A thick fragment of a dense grey stone (identified so far as a calcitic stone), broken on all sides. The rear is rough and uneven. The thickness of the stone suggests a substantial free-standing stele, but the unfinished state of the reverse may suggest either that it stood against an existing structure, or that it was not free-standing but built into a monument of some description. The unusual stone has similarities to the material used for the large honorific base for Hieron II.'
	},
	{
		image: 'ISic000879_tiled.png',
		description:
			'Epitaph for Agathe: A marble plaque, intact on the left margin and above (although with an uneven edge), broken on the right and below; the text however appears to be complete and to follow the shape of the stone on the right margin.'
	},
	{
		image: 'ISic002945_tiled.png',
		description:
			'I.Sicily inscription 002945: Part of a thick slab/plaque of offwhite marble, intact on the left side, and at the top, broken to the right and below. Part of the upper left corner is lost from the face of the stone, and there is damage to the front face across the top. The rear is worked and the main part of the rear face is slightly hollowed out, with the surface picked; there is a lightly pronounced ridge of c. 3m width at the edges, with the rear expanding outwards towards the base, with the stone thickening in a way that is not immediately explicable; however the stone itself is actually thicker at the top than at the bottom.'
	},
	{
		image: 'ISic003362.png',
		description:
			'Inscribed stele in the Sikel language: A slab of limestone, narrower at the base, and rounded at the top; the bottom edge is roughly straight. The surface is roughly smoothed. There is minor damage to the face in the upper left quarter.'
	}
];

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
