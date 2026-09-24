---
title: About
excerpt: I.Sicily is a long-term project to construct and maintain a digital corpus of the inscriptions of ancient Sicily.
tags:
  - about
  - project
  - sicily
  - inscriptions
---

This interface is currently under development in collaboration with [King's Digital Lab](https://kdl.kcl.ac.uk/projects/crossreads/). The old interface was taken offline in May 2026.

I.Sicily is a long-term project to construct and maintain a digital corpus of
the inscriptions of ancient Sicily, directed by Jonathan Prag. The project aims to provide free open access
data, and to follow the principles of Linked Open Data wherever possible. The
online corpus, live since 2017, can be found at: <https://sicily.classics.ox.ac.uk>.

The I.Sicily project aims to include all types of inscribed text, in all languages,
across the whole of antiquity, beginning with the first written texts at the end
of the seventh century BCE, and continuing through to the Byzantine period (currently
with an approximate upper limit of the seventh century CE). Although the project began from published editions, the ambition is to locate every text and to undertake fresh autopsy and photography wherever possible. I.Sicily is very much not a 'text database', but an ongoing project to curate complete new editions from autopsy with up-to-date photographic documentation. As such it relies fundamentally on the collaboration of colleagues and institutions across the island.

The project began with a focus on texts on stone, and with an initial emphasis on the metadata (bibliography
and information about the inscription, such as material, language and inscription
type). Coverage has steadily expanded to include almost 5,000 inscriptions to date, primarily
on stone, some fully edited, most in draft. We are currently adding a further
c.1,000 texts on stone (primarily material from the Syracuse museum and catacombs),
together with texts on metal, as well as some ceramic and other instrumentum
domesticum (portable objects). We retain the long-term ambition to incorporate texts that were stamped onto
brick and tile, and coin legends. The corpus remains a work-in-progress, and files are liable to further editing.

I.Sicily employs the [EpiDoc TEI-XML standard](https://sourceforge.net/p/epidoc/wiki/Home/).
We use this to encode all the information about the inscription and the inscribed
object, as well as the actual text itself: we create a full edition of the
inscription, directly encoded in EpiDoc, which enables processing of all the
information. These individual editions are published as HTML pages on the website but can also be
searched and filtered through the website, as well as being freely available for
download. All editing takes place in GitHub (which provides a full version history) and the data can also be accessed through the public [I.Sicily repository](https://github.com/ISicily/ISicily). We also present high resolution images where available, via a IIIF server, and the images can be viewed independently on a [IIIF viewer](https://iiif.csad.ox.ac.uk/viewer/isicily). Please note that while you are free to embed images from the IIIF server in other html resources (with due acknowledgement/linkage), the images may not be downloaded or re-used in other ways without permission of the relevant Sicilian authorities. Bibliography is published in [Zotero](https://www.zotero.org/groups/382445/isicily/library), but also in the [FAIR Epigraphy bibliography](https://biblio.inscriptiones.org/).
[Collection data](http://sicily.classics.ox.ac.uk/museum) (museums, sites, etc.) was originally gathered in a database of Sicilian museums.
Data is standardised and made potentially interopable by the use of
recognised vocabularies, such as the [Pleiades gazetteer of ancient
places](https://pleiades.stoa.org/), the [EAGLE epigraphic
vocabularies](https://www.eagle-network.eu/resources/vocabularies/), and the [FAIR Epigraphy vocabularies](https://ontology.inscriptiones.org/).

The current iteration of I.Sicily was developed as part of the ERC Advanced Grant [CROSSREADS](https://crossreads.site.ox.ac.uk/) (grant agreement no.885040, 01/10/2020-30/09/2026). The aim of Crossreads is to develop and exploit the I.Sicily corpus for a detailed exploration of Sicilian epigraphic culture and to shed light on Sicilian history through the island's epigraphy. Crossreads focuses on developing three major areas of data across the corpus: linguistic, palaeographic, and petrographic. Linguistic annotation has been undertaken on a [subset of the corpus](https://openhumanitiesdata.metajnl.com/articles/10.5334/johd.258), alongside tokenisation and lemmatisation of the complete corpus (ongoing) as well as the development of associated [tools for that purpose](https://github.com/rsdc2/PyEpiDoc). Palaeographic annotation has been undertaken through the development of a [palaeographic annotation tool](https://kingsdigitallab.github.io/crossreads/annotator.html), which enables the assignment of letter typologies to linked images and texts. [Petrographic analysis](https://github.com/kingsdigitallab/crossreads-petrography/wiki) has been undertaken on c.850 inscriptions across the corpus. Data from these three subprojects has been integrated into the online version of the corpus as far as possible.
