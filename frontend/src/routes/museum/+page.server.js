import museums from '../../data/museums.json';
import corpus from '../../data/corpus.json';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const museumsWithCounts = museums.map((museum) => {
        const inscriptionCount = /** @type {any[]} */ (corpus).filter(
            (inscription) => inscription?.repository?.ref === museum.uri
        ).length;
        return { ...museum, inscriptionCount };
    });

    return { museums: museumsWithCounts };
}
