---
title: How to Cite
excerpt: How to cite I.Sicily
tags:
  - how-to-cite
  - citation
  - project
  - sicily
  - inscriptions
---

We ask all users to bear in mind that I.Sicily is a substantial and collaborative work of scholarship, developed over many years, and involving considerable time and effort on the part of many individuals. As with any scholarly output, it is therefore appropriate to cite it fully and correctly in order to give due credit to those whose work you are using; and if you are using the data contained within the site, correct citation should enable its subsequent retrieval by yourself and others in order to check or re-use that information, just as would be the case if you were to return to the same page in a book. I.Sicily is made available under a [Creative Commons CC-BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/), meaning you are free to share and adapt this material, but you **must** give appropriate credit.

Because of its nature as a dynamic website, underpinned by a large dataset, the exact method of citation that you should use will depend upon what you are using and wanting to cite, and we offer guidance accordingly below. Most importantly, it is essential to understand that the data employed and presented in I.Sicily is subject to revision over time. Consequently, although the URL for an individual inscription is a permanent and stable identifier for that inscription, the data presented on that page, and in the website as a whole, may change over time. You should therefore consider whether it is important for your purposes, and so your citation, as to whether you need to be able to return to exactly the same data as you viewed and employed on a particular occasion, or if it is simply important that you or your reader can find e.g. details about the same inscription in its most up-to-date form, or simply return to the website and corpus as a whole.

## Citing the website

This website is a specially built platform which unites data from multiple sources (EpiDoc TEI files, images, petrographic and palaeographic datasets) and provides tools to search and visualise that data. As such it is both a technical construction deserving credit in its own right and also an interface for accessing the underlying data of the project. It is therefore appropriate to credit both the technical team responsible for the site and those who created the data which it presents. The website is assumed to be the primary means by which most users will access the data. It employs a stable set of URLs. The content presented by the website will change over time. To cite the website and so the corpus as a whole (stable location, content subject to change), please cite as follows:

> Prag, Jonathan R.W. (ed.), with Alex Antoniou, Alessia Coccato, Robert Crellin, Victoria Fendel, Marta Fogagnolo, Ilenia Gradante, Michael Metcalfe, Valentina Mignosa, Francesca Prado, Flavio Santini, Simona Stoyanova, Alfredo Tosques, King's Digital Lab (tech ed.), with Arianna Ciula, Neil Jakeman, Ryan Heuser, Zihao Lu, Geoffroy Noël, Tiffany Ong, Miguel Vieira. 2017-2026. *I.Sicily: Inscriptions of Ancient Sicily*. [sicily.classics.ox.ac.uk](/). Stable deposit: [https://doi.org/10.5281/zenodo.2556743](https://doi.org/10.5281/zenodo.2556743) (12-04-2024).

