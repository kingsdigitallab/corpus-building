---
title: Technical Overview
excerpt: A technical overview of the I.Sicily corpus, describing the architecture, data model, workflows, and technologies used in the project.
tags:
  - technical
  - overview
---

This page provides an overview of the technical solution used to build and present the I.Sicily digital corpus. The project was designed with sustainability, modularity, and openness as guiding principles.

## Technologies and Processes

### Data Standards

The core dataset for the project relies on the [EpiDoc](https://epidoc.stoa.org) [TEI-XML](https://tei-c.org) standard. This is used to encode all information about the inscriptions and the inscribed objects, as well as the actual text itself.

Data is standardised and made potentially interoperable by the use of recognised vocabularies:

- [Pleiades](https://pleiades.stoa.org/) gazetteer of ancient places
- [EAGLE](https://www.eagle-network.eu/) epigraphic vocabularies
- [FAIR Epigraphy](https://www.cpas.ceu.edu/projects/fair-epigraphy) vocabularies
- [BGS Rock Classification Scheme](https://www.bgs.ac.uk/technologies/bgs-rock-classification-scheme/) for petrographic data

### Development

The project solution is built using a monorepo structure with two main components:

- An [ETL](https://en.wikipedia.org/wiki/Extract,_transform,_load) (Extract, Transform, Load) process for handling and enriching XML files
- A static website built with [SvelteKit](https://kit.svelte.dev/) configured as a Static Site Generator (SSG)

The site generates plain HTML, CSS, and JavaScript files that can be served by any standard web server (like Nginx or Apache). This means it does not require a Node.js or any other application server to be running.

Key frontend dependencies include:

- [bits-ui](https://www.bits-ui.com/) for User Interface (UI) components
- [itemsjs](https://github.com/itemsapi/itemsjs) for faceted search
- [mdsvex](https://mdsvex.pngwn.io/) for markdown content
- [unovis](https://unovis.dev/) for data visualisations
- [OpenSeadragon](https://openseadragon.github.io/) for IIIF image viewing
- [MapLibre GL](https://maplibre.org/) for interactive maps

### Data Workflows and Models

The project workflow processes EpiDoc TEI XML files, enriches the original input corpus, and presents it on a static website. Individual editions are published as HTML pages but can also be searched and filtered, as well as being freely available for download.

High resolution images, where available, are presented via a [IIIF](https://iiif.io/) server.

### Annotation Layers

The corpus integrates multiple annotation layers, each feeding metadata into the inscription pages, faceted search, and other dynamic pages:

#### Linguistic Annotation

Linguistic annotation has been undertaken on a Greek and Latin subset of the corpus, alongside tokenisation and lemmatisation of the complete corpus.

#### Palaeographic Annotation

Palaeographic annotation is conducted through a dedicated digital palaeographic environment, which enables the assignment of letter typologies to linked images and texts. The environment uses [Web Annotations](https://www.w3.org/TR/annotation-model/) that bind graphs as they appear on inscription images with their occurrences in the EpiDoc edition and the formal description of their structure.

#### Petrographic Annotation

Petrographic analysis has been undertaken on hundreds of items across the corpus. The dataset includes raw and processed data from (geo)chemical and minero-petrographic analyses on epigraphic supports, supporting the identification of rock types and their provenance. Geology-specific vocabularies ([The BGS Rock Classification Scheme](https://www.bgs.ac.uk/technologies/bgs-rock-classification-scheme/)) are used as reference to update the XML files with material and material provenance data. Materials description has been augmented via a dedicated RSE-supported workflow which aggregates the multi-analytical data collected by the project’s material scientist and supports (pre)processing and analysis of different data by streamlining repetitive tasks and simplifying data interpretation, eventually leading to the identification of the rocks where the texts (in Latin, Greek and other languages) are inscribed, and therefore their provenance. This research workflow is summarised in technical documentation (*ADD* diagram below), research dissemination (e.g. [Coccato et al., 2025a](https://gmpca2025.sciencesconf.org/); [Coccato et al., 2025b](https://doi.org/10.3301/ABSGI.2025.03); [Ciula et. al., 2025](https://doi.org/10.5281/zenodo.17967411); [Ciula, 2025](https://kdl.kcl.ac.uk/blog/role-and-responsibilities-rsa/)) and the actual [code used to implement the petrographic research environment](https://github.com/kingsdigitallab/crossreads-petrography).

### Workflows

The following diagram illustrates the corpus building workflow:

[![](https://mermaid.ink/img/pako:eNplUl2P2jAQ_CuWnwFxIWk-Hk66I8kBhR5SUIVweHCTPbBK7MhxWlrCf-8mhLuqffPu7OzOrPdCM5UDDehB8_JINmEqn1hUilBlJKm_FSqvT7Anw-EjeWbRZknWWmVQVftUbtk2WW7-q0rlju2UAa3I03qOydHwsYnBZEcyFYYboWTVtGXPbX2z0VxWb0oXZLtaNmTKEn5WcrhIcMK0q5htVksSa34oQBqkhqzXADlpsf29VXQ2mmeGhNzwhkRskbx-IbE4Qas27NTFLGkloDdhgLyABM2N0ohHNzyVL2zF9fdc_ZQ9t3PQInE3pScBWfMDoJzZvWWvJbo5ToBrtDyXOZyblj279ZmzuawyLcpuEfv3_GfWM7jM28G4wL_QBbIwg-7EDyBfRVXzk6j4Pz2W7LUE2fknkcxLJXBhezrAzxU5DYyuYUAL0AVvQ3pJJSEpNUcoIKUBPiXUuMJTSlN5RVrJ5U6p4s7Uqj4cafDGTxVGdZnjFkLB8XI-SgD96qmqpaHBp64DDS70TIOJPRpbju857oPruhPbHtBfNPDHo7FtWxPHsnzbtx7864D-7kaOR54_sTzP9jzLdSx34gwo5AI_a3U72O5ur38AqRfjQQ?type=png)](https://mermaid.live/edit#pako:eNplUl2P2jAQ_CuWnwFxIWk-Hk66I8kBhR5SUIVweHCTPbBK7MhxWlrCf-8mhLuqffPu7OzOrPdCM5UDDehB8_JINmEqn1hUilBlJKm_FSqvT7Anw-EjeWbRZknWWmVQVftUbtk2WW7-q0rlju2UAa3I03qOydHwsYnBZEcyFYYboWTVtGXPbX2z0VxWb0oXZLtaNmTKEn5WcrhIcMK0q5htVksSa34oQBqkhqzXADlpsf29VXQ2mmeGhNzwhkRskbx-IbE4Qas27NTFLGkloDdhgLyABM2N0ohHNzyVL2zF9fdc_ZQ9t3PQInE3pScBWfMDoJzZvWWvJbo5ToBrtDyXOZyblj279ZmzuawyLcpuEfv3_GfWM7jM28G4wL_QBbIwg-7EDyBfRVXzk6j4Pz2W7LUE2fknkcxLJXBhezrAzxU5DYyuYUAL0AVvQ3pJJSEpNUcoIKUBPiXUuMJTSlN5RVrJ5U6p4s7Uqj4cafDGTxVGdZnjFkLB8XI-SgD96qmqpaHBp64DDS70TIOJPRpbju857oPruhPbHtBfNPDHo7FtWxPHsnzbtx7864D-7kaOR54_sTzP9jzLdSx34gwo5AI_a3U72O5ur38AqRfjQQ)

### Architecture

The project uses a monorepo structure with the following components:

| Directory         | Description                              |
| ----------------- | ---------------------------------------- |
| `packages/etl/`   | ETL package for processing XML           |
| `frontend/`       | Static site generator web application    |
| `data/raw/`       | Git submodule for the EpiDoc files       |
| `data/processed/` | Output data generated by the ETL process |
| `xslt/epidoc/`    | Git submodule for XSLT stylesheets       |

### Deployment

The site is available both as a staging instance for testing, and a public production site served via [GitHub Pages](https://pages.github.com/).

The set of granular standard-compliant data files (DTS, EpiDoc, Web Annotations, etc.) versioned on and served from public code repositories is independent from the software. This portability and sustainability requirement was a consideration in all design and development work.

## Design Process

The design of the site was informed by initial discussions around the information architecture and review of static mock-ups. A usability workshop with a group of representative prospective users identified bugs as well as user interface and user experience refinements which have been prioritised collaboratively and integrated into the current interface.

## Community Value

By integrating different layers of annotations in the same publication, the site converges benefits from multiple communities:

- **Researchers**: Multidisciplinary researchers involved in the project are empowered to conduct data quality and analysis on the integrated corpus
- **Museums**: Repositories where the actual inscription objects are held gain visibility and enrichment to their collections under the same integrated digital space
- **DH Teams**: Other collaborative Digital Humanities teams may adopt similar solutions for cultural heritage online corpora that rely on open standards and open architectures

## Source Code

- [Corpus Building repository](https://github.com/kingsdigitallab/corpus-building)

## Acknowledgements

This project has received funding from the European Research Council (ERC) under the European Union's Horizon 2020 research and innovation programme (CROSSREADS, grant agreement no. 885040).