As good practice we include reference in this citation to a stable deposit of the core underlying data, but see [below](#citing-a-stable-version-of-the-principal-epigraphic-dataset) for more details on this.

See [credits and acknowledgments](credits) for details on specific contributions.  

For more details on design and software products designed and developed by King's Digital Lab for the CROSSREADS project and to feed the I.Sicily website and edition see: 

- [Code](https://github.com/kingsdigitallab/crossreads) and associated [dynamic data repository](https://github.com/kingsdigitallab/crossreads/tree/main/app/data) for [Palaeographic annotator](https://kingsdigitallab.github.io/crossreads/annotator.html) 

- [Code](https://github.com/kingsdigitallab/crossreads-petrography) repository for Petrographic environment 

- [Code](https://github.com/kingsdigitallab/corpus-building) and associated [dynamic](https://github.com/ISicily/ISicily) and [stable](https://doi.org/10.5281/zenodo.2556743) data repository for the overall Corpus building edition.

## Citing individual inscription records

Individual inscriptions have permanent stable identifiers in the form of a URL of the following form:
> [https://sicily.classics.ox.ac.uk/inscription/ISic000001](https://sicily.classics.ox.ac.uk/inscription/ISic0000010)

These stable URLs are intended to serve as [URIs](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier), that is to say permanent long-term identifiers for the individual inscriptions of the corpus. These currently resolve as URLs, presenting an online edition of the inscription. The edition presented online is subject to change over time, because it will present the latest version of the EpiDoc file. The date of the current version is stated at the foot of the edition, alongside a `copy citation` button which will generate a citation of the following form, incorporating all the named contributors to the file, of which the first-named will be the principal contributor:
> Jonathan Prag, James Cummings, Simona Stoyanova, Robert Crellin, Alessia Coccato. ISic000001: Funerary inscription of Zethus. https://sicily.classics.ox.ac.uk/inscription/ISic000001. Last revised: 01/05/2025.

Experienced users of EpiDoc will be able to extract more detailed information from the EpiDoc file by looking at the `<respStmt>` and `<change>` elements in the EpiDoc file, which detail the file history.

If you need to cite a stable version of the inscription that will not change, then you can either cite the [latest stable deposit](https://doi.org/10.5281/zenodo.2556743) of the complete I.Sicily dataset in Zenodo (see [below](#citing-a-stable-version-of-the-principal-epigraphic-dataset)), or else we recommend that you download the EpiDoc file (using the button upper right), or otherwise copy the page which you are using (e.g. simply by printing the relevant web page as a pdf), and place that file in a repository with a DOI where you can then cite it in stable form for your own purposes. One way to do this is through the [Wayback Machine](https://help.archive.org/help/save-pages-in-the-wayback-machine/) of the Internet Archive. Repositories such as [Zenodo](https://zenodo.org/) also provide a free means to create such a stable, citable deposit. I.Sicily is made available under a [Creative Commons CC-BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/), so you are free to do this, but should always provide appropriate credit and citation of the source when you do so.

<h2 id="citing-a-stable-version-of-the-principal-epigraphic-dataset">Citing a stable version of the principal epigraphic dataset</h2>

The primary underlying data for the I.Sicily corpus is constituted by the EpiDoc TEI XML files. These contain all the epigraphic data, and include the key palaeographic and petrographic data for the individual inscriptions also; they do not incorporate the image files, and only include links to the full bibliographic references which are stored separately in a Zotero library. At irregular intervals we deposit a complete copy of these files in the [Zenodo](https://zenodo.org/) open access repository. Each version has its own DOI, but you can always resolve to the most recent version using the following DOI: [https://doi.org/10.5281/zenodo.2556743](https://doi.org/10.5281/zenodo.2556743). The Zenodo repository provides a standard citation for this data (lower right on the page), similar to the following:
> Jonathan Prag et al. (2024). ISicily/ISicily: work-in-progress (v0.4beta). Zenodo. [https://doi.org/10.5281/zenodo.10966077](https://doi.org/10.5281/zenodo.10966077).

Given that the latest stable deposit may not be completely up to date, users are also free to download the current EpiDoc file set either by clicking on the ‘EpiDoc’ download button on the landing page of the website, or else directly from the ISicily GitHub repository [https://github.com/ISicily/ISicily](https://github.com/ISicily/ISicily) where the EpiDoc files are to be found in the ‘Inscriptions’ folder. Users can then deposit a copy of these files in a repository of their choice for citation purposes (again, users are free to do this under the Creative Commons licence, but due credit should be given).

## Citing specific searches and filtered subsets of the data

The current website surfaces the URLs for the filters and searches applied. Consequently, it is possible to provide a re-usable URL for an individual search, such as:
<a href="https://sicily.classics.ox.ac.uk/?filters=%7B%22language%22%3A%5B%22Latin%22%5D%2C%22country%22%3A%5B%22Sicilia%22%5D%7D" rel="nofollow">
https://sicily.classics.ox.ac.uk/?filters=%7B%22language%22%3A%5B%22Latin%22%5D%2C%22country%22%3A%5B%22Sicilia%22%5D%7D
</a>
(all Latin inscriptions from Sicily). It is important to bear in mind that the results displayed by such a URL may change over time, as the underlying data may change. Additionally, the URL will in some cases become very long, and so it may be advisable to employ a URL shortening service such as [https://tinyurl.com/](https://tinyurl.com/). 

Consequently, it may be preferable to download and deposit as a citable stable resource the results of a search, if you wish to re-use it or reference that subset of the data. Having conducted a search or applied one or more filters, it is possible to download the resulting data as either a CSV (which contains a selection of key metadata and the text) or a zip file containing the EpiDoc files in question, using the buttons immediately above the search results display. These files can then be deposited in a repository of your choice such as [Zenodo](https://zenodo.org/) and cited as a stable dataset (again, users are free to do this under the [Creative Commons CC-BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/), but due credit should be given).
