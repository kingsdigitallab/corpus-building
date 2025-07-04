

## [0.20.2](https://github.com/kingsdigitallab/corpus-building/compare/v0.20.1...v0.20.2) (2025-06-16)

## [0.20.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.20.0...v0.20.1) (2025-06-14)

# [0.20.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.19.0...v0.20.0) (2025-06-13)


### Bug Fixes

* **download:** fix API endpoint for individual inscription XML ([c034375](https://github.com/kingsdigitallab/corpus-building/commit/c034375d05c60334fdd70d7944d9ee00e7aaeac2))
* **etl:** choose correct edition for lemmas extraction ([52c84e7](https://github.com/kingsdigitallab/corpus-building/commit/52c84e79aa83987e0657013ceb2d6b485324936a))
* **hero:** refine hero image selection logic on mount for improved randomness ([05e9a8d](https://github.com/kingsdigitallab/corpus-building/commit/05e9a8dc9082d0c9288797a979255e7b856597a5))
* **inscription-card:** set font weight for greek font ([0b142cb](https://github.com/kingsdigitallab/corpus-building/commit/0b142cb0fd6d63efe4136af0f8d27634748e9d5f))
* **inscription-overview:** improve metadata rendering with fallback values ([274fe74](https://github.com/kingsdigitallab/corpus-building/commit/274fe74cb1a75c4267f205f80c7210f7d4537f50))
* **inscription-page:** add conditional rendering for metadata and apparatus sections ([bc34094](https://github.com/kingsdigitallab/corpus-building/commit/bc3409413fb54f709aa8df5bf52f17aac544a00d))
* **inscription:** improve support description rendering with optional chaining ([55dc8bd](https://github.com/kingsdigitallab/corpus-building/commit/55dc8bd4167e052121052c42cee4e56ff525fd4e))
* **inscription:** under Lettering, now exclude the refs which don't refer to an allograph type. They were part of the intro paragraph in the TEI. ([f3231ba](https://github.com/kingsdigitallab/corpus-building/commit/f3231ba5c6b71912330d5230c6c3c9e9c6825857))
* **inscription:** update repository link display logic to handle missing museum data ([765aca4](https://github.com/kingsdigitallab/corpus-building/commit/765aca4f61c6ce4b37919ed4da7dbce79613f21f))
* **landing:** ensure hero images load on build ([f071ef3](https://github.com/kingsdigitallab/corpus-building/commit/f071ef39c76e8613764ae32f8ab110f614e0bcad))
* **landing:** improve image load opacity handling ([6a27484](https://github.com/kingsdigitallab/corpus-building/commit/6a27484c6cec0a234a43495e22db3d9b615de965))
* **metadata:** update import syntax and export parseXML function ([b66ea52](https://github.com/kingsdigitallab/corpus-building/commit/b66ea52ac95f39151d7a32ea078689cf0382a079))
* **museum:** update geo property types to allow null values ([d3b07da](https://github.com/kingsdigitallab/corpus-building/commit/d3b07dad98b6b8e972e7574ac45d01b54e058cf6))
* **search:** In the Lettering facet options, prefix the character with the script to avoid ambiguity between similar looking lating and greek symbols ([0362b54](https://github.com/kingsdigitallab/corpus-building/commit/0362b548f391926e3de3a4d2f2e8e78e838add19))
* **search:** pushed corpus.json with the lettering metadata. Lettering facet now filters out refs which are not types in the list. Also don't assume the ref property is always an array. ([805c65d](https://github.com/kingsdigitallab/corpus-building/commit/805c65d441a97143075fcdc942522f1938591cff))


### Features

* **app.css:** add new styles for text part numbers and miniapp elements ([38653be](https://github.com/kingsdigitallab/corpus-building/commit/38653bea7616d84e526151eedfbbf04a4ac8727f))
* **base-layout:** implement centred layout ([662beff](https://github.com/kingsdigitallab/corpus-building/commit/662beff3c06e2f2e4dac4d1a1ce9e17ce3f9f395))
* **config:** add hero images and descriptions ([d596e35](https://github.com/kingsdigitallab/corpus-building/commit/d596e35d942dba7bf55e81216b7cde005715867f))
* **etl:** add lemmas extraction ([1f7903d](https://github.com/kingsdigitallab/corpus-building/commit/1f7903df55ada6a714c8ac0450c42a967b0ee773))
* **faceted-search:** add text view option to search component ([4ce2242](https://github.com/kingsdigitallab/corpus-building/commit/4ce22422227a561e37894029b78690da0618a27d))
* **footer:** add footer component with navigation, social media links, policies, and logos ([a6398a3](https://github.com/kingsdigitallab/corpus-building/commit/a6398a3077b0eeead64620c0b57b98721524c38c))
* **fuzzy:** add fuzzy matching functions ([e148b0b](https://github.com/kingsdigitallab/corpus-building/commit/e148b0b9d59fe36675c66cdb13136b680d485151))
* **hero:** add new hero images and implement random selection in the hero section ([718b47b](https://github.com/kingsdigitallab/corpus-building/commit/718b47b26417ed6e1fd75b5befd6394254fc0b8f))
* **hero:** improve hero image loading ([17b3b42](https://github.com/kingsdigitallab/corpus-building/commit/17b3b428097eac0c6effc85ff10763461ade732e))
* **inscription-card:** add fuzzy matching for search highlighting ([a386a2c](https://github.com/kingsdigitallab/corpus-building/commit/a386a2cb599b820c4fa0622af02846bf05d53d03))
* **inscription-card:** implement text highlighting and conditional rendering based on view prop ([39f8a83](https://github.com/kingsdigitallab/corpus-building/commit/39f8a8377aaf5fb066f25fb04e04d0e165bb5813))
* **inscription-list:** add view and query props to InscriptionCard ([aa95203](https://github.com/kingsdigitallab/corpus-building/commit/aa952039c9a8a4f4f8fd8dbb7cfa833c02528848))
* **inscription:** display inscription citation data ([7a6b5bc](https://github.com/kingsdigitallab/corpus-building/commit/7a6b5bced36aae1d280e0b532408c185b801e9fd))
* **inscription:** List all allograph types (handNote//ref) under the Lettering heading. ([6521a9e](https://github.com/kingsdigitallab/corpus-building/commit/6521a9e43612b67b7fdd9a54c100a961d2e9584f))
* **landing:** add subtitle to configuration and update page layout to display subtitle and description ([e9aab3f](https://github.com/kingsdigitallab/corpus-building/commit/e9aab3f5bd5e3cfd945800b07553848d4aafadf2))
* **logos:** add logo images for footer ([3d0cd60](https://github.com/kingsdigitallab/corpus-building/commit/3d0cd60449141efd488a71c56f566730f66ad2f2))
* **metadata:** extract citation data for each inscription ([27470c2](https://github.com/kingsdigitallab/corpus-building/commit/27470c2ab1a397d0a1ef3569aec1af22e0303e9b))
* **page-header:** add id attribute to header ([58174b1](https://github.com/kingsdigitallab/corpus-building/commit/58174b1607978897b66c98bab2d1a072bf74c2ee))
* **PageHeader:** display 'dev' label in header when in development mode ([715c8d3](https://github.com/kingsdigitallab/corpus-building/commit/715c8d34fa50a0dc55d45f95a2cd3c15f0810bf8))
* **search:** add 'chosen_filters_on_top' option to search configuration facets ([87d3795](https://github.com/kingsdigitallab/corpus-building/commit/87d3795baeb4b872ee572017f76a2229dc7d1141))
* **search:** add lemmas data into search index and search fields ([5aeab18](https://github.com/kingsdigitallab/corpus-building/commit/5aeab18cce2a33e3c8b9d10ba11e0e8753eb3c0f))
* **search:** Added Leterring / allograph types as a new facet to the search ([2ff73f3](https://github.com/kingsdigitallab/corpus-building/commit/2ff73f3bc724cbeb4ec77d82002b8ffcd68811d2))

# [0.19.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.18.0...v0.19.0) (2025-05-23)


### Bug Fixes

* **InscriptionTableRow:** improve handling of optional status property ([34cbbff](https://github.com/kingsdigitallab/corpus-building/commit/34cbbff64e19931c2fe9d61b6352f5da8551bd00))


### Features

* **api:** add API endpoints to get inscriptions and edtions text ([86b3a77](https://github.com/kingsdigitallab/corpus-building/commit/86b3a7720806fb1945cfbd0a98cc6e6b48dae04b))
* **etl:** extract editions text ([52821e7](https://github.com/kingsdigitallab/corpus-building/commit/52821e7ffc8a7a562e5da77861358b36c4741039))
* **inscription:** add link to museum detail page ([a9a81cf](https://github.com/kingsdigitallab/corpus-building/commit/a9a81cfa8ed1b64050346dad78649f962e5fbcf2))
* **museum:** add museum detail page ([7cb5afe](https://github.com/kingsdigitallab/corpus-building/commit/7cb5afe867f10c8211f9383a5faf11713c5ed22d))

# [0.18.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.17.0...v0.18.0) (2025-05-22)


### Bug Fixes

* **download:** update fetch URL to use base path for inscriptions API ([6de663c](https://github.com/kingsdigitallab/corpus-building/commit/6de663cc7aa0783451087eca5af99991a1b1c7d1))
* **hero:** update hero section text and improve image alt attribute for better accessibility ([e47a05c](https://github.com/kingsdigitallab/corpus-building/commit/e47a05c17ae5759dc8706ab044c38d82dfd283cd))
* **inscription:** enable prerendering for inscription API endpoint ([f3dc39d](https://github.com/kingsdigitallab/corpus-building/commit/f3dc39d18b2908815766ae8ad13b6b6e07e06ade))
* **inscriptions:** add optional chaining to safely access properties ([f7c3ee2](https://github.com/kingsdigitallab/corpus-building/commit/f7c3ee250cd76af955da5ec51ae2bc1b74fc1fb5))
* **search:** add id to article element for improved accessibility ([483747f](https://github.com/kingsdigitallab/corpus-building/commit/483747f1331780109bbf20760bdf2f1283743fcf))
* **search:** handle download state correctly and improve accessibility for download buttons ([22a071b](https://github.com/kingsdigitallab/corpus-building/commit/22a071b10a8c7dd52eee60319f62f832d795c50f))
* **search:** reset search input value on reset and update postSearchMessage parameters ([a43aa18](https://github.com/kingsdigitallab/corpus-building/commit/a43aa186e142cbc86579f5104e92542b4c6e1028))
* **styles:** hide visually hidden elements to improve accessibility ([41607ef](https://github.com/kingsdigitallab/corpus-building/commit/41607efc3957cac43fe480828ee85fd7cf313228))


### Features

* **config:** add hero image description ([d67fe51](https://github.com/kingsdigitallab/corpus-building/commit/d67fe518c1f0cd4a43893734ffc9e2811a8fa304))
* **download:** add function to download inscriptions as a ZIP file ([fd88d96](https://github.com/kingsdigitallab/corpus-building/commit/fd88d966df33e6de5aa2f5e43925de2b1b83fc57))
* **inscription:** add API endpoint to serve inscriptions metadata ([03dc63b](https://github.com/kingsdigitallab/corpus-building/commit/03dc63b9a2d2443a4d0a18ced709c230b2dc30cf))
* **inscription:** add API endpoint to serve XML files based on slug ([3688849](https://github.com/kingsdigitallab/corpus-building/commit/36888492ecd1ed63c93bd4a50401db4b064ccd87))
* **inscription:** add entries function to derive slugs from corpus data ([3873a6a](https://github.com/kingsdigitallab/corpus-building/commit/3873a6af8d7712b7ca3af370dceddac7df2cbf89))
* **landing:** implement hero section according to design ([1457ccd](https://github.com/kingsdigitallab/corpus-building/commit/1457ccdd18ec9d653dbe59a787c714bd9e9bce15))
* **search:** add search summary to the CSV download ([d591a91](https://github.com/kingsdigitallab/corpus-building/commit/d591a91d2463a03229c1b639e4808390a817552b))
* **search:** add XML download functionality ([e4832c2](https://github.com/kingsdigitallab/corpus-building/commit/e4832c2b0e0b89980da36d74bf16f3213da86728))
* **styles:** add loading spinner for elements with aria-busy attribute ([2efe8b2](https://github.com/kingsdigitallab/corpus-building/commit/2efe8b246b118879e6e3142d8899f6870ff5e496))

# [0.17.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.16.0...v0.17.0) (2025-04-29)


### Bug Fixes

* **inscription:** add optional chaining to metadata access in inscription page ([af9ca6c](https://github.com/kingsdigitallab/corpus-building/commit/af9ca6cb62223b508bb63303150cc19b29c77020))
* **inscription:** correct author reference in citation link ([32d6e29](https://github.com/kingsdigitallab/corpus-building/commit/32d6e29dd7ba3fb689ec0cbf070ae53836b2fb79))
* **inscription:** filter out empty values in bibliography ([682c764](https://github.com/kingsdigitallab/corpus-building/commit/682c7643d3472b0da308bd8953727d5a748d5288))
* **inscription:** handle optional chaining for status properties ([41a4277](https://github.com/kingsdigitallab/corpus-building/commit/41a427783cbb4f5789bc91774f8cf78181d334bc))
* **inscription:** hide miniapp marker if section is empty ([d933c92](https://github.com/kingsdigitallab/corpus-building/commit/d933c92f2237a8a48bdce25dbfcbd624740c59ac))
* **metadata:** update author extraction logic to handle fragment identifiers ([ffcb87b](https://github.com/kingsdigitallab/corpus-building/commit/ffcb87b9d848c53defb540c2c22f382706eddee1))
* **search:** update bucket display value check for strict equality ([fa99caf](https://github.com/kingsdigitallab/corpus-building/commit/fa99cafc25d7d5d8b26c10fa3af4185acbb1adb5))
* **styleguide:** add anchor link to Buttons section in style guide ([23aa36e](https://github.com/kingsdigitallab/corpus-building/commit/23aa36e0a103817c569cd4554357b6410c654f73))


### Features

* **app.css:** add style for link with role button ([89318d0](https://github.com/kingsdigitallab/corpus-building/commit/89318d0a67ec152d1c53d8d5ae56f72932e5e463))
* **app.css:** add styles for tabs component ([c6da958](https://github.com/kingsdigitallab/corpus-building/commit/c6da95873d3509e5491261ce308caa77e969e8ae))
* **app.css:** add warning color variables and styles for alerts ([6d1fb03](https://github.com/kingsdigitallab/corpus-building/commit/6d1fb031047877816bbbdc04a679f5b5d9af8459))
* **app.css:** define heading sizes for improved typography ([21c84d7](https://github.com/kingsdigitallab/corpus-building/commit/21c84d7195b6bc7eba3471d0d0d6e94b27ef1f74))
* **app.css:** style pre and code using --font-monospace-code ([573f282](https://github.com/kingsdigitallab/corpus-building/commit/573f282ced02dc6cc82ac8ae50d90d06632e8572))
* **bibliography:** add derived state for bibliography edition and discussion ([b5ffa56](https://github.com/kingsdigitallab/corpus-building/commit/b5ffa567e637e65aec04b502ad220112e50328aa))
* **download:** add function to create and download CSV from inscription data ([4d77d92](https://github.com/kingsdigitallab/corpus-building/commit/4d77d92b55a90e185179327ed2ad2e40c317db78))
* **download:** enhance CSV download functionality for inscriptions ([025a317](https://github.com/kingsdigitallab/corpus-building/commit/025a317ebfae47fd31a54b68326d11535b633746))
* **download:** implement CSV download functionality for search results ([9d47164](https://github.com/kingsdigitallab/corpus-building/commit/9d471641a7e50e3dc97e690cecf65cf0ac988b9f))
* **frontend:** add xmlServerPath to config for direct access to GitHub XML files ([60eabdd](https://github.com/kingsdigitallab/corpus-building/commit/60eabddd5806f28d8ed275eaa1245c3aef8d67ec))
* **inscription:** add badge styling to text and object types ([c38d442](https://github.com/kingsdigitallab/corpus-building/commit/c38d4423e2b7a3c1b45bfcdba7e37653dead70bc))
* **inscription:** add deprecation warning for deprecated inscriptions ([eef4a8a](https://github.com/kingsdigitallab/corpus-building/commit/eef4a8ac0cf2d6783660b51a82e1692c49c644c8))
* **inscription:** add expand/collapse functionality for long inscriptions ([fdc4fda](https://github.com/kingsdigitallab/corpus-building/commit/fdc4fdabd12c28b5ec184c07df18775c76f9f995))
* **inscription:** add InscriptionEdition component for displaying and downloading editions ([0a686a7](https://github.com/kingsdigitallab/corpus-building/commit/0a686a7ea6c054abcd10584fc8fc6066a8a52f73))
* **inscription:** add link to download epidoc xml directly from github ([a8d24f7](https://github.com/kingsdigitallab/corpus-building/commit/a8d24f75eb29d87c2ee044b530d5be14c693d00b))
* **inscription:** add styling for miniapp section ([c05fe86](https://github.com/kingsdigitallab/corpus-building/commit/c05fe8607b617c822695229518f7782bf098d898))
* **inscription:** add XML file loading to inscription page ([0de71ef](https://github.com/kingsdigitallab/corpus-building/commit/0de71ef303212a8299fe760756a6ec861c53eb96))
* **inscription:** display edition author information and improve repository metadata handling ([fff5093](https://github.com/kingsdigitallab/corpus-building/commit/fff509392d7e5313f34b79b757d98b5c7d5f2d02))
* **inscriptionedition:** add styles for text part numbers ([ed6c676](https://github.com/kingsdigitallab/corpus-building/commit/ed6c676f660c1cd615cedee4c6e661205425c30a))
* **inscriptionoverview:** create InscriptionOverview component ([fe1679c](https://github.com/kingsdigitallab/corpus-building/commit/fe1679ced27ecb435fddedf16a8ed6e5f9626105))
* **metadata:** add date field to bibliography data ([99e7fc0](https://github.com/kingsdigitallab/corpus-building/commit/99e7fc0c27e0d915d968cc50de8467e271110dd3))
* **metadata:** expand status extraction to include deprecation change notes ([9a21597](https://github.com/kingsdigitallab/corpus-building/commit/9a2159732244cd5c856933371d30ab271362812a))
* **metadata:** extract and add edition author to metadata ([8484d80](https://github.com/kingsdigitallab/corpus-building/commit/8484d8074bc7ca220a2ab7b6f62c0329760725ce))
* **search:** add language conjunction configuration to search settings ([e8a245c](https://github.com/kingsdigitallab/corpus-building/commit/e8a245ca534b75a6bca56584047396b9aafa82f8))
* **search:** add loading state for CSV download ([fb838b9](https://github.com/kingsdigitallab/corpus-building/commit/fb838b9bfa6485cb24c7fbb27022aba163c1a538))
* **search:** add search query parameter for selected filters ([74b5c43](https://github.com/kingsdigitallab/corpus-building/commit/74b5c439e112097cff219af6132ae3c97f07d2a8))
* **search:** enhance filter handling and display in search filters component ([d021528](https://github.com/kingsdigitallab/corpus-building/commit/d021528d6faf01faea77ed58ad4fcae0bb03be23))
* **search:** filter out deprecated items from the search ([2f089c6](https://github.com/kingsdigitallab/corpus-building/commit/2f089c68ec57c3570e2d7bdafbb1a246f8903aa6))
* **search:** implement language conjunction toggle in search filters and update search options ([08159bf](https://github.com/kingsdigitallab/corpus-building/commit/08159bf8ff84d4c6f6a14c752442cbc3043a7ab0))
* **search:** update search configuration to hide zero document counts and default conjunction to false ([6ac80bd](https://github.com/kingsdigitallab/corpus-building/commit/6ac80bdff0de419afa735b944f7f730c9a6b12e5))
* **styleguide:** add Edition section to style guide ([4473851](https://github.com/kingsdigitallab/corpus-building/commit/4473851c82562278e81a25d10ca05ae0d03e8a2b))
* **styleguide:** add link styled as button in style guide ([906abaf](https://github.com/kingsdigitallab/corpus-building/commit/906abaf0190525bb9482b877e2c156261960ed3a))
* **styleguide:** add tabs component sections ([81e7985](https://github.com/kingsdigitallab/corpus-building/commit/81e7985ff88b040bfbe2b9cfc527dae2d02b71d6))
* **xslt:** add template to render milestones with unit face ([c19a871](https://github.com/kingsdigitallab/corpus-building/commit/c19a8717491df33951fd25c381c881eb4c8409e8))
* **xslt:** extract edition subtype ([6e33eba](https://github.com/kingsdigitallab/corpus-building/commit/6e33eba3eb4f608091a1cdc94233a2cba66ee4cc))

# [0.16.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.15.1...v0.16.0) (2025-03-25)


### Bug Fixes

* **config:** change initial error file format from object to array ([8621c91](https://github.com/kingsdigitallab/corpus-building/commit/8621c9134b03c9352349e68769a65ed15963bbbd))
* **FacetedSearch:**  workaround query-params issue with svelte 5 ([72bbcd9](https://github.com/kingsdigitallab/corpus-building/commit/72bbcd9396a21780f7d425157f0c13869f0a908f))
* **pagination:** add aria-labels to previous and next buttons for improved accessibility ([b1e3ca5](https://github.com/kingsdigitallab/corpus-building/commit/b1e3ca56af518553e567ac059e412e077a803475))
* **search:** ensure consistent height for filter dropdown lists ([b8b7c9a](https://github.com/kingsdigitallab/corpus-building/commit/b8b7c9af0c1e7ecae3efd826ed72e23cedef15de))
* **searchfilters:** update Slider component type and thumb rendering ([4a421cd](https://github.com/kingsdigitallab/corpus-building/commit/4a421cd15b8b3f4fb33563ea69f45f11a0de61a0))
* **SearchFilters:** update text color variables for improved a11y ([170799f](https://github.com/kingsdigitallab/corpus-building/commit/170799f5ce7104e3887edeaaf62f629dda9721f6))
* **themetoggle:** update attribute for color scheme from 'color-scheme' to 'data-color-scheme' ([949102f](https://github.com/kingsdigitallab/corpus-building/commit/949102fc0c288af3bcd759cedf22aa3896d31248))


### Features

* **app.css:** add default button and input styles ([4e6c9c0](https://github.com/kingsdigitallab/corpus-building/commit/4e6c9c0e5555af1eec44e060dc2050694c00a8eb))
* **app.css:** expand color variables and styles for improved theming ([f20099a](https://github.com/kingsdigitallab/corpus-building/commit/f20099a307b66432b7470e91ced3026ec2908bc3))
* **config:** add date and letter height search parameters ([4e75325](https://github.com/kingsdigitallab/corpus-building/commit/4e753251a35274be644d964756948f02f545fd42))
* **inscription:** improve place display with badge-like list styling ([ada6b2e](https://github.com/kingsdigitallab/corpus-building/commit/ada6b2e075883054108d3c1b67900b5377c4e039))
* **layout:** import colors-hsl from open-props for enhanced color management ([fab2c18](https://github.com/kingsdigitallab/corpus-building/commit/fab2c183ddb8642e8b26afa5c48d5ed27e236ed2))
* **metadata:** extract letter heights from handNote dimensions ([714c624](https://github.com/kingsdigitallab/corpus-building/commit/714c624d416c45fd42390007bb356b271f7c54bc))
* **pageheader:** add Style Guide link for debug mode ([57b9fd9](https://github.com/kingsdigitallab/corpus-building/commit/57b9fd93af5f8a9023651077ba85ed69a09c4628))
* **RangeSlider:** add unit display to range slider title ([dd47ec9](https://github.com/kingsdigitallab/corpus-building/commit/dd47ec957d1c975f52defc4e5a188c7ccaaa33f3))
* **search:** add condition field to search ([8cd6d3b](https://github.com/kingsdigitallab/corpus-building/commit/8cd6d3bfc055bbe3ec57d07d02908c0f3ffcf43a))
* **search:** add letter height filtering to search functionality ([c86c5c5](https://github.com/kingsdigitallab/corpus-building/commit/c86c5c5aea767d9196f883a236899778742b49d3))
* **search:** add letter height range filtering to search functionality ([e0500c7](https://github.com/kingsdigitallab/corpus-building/commit/e0500c77e49058ce17d430a489ab870588b24634))
* **search:** add range slider filter for letter height ([25174bb](https://github.com/kingsdigitallab/corpus-building/commit/25174bbe0618518d9fecb58e84cfac4d796db794))
* **search:** create reusable RangeSlider component for search filters ([28ef0f6](https://github.com/kingsdigitallab/corpus-building/commit/28ef0f6640d10a5c33dddf4a5a14eacaa946a41d))
* **search:** display letter height filter in search summary ([573e1c7](https://github.com/kingsdigitallab/corpus-building/commit/573e1c7a89b9297229833fff9e74b4b1818a50a5))
* **SearchFilters:** add unit display for letter height in range slider ([a8cf1ea](https://github.com/kingsdigitallab/corpus-building/commit/a8cf1ea2d9aa889b55f76ddd6f0b891e98b813cb))
* **search:** pass total results count to SearchFilters component ([3b062f9](https://github.com/kingsdigitallab/corpus-building/commit/3b062f99e88ff99a02f132bbb19e28b557efbb7f))
* **search:** preserve raw object type in search results ([3f6c663](https://github.com/kingsdigitallab/corpus-building/commit/3f6c663cf0cdaf786f7617ddf71eb3251f601413))
* **styleguide:** add input component section to style guide ([2edae8f](https://github.com/kingsdigitallab/corpus-building/commit/2edae8f2fd6cb96b3d62c29de438f40aeab577a0))
* **styleguide:** add select component to style guide ([91cb8c1](https://github.com/kingsdigitallab/corpus-building/commit/91cb8c1085ef822eabdf4406b2c196c3e71ccb7d))
* **styleguide:** add style guide route ([31a3861](https://github.com/kingsdigitallab/corpus-building/commit/31a386127116007025d2471cc927032c7a494ae3))
* **styleguide:** add StyleBlock integration ([9f180fe](https://github.com/kingsdigitallab/corpus-building/commit/9f180fe52dae389245ff077a8ec7c6a162dc7ceb))
* **styleguide:** introduce StyleBlock component for flexible styling ([c8960f9](https://github.com/kingsdigitallab/corpus-building/commit/c8960f9e34f257b93d8db29850d9868e628ae9e1))

## [0.15.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.15.0...v0.15.1) (2025-02-24)


### Features

* **scrollspy:** add hover tooltip for section navigation ([39a5cdf](https://github.com/kingsdigitallab/corpus-building/commit/39a5cdfe7d8e4bb91816c4fc6fecb6a6936e9e9d))

# [0.15.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.14.0...v0.15.0) (2025-02-24)


### Features

* **about:** add frontmatter ([066569a](https://github.com/kingsdigitallab/corpus-building/commit/066569a12b4c9a17a75a0a2fd3f6074988c010a1))
* **frontend:** add base layout for markdown content ([c088c2e](https://github.com/kingsdigitallab/corpus-building/commit/c088c2eaa5d2ff9b6999ec289a78c8b3ac7aa827))
* **frontend:** use different map keys for dev/prod ([0a43dcc](https://github.com/kingsdigitallab/corpus-building/commit/0a43dcca018781b974a8ad9727f6c9b244aa13c2))
* **inscription:** add meta tags ([dd513df](https://github.com/kingsdigitallab/corpus-building/commit/dd513df3691d098b7b4eda3a42806eb87bc48657))
* **inscription:** add scroll spy navigation component ([df4992a](https://github.com/kingsdigitallab/corpus-building/commit/df4992acbbbead324aefdabb196c2363d7f7818e))
* **search:** disable empty filter options ([8be1707](https://github.com/kingsdigitallab/corpus-building/commit/8be1707cba1ee51776080e8c0400b76a0ff36d99))


### Performance Improvements

* **layout:** remove unused variables ([8f47f9d](https://github.com/kingsdigitallab/corpus-building/commit/8f47f9df4c52325f504d7c6ae9bfeb884f17048f))

# [0.14.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.13.0...v0.14.0) (2025-02-04)


### Bug Fixes

* **css:** update shiki variable names ([22353e7](https://github.com/kingsdigitallab/corpus-building/commit/22353e7c009f14cac7ef9e1847a0637283014df8))


### Features

* **components:** add a component for the footer ([ed63c7c](https://github.com/kingsdigitallab/corpus-building/commit/ed63c7c3abc20bee4246cd622d8e02a8cb6604ea))

# [0.13.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.12.0...v0.13.0) (2025-01-28)


### Bug Fixes

* **etl:** check object exists before deleting ([81feebf](https://github.com/kingsdigitallab/corpus-building/commit/81feebf7dd769fb3b83be251e2c9ddef42c85799))
* **etl:** ensure the xml snipet keeps the content order ([07b9d62](https://github.com/kingsdigitallab/corpus-building/commit/07b9d62806a52f270642bd9207736bbd2e602d5f))
* **facetedsearch:** reset search limit according to search view ([1584fc0](https://github.com/kingsdigitallab/corpus-building/commit/1584fc0cb422a1599945f4588c41965d837d3760))
* **inscription:** check image has description ([c2ffa40](https://github.com/kingsdigitallab/corpus-building/commit/c2ffa408334f01232808aa45f20e9a0b52d0f45b))
* **inscription:** do not display translation section when xml is empty ([bf4c92d](https://github.com/kingsdigitallab/corpus-building/commit/bf4c92d9f6ad44fced3a9332e88799d883b7ec3d))
* **inscription:** scroll wide edition content ([3108a6b](https://github.com/kingsdigitallab/corpus-building/commit/3108a6b5744edbb845a4aaa24a1f86d660190d69))
* **layout:** set padding for smaller screens ([a0ab196](https://github.com/kingsdigitallab/corpus-building/commit/a0ab196ed0aaf8d6e912620a8fc569cdff93da32))


### Features

* **etl:** extract all the images and the xml of the edition ([2d86008](https://github.com/kingsdigitallab/corpus-building/commit/2d8600857b85d5012766c0b5d69f0e0a1f386901))
* **etl:** join date evidence values with a comma ([6aff1bd](https://github.com/kingsdigitallab/corpus-building/commit/6aff1bd30503d57f53a6bbc7fad14d178e4b0465))
* **etl:** request zotero citation according to resource language ([cd65dda](https://github.com/kingsdigitallab/corpus-building/commit/cd65ddaa078d76b8aae8ab665a262385dbdd044c))
* **inscription:** add button to expand the overview section ([78fc378](https://github.com/kingsdigitallab/corpus-building/commit/78fc3781f403e87241ee86d678de6bde813a6a6a))
* **inscription:** add date text to date section ([57baf3e](https://github.com/kingsdigitallab/corpus-building/commit/57baf3e631382f806c7a064bf054091afbcef04b))
* **inscription:** add display option to render the epidoc edition ([1a618ad](https://github.com/kingsdigitallab/corpus-building/commit/1a618adfd204364808bf4eec6d61ac7ce5fd0e4f))
* **inscription:** add keyboard shortcut to navigate to next/previous inscription ([cb5e34e](https://github.com/kingsdigitallab/corpus-building/commit/cb5e34e5f3372971dd42cf9fd8d43cc8f900a3a3))
* **inscription:** add separators between content sections ([2d8725b](https://github.com/kingsdigitallab/corpus-building/commit/2d8725bf1da7dadaf05cbc8b9a8e230646309ef3))
* **inscription:** add translations toggle ([7530185](https://github.com/kingsdigitallab/corpus-building/commit/75301852f8742dc2d981ce2929d6ae14adcd8d46))
* **inscription:** display different edition types ([8280e99](https://github.com/kingsdigitallab/corpus-building/commit/8280e991f96692bd35e077390ee3ff2e04d3172e))
* **inscription:** start implementing inscription page design ([7600f9f](https://github.com/kingsdigitallab/corpus-building/commit/7600f9fb6e1dd09276a98f51e9e358c6aae1c60e))
* **xslt:** extract different edition types ([19f9759](https://github.com/kingsdigitallab/corpus-building/commit/19f97593ac286dc1f60e67806999e486bbb4b815))
* **xslt:** extract translation authors ([092d041](https://github.com/kingsdigitallab/corpus-building/commit/092d041898b68d4339ca0cd6b7ca7a1a52cdd657))


### Performance Improvements

* **inscription:** move data extraction to etl pre-processing ([d134545](https://github.com/kingsdigitallab/corpus-building/commit/d134545d7cea401c0dd28198dca8095d83c055ee))
* **inscription:** use the shiki bundle highlighter ([ca1a9ae](https://github.com/kingsdigitallab/corpus-building/commit/ca1a9ae10beac00b5040696793b9696dca7d5bb4))
* **inscription:** wrap the epidoc xml view ([2d71194](https://github.com/kingsdigitallab/corpus-building/commit/2d7119439c81a53d3149cfd74b417cd9d71ee913))
* **shiki:** add optimised shiki bundle ([af75438](https://github.com/kingsdigitallab/corpus-building/commit/af75438d9a10a1fda5ff0832704282e6987429a8))

# [0.12.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.11.0...v0.12.0) (2025-01-15)


### Bug Fixes

* **etl:** remove unused import ([bb51cfe](https://github.com/kingsdigitallab/corpus-building/commit/bb51cfefd3033fa081de0e980cd67ef05832e6a9))
* **frontend:** check bibliography entry ([d1900c0](https://github.com/kingsdigitallab/corpus-building/commit/d1900c077ad8019ccd9d531a97954f6908faba03))
* **inscriptionmap:** ensure popups are updated when data changes ([aa00f41](https://github.com/kingsdigitallab/corpus-building/commit/aa00f410843fe0d80c9effacb7c59f52f911f778))


### Features

* **bibliographyentry:** render information from Zotero ([a8f7b3d](https://github.com/kingsdigitallab/corpus-building/commit/a8f7b3dead84b27250babd39229134e6d24d5748))
* **config:** add setting to store map style ([de6a1e3](https://github.com/kingsdigitallab/corpus-building/commit/de6a1e3a463b82f439a5c72c724cd5ea08ce65cf))
* **etl:** add museum data from museum authority list ([55839ab](https://github.com/kingsdigitallab/corpus-building/commit/55839ab5f9a305da9ee58c1804d89c531fb3e941))
* **etl:** add script to convert museums al to json ([a286b50](https://github.com/kingsdigitallab/corpus-building/commit/a286b5065ec0233b217141291681700e78dc964d))
* **etl:** add script to convert museums data to tei ([fee547e](https://github.com/kingsdigitallab/corpus-building/commit/fee547e96af46dda9437b54dfb1fb64f7e079115))
* **facetedsearch:** change the view to a quey param ([002764d](https://github.com/kingsdigitallab/corpus-building/commit/002764dd41cf1e7b8db14784e9cd87c092fe12bc))
* **frontend:** add about page ([1f7bd17](https://github.com/kingsdigitallab/corpus-building/commit/1f7bd17017c0720b0229c8ddb653b3172329ca16))
* **inscription:** display map for current location ([96670af](https://github.com/kingsdigitallab/corpus-building/commit/96670af9ca283facde6b2dec7cdfe2a57b921cc4))
* **inscription:** use the map style setting ([54b3842](https://github.com/kingsdigitallab/corpus-building/commit/54b38427bee495fcffbc6ed7c06d98b7d6e848c3))
* **metadata:** import bibliography information from Zotero ([8d4b1c9](https://github.com/kingsdigitallab/corpus-building/commit/8d4b1c9d66a01179346e5bdf56e2e6b2e9bf1941))
* **search:** add facet for language certainty ([85b1ee1](https://github.com/kingsdigitallab/corpus-building/commit/85b1ee13298b897291a3eb8c949ade4e7f3a9b3e))
* **search:** add publication author and year to the search filters ([c0cb846](https://github.com/kingsdigitallab/corpus-building/commit/c0cb84659e65c5efef46e04d0e01961b4afdbc7d))
* **search:** add publication title filter ([642f9f2](https://github.com/kingsdigitallab/corpus-building/commit/642f9f2e83f66912149ad8bfcf518476c13cbaae))
* **search:** set repository facet to private ([e3e48f6](https://github.com/kingsdigitallab/corpus-building/commit/e3e48f660de3042eb434ed4ff50dec5ddb3351d3))


### Performance Improvements

* **facetedsearch:** only update data for map view when in map view ([3f87eda](https://github.com/kingsdigitallab/corpus-building/commit/3f87edada7ff27c5138d2b38e77d410a0b471094))

# [0.11.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.10.1...v0.11.0) (2024-12-10)


### Bug Fixes

* **home:** remove extra wraping article ([b795af2](https://github.com/kingsdigitallab/corpus-building/commit/b795af20f443a61962432d7f406f656c49a09940))
* **inscriptiontablerow:** check if inscription has type ([4948905](https://github.com/kingsdigitallab/corpus-building/commit/4948905943b6716fb51f5686ea6f3573379bf98f))
* **searchfilters:** restore focus to previous active element on close ([1d6d62b](https://github.com/kingsdigitallab/corpus-building/commit/1d6d62bd42300697b04ed8ee76a1a273646e80b0))
* **searchfilters:** set focus to the filter section on open ([b77eae4](https://github.com/kingsdigitallab/corpus-building/commit/b77eae4e9aa2042e7898567baea5760d48231d0c))
* **searchfilters:** set tabindex to negative ([d64710e](https://github.com/kingsdigitallab/corpus-building/commit/d64710e8b139b910f9e0215898f9738ef97071d2))
* **search:** remove unused css ([508ee3c](https://github.com/kingsdigitallab/corpus-building/commit/508ee3c6748d45cbf4daa282d8857ddaf1137f08))
* **search:** remove unused imports ([a78c856](https://github.com/kingsdigitallab/corpus-building/commit/a78c8565ca479bac20f334b520f9f810319b2bc3))
* **search:** temporarily remove config import ([a231fd6](https://github.com/kingsdigitallab/corpus-building/commit/a231fd6211c3c2bc9e332b39b77a80bb4ccc2302))


### Features

* **bibliographyentry:** add component to render bibliography entries ([c112ff9](https://github.com/kingsdigitallab/corpus-building/commit/c112ff9b72a3c47f1067bbbda35641234e384168))
* **config:** add global setting with possible values for edition types ([15ba7fd](https://github.com/kingsdigitallab/corpus-building/commit/15ba7fdecca2ae999c3ffa77d53f65f69bafc451))
* **css:** add classes to style range sliders ([1c11fb2](https://github.com/kingsdigitallab/corpus-building/commit/1c11fb22434c2242418651c0cc1687a7d37b981c))
* **editionentry:** add component to render digital editions ([7a12b3a](https://github.com/kingsdigitallab/corpus-building/commit/7a12b3a4cc148f1295914737a668227ebe095323))
* **etl:** extract bibliography ([12a7112](https://github.com/kingsdigitallab/corpus-building/commit/12a71128109f55589f391a0378dbd38600d7b5fc))
* **etl:** include layout desc in the corpus data ([2dec7df](https://github.com/kingsdigitallab/corpus-building/commit/2dec7df49b6828ad5f0c0bd616d622e82b83233d))
* **etl:** include repository in the corpus data ([644b057](https://github.com/kingsdigitallab/corpus-building/commit/644b057604e1cd28e38cdcccfa856d48377250a8))
* **facetedsearch:** add default initial values for filters ([fc67902](https://github.com/kingsdigitallab/corpus-building/commit/fc6790255e940f14fc41956e36d9157d60966337))
* **facetedsearch:** add filters section ([2c12c21](https://github.com/kingsdigitallab/corpus-building/commit/2c12c215a2bbc66eeb058e72cce0bc353cd94738))
* **facetedsearch:** add function to handle view change ([23067cd](https://github.com/kingsdigitallab/corpus-building/commit/23067cd1d6a7c62ac4226070f484819649dff11d))
* **facetedsearch:** display keyboard shortcut to toggle filters ([69dc121](https://github.com/kingsdigitallab/corpus-building/commit/69dc121a5465872a5ab528c28eacad54f69bdaee))
* **facetedsearch:** enable reset to reset all filters as well ([2075148](https://github.com/kingsdigitallab/corpus-building/commit/2075148dc480731538b11992a64003072235ef2f))
* **frontend:** add setting for maximum number of search results ([53615e9](https://github.com/kingsdigitallab/corpus-building/commit/53615e9fc44081710083a63383672df5d74e9d2e))
* **frontend:** re-implement search with itemsjs ([ba64de8](https://github.com/kingsdigitallab/corpus-building/commit/ba64de8b8439fee01e72b1bbc3231527297d8655))
* **inscription:** render digital editions using the edition entry component ([7601f84](https://github.com/kingsdigitallab/corpus-building/commit/7601f84cb2972b7d6c0fa02d59d8b66d0659a169))
* **inscription:** use bibliotraphy entry component to render the bibliography ([cd85959](https://github.com/kingsdigitallab/corpus-building/commit/cd85959ca6b523f54fc7ceeafde90bd294b45a80))
* **search:** add aggregations for technique and pigment ([deece7b](https://github.com/kingsdigitallab/corpus-building/commit/deece7b344bdc8b7914459fb1a103a14d4e21d71))
* **search:** add extra facets ([e7374e8](https://github.com/kingsdigitallab/corpus-building/commit/e7374e830840f6c5efda965a9e6f2f2db58f97a9))
* **search:** add search results sorting ([bb030f0](https://github.com/kingsdigitallab/corpus-building/commit/bb030f055f14d98d987ebda7f02fbf6765e75697))
* **search:** add separate component to render the filters ([68e08eb](https://github.com/kingsdigitallab/corpus-building/commit/68e08ebe20913126662b129e231bca2e6d4b4768))
* **search:** expand facets configuration and add filter by date ([ddf28cc](https://github.com/kingsdigitallab/corpus-building/commit/ddf28cc3015e32fc2f12f6d8baa2f929028890a8))
* **searchfilters:** add button to close filter panel ([601c3b2](https://github.com/kingsdigitallab/corpus-building/commit/601c3b286a57025cb999bdeebe873472e2eebaf7))
* **searchfilters:** display the number of items in each facet ([1b46f22](https://github.com/kingsdigitallab/corpus-building/commit/1b46f222d116704445ca3bc229539086f280ccb1))
* **searchsummary:** add component to render the search summary ([2a57166](https://github.com/kingsdigitallab/corpus-building/commit/2a5716610bcd9674a126d96115422f82c8670542))
* **searchsummary:** remove separator characters from filter values for display ([7b9b1c1](https://github.com/kingsdigitallab/corpus-building/commit/7b9b1c1ee5dcaea78bae41e603b4f3618e29587a))
* **searchsummary:** show date range instead of the year span ([f3282e4](https://github.com/kingsdigitallab/corpus-building/commit/f3282e49f4702e041bae321583ad17471df8b547))


### Performance Improvements

* **inscriptionmap:** unset map and container on destroy ([6f8d723](https://github.com/kingsdigitallab/corpus-building/commit/6f8d72349390d6e1253c3fb0690d72d97ee001bb))
* **searchfilters:** debounce the date slider ([cd51bcd](https://github.com/kingsdigitallab/corpus-building/commit/cd51bcd6b62a081c5ad371ffbbeae73a97dd6dcd))

## [0.10.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.10.0...v0.10.1) (2024-11-13)


### Bug Fixes

* **inscription:** check dimensions are available ([3a05ddb](https://github.com/kingsdigitallab/corpus-building/commit/3a05ddb29beb79ea40e89da215684ed64996e45f))

# [0.10.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.9.1...v0.10.0) (2024-11-12)


### Features

* **etl:** extract condition data ([c8e988e](https://github.com/kingsdigitallab/corpus-building/commit/c8e988ea36f285f67c67a7cd71fcf2c848449080))
* **inscription:** output empty placeholder when no data is available ([bab8046](https://github.com/kingsdigitallab/corpus-building/commit/bab80462ddc40b66ef0a471e09aaa436a38473cc))

## [0.9.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.9.0...v0.9.1) (2024-11-12)


### Bug Fixes

* **_qa:** replace link with button ([38bc805](https://github.com/kingsdigitallab/corpus-building/commit/38bc805804dc0b7573cdb34ffea909cd30deb197))
* **_qa:** set href to javascript:void(0) ([afff7e7](https://github.com/kingsdigitallab/corpus-building/commit/afff7e7d7b4e1224b96aaa3b1df304172c25b333))
* **data:** upload latest version of processed data ([cad351b](https://github.com/kingsdigitallab/corpus-building/commit/cad351b122e01cf62c4e8a92e6aa081e28c8867b))
* **inscription:** check if there are places associated with the inscription ([bd34f6a](https://github.com/kingsdigitallab/corpus-building/commit/bd34f6a6b9d6c77e1e73562a873d747e0341fd81))
* **metadata:** check if geo is valid ([84a62fa](https://github.com/kingsdigitallab/corpus-building/commit/84a62fa50509bd411427f91e9483de9fa694b51e))
* **qa:** style the copy to clipboard button ([8021987](https://github.com/kingsdigitallab/corpus-building/commit/8021987c8f32a1ac3675e51b53dbfcc49b74ad30))

# [0.9.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.8.0...v0.9.0) (2024-11-11)


### Bug Fixes

* **etl:** remove redundant fields from the metadata ([ec358d6](https://github.com/kingsdigitallab/corpus-building/commit/ec358d6b9ae0ecca5456cb1f270cd4621192849a))
* **frontend:** update css rules to be more explicit ([2310938](https://github.com/kingsdigitallab/corpus-building/commit/23109386016cf993b8e85ec52a74e792bc04b857))
* **inscriptionmap:** add aria label ([ef1777b](https://github.com/kingsdigitallab/corpus-building/commit/ef1777b011c9dcb9d89cac598a408af278550559))


### Features

* **config:** add const for empty fields ([d2a8b6d](https://github.com/kingsdigitallab/corpus-building/commit/d2a8b6dac78db77faf9b76d94035e6a1950284d3))
* display line numbers for all lines of the edition ([85ea2ad](https://github.com/kingsdigitallab/corpus-building/commit/85ea2ad7fcfeae9b404df72ae514f603ed0a3ece))
* display line numbers for all lines of the edition ([08bfddd](https://github.com/kingsdigitallab/corpus-building/commit/08bfddd453925853729c3530db107251770055e5))
* **etl:** extract more metadata ([2cdbddb](https://github.com/kingsdigitallab/corpus-building/commit/2cdbddb2273131afe39398bf15a7a202119e2395))
* **etl:** use only the inscription id as the unique identifier ([4bfdcd7](https://github.com/kingsdigitallab/corpus-building/commit/4bfdcd764ca1d4d8a15d72d11f9d938626fda1fe))
* **frontend:** display language, type and object type ([f48b57e](https://github.com/kingsdigitallab/corpus-building/commit/f48b57e9f40e70b3b825897c25a21fb9a0aef5ed))
* **frontend:** use action to add markers ([eb5db91](https://github.com/kingsdigitallab/corpus-building/commit/eb5db91a59b411b4a9f1e9b8676481d7c94e2bd7))
* **inscription:** display all extracted metadata ([644bb6a](https://github.com/kingsdigitallab/corpus-building/commit/644bb6a6f8bbbf6eadd3e33586527d47e2530ee8))
* **inscription:** display mini map for provenance found ([68dafa0](https://github.com/kingsdigitallab/corpus-building/commit/68dafa01063a7b9b204697a10751a4999b678723))
* **inscription:** style the inline maps ([6939c07](https://github.com/kingsdigitallab/corpus-building/commit/6939c0782ff1097e80b7294b18de3e9cccb09dbe))
* **inscriptiontable:** display the settlement in the table ([4b4d5fd](https://github.com/kingsdigitallab/corpus-building/commit/4b4d5fd16934a8a31d27d4c7bd33e857d4d60f15))
* update xslt version ([0920779](https://github.com/kingsdigitallab/corpus-building/commit/0920779fb2270e62121d5896e7172ce4207262ee))


### Performance Improvements

* **data:** exclude repository form the high-level metadata ([d5545bc](https://github.com/kingsdigitallab/corpus-building/commit/d5545bc1350ddb313464bbb3b80f0f6b2cbe95f6))
* **etl:** remove debug log statement ([bb2861b](https://github.com/kingsdigitallab/corpus-building/commit/bb2861b77c1b77858d7a854198864496c318b1a7))
* **xslt:** remove debug message ([34c3629](https://github.com/kingsdigitallab/corpus-building/commit/34c362965ff1fb88282ad9b656e06dec20fab786))

# [0.8.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.7.1...v0.8.0) (2024-07-24)


### Bug Fixes

* **etl:** parse coordinates as float ([b8354e1](https://github.com/kingsdigitallab/corpus-building/commit/b8354e16db2a026f882e4850256f231736fe5cf4))


### Features

* **frontend:** display all places in the map ([59d8d3e](https://github.com/kingsdigitallab/corpus-building/commit/59d8d3e74c5a506674d4f87ba53fa0927bd41efe))
* **frontend:** return geo information for all inscriptions ([b70ae21](https://github.com/kingsdigitallab/corpus-building/commit/b70ae21659762742ca19a82ee6dbb95f7e4ad5de))

## [0.7.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.7.0...v0.7.1) (2024-07-24)


### Bug Fixes

* **frontend:** distinguish link from normal text ([a5efbdf](https://github.com/kingsdigitallab/corpus-building/commit/a5efbdf7a4875736ae2ca8965c3e419c5955892e))
* **frontend:** remove unused icons ([f05eeb2](https://github.com/kingsdigitallab/corpus-building/commit/f05eeb2a4176a57133a0d43f63d64587c46a38e7))


### Features

* **frontend:** add transition on page change ([3e99b8b](https://github.com/kingsdigitallab/corpus-building/commit/3e99b8be1eb05fe3f0e69fd9f0ef3ce57318bfd7))

# [0.7.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.6.1...v0.7.0) (2024-07-23)


### Bug Fixes

* **frontend:** check object type exists ([b119c4c](https://github.com/kingsdigitallab/corpus-building/commit/b119c4c2b627436be8f3fbfb9b119cf68b5486ee))
* **frontend:** ensure type exists before accessing the value ([839b732](https://github.com/kingsdigitallab/corpus-building/commit/839b732146c2bfa2e4e9ef1a4d8fae6797242eb8))
* **frontend:** move section base style to app css ([93af00b](https://github.com/kingsdigitallab/corpus-building/commit/93af00b8c1203695f9a1ec9cf871491ead299d06))
* **frontend:** update to match changes in the data ([135334e](https://github.com/kingsdigitallab/corpus-building/commit/135334e6d67146232e494a5ad1459eedee9261a1))
* **frontend:** use accessible colour for paginations results ([779dd51](https://github.com/kingsdigitallab/corpus-building/commit/779dd51b730170699127e92b4694fbd8c282f7f6))


### Features

* **etl:** add inscription type and object type to the keywords ([25a3a05](https://github.com/kingsdigitallab/corpus-building/commit/25a3a05ef5f0ee94f32dd61a3ce408c1f1e87d72))
* **etl:** extract layout description ([4b3c97b](https://github.com/kingsdigitallab/corpus-building/commit/4b3c97b7f95306899358bc4c6e2eb449df9527e7))
* **etl:** extract layout description ([a95357e](https://github.com/kingsdigitallab/corpus-building/commit/a95357e805ee0d555cc59a55f0181864f93d60f6))
* **etl:** extract letter height ([e43a7d7](https://github.com/kingsdigitallab/corpus-building/commit/e43a7d760a045130895328634c4d4ee60393d1b5))
* **etl:** extract material ([cc50646](https://github.com/kingsdigitallab/corpus-building/commit/cc50646e8b74d1e28e197717a39e948f9aabd4b2))
* **etl:** extract object type ([dbe8568](https://github.com/kingsdigitallab/corpus-building/commit/dbe8568dfa84177d8b8c31488e54ba7d6c7a3323))
* **frontend:** add component to change colour scheme ([b8df4ad](https://github.com/kingsdigitallab/corpus-building/commit/b8df4ad666344e9526956c6ba17cd8243777c467))
* **frontend:** add header component ([adfb8b5](https://github.com/kingsdigitallab/corpus-building/commit/adfb8b5b1fc1402195d73f8685dc98e1905757ce))
* **frontend:** diplay multiple place names in the map tooltip ([245caa0](https://github.com/kingsdigitallab/corpus-building/commit/245caa0de0efaf7fab36241060c72afea578f329))
* **frontend:** display accessibility issues on top ([6fc8cb9](https://github.com/kingsdigitallab/corpus-building/commit/6fc8cb9e32fd1eadc07afa7886433462f3a52a9c))
* **frontend:** display both place types ([1c460c5](https://github.com/kingsdigitallab/corpus-building/commit/1c460c53dddf7b4e0e3892a492849bde29b4b0b3))
* **frontend:** display object type ([b80f7aa](https://github.com/kingsdigitallab/corpus-building/commit/b80f7aa3c9f19ae712b8e56032632ee46d2b4933))


### Performance Improvements

* **frontend:** split long block into functions ([726467c](https://github.com/kingsdigitallab/corpus-building/commit/726467ce3b4840b77f7b7feab966af4569e574ac))

## [0.6.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.6.0...v0.6.1) (2024-07-22)

# [0.6.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.5.0...v0.6.0) (2024-07-18)


### Bug Fixes

* **frontend:** change list to cards ([f41161f](https://github.com/kingsdigitallab/corpus-building/commit/f41161f6f16998a6f00c53226611d5e90f63837a))
* **frontend:** left align the cards with the rest of the page ([1e06f6d](https://github.com/kingsdigitallab/corpus-building/commit/1e06f6d1f21ac5196cc4d0e85296de7f8e468761))
* **frontend:** move component specific styles to the component ([876761c](https://github.com/kingsdigitallab/corpus-building/commit/876761c9a0277b29c093c1147d020fd5b13f66aa))
* **frontend:** reduce the padding around main ([128cec3](https://github.com/kingsdigitallab/corpus-building/commit/128cec36b44440f173181c6da67714f3970bd6a3))
* **frontend:** remove unused css selector ([4d0a246](https://github.com/kingsdigitallab/corpus-building/commit/4d0a246c5f097efe9f6ddebf8f763522d429ecc9))


### Features

* **frontend:** add component to render a link to an inscription ([0574cb7](https://github.com/kingsdigitallab/corpus-building/commit/0574cb738e4ac6fcefaa92c4e62c85cecd964acd))
* **frontend:** add custom components to render the incriptions ([f2fbfe3](https://github.com/kingsdigitallab/corpus-building/commit/f2fbfe3eca807b9ba52f6e374568710c4e65a71a))
* **frontend:** add font family ([f52c4ae](https://github.com/kingsdigitallab/corpus-building/commit/f52c4ae3b603eaed13e7e0e2ab4d437569dba395))
* **frontend:** add map component ([4366696](https://github.com/kingsdigitallab/corpus-building/commit/43666967e06c15f204ffce3821c98c140ce51b13))
* **frontend:** add table view ([7aef6da](https://github.com/kingsdigitallab/corpus-building/commit/7aef6da478830d5c75d061277b2975d0d8071d6d))
* **frontend:** add toggle to show/hide the map ([cff2a47](https://github.com/kingsdigitallab/corpus-building/commit/cff2a476f3efc5e225ccfeb9e232933f001bb2b9))
* **frontend:** style adjustments to better align with the mockups ([2e92d51](https://github.com/kingsdigitallab/corpus-building/commit/2e92d510a346ce075797cf094d55ae90a322a342))

# [0.5.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.4.1...v0.5.0) (2024-07-16)


### Bug Fixes

* **etl:** ensure keywords are converted to lowercase for search ([17ee131](https://github.com/kingsdigitallab/corpus-building/commit/17ee131ead6394c80e561281425e285d464ca2eb))


### Features

* **etl:** extract place of origin data ([101ec76](https://github.com/kingsdigitallab/corpus-building/commit/101ec767880bdc1990c635d6e20a293d8a6bcc02))
* **etl:** extraxt the inscription type ([4dcc835](https://github.com/kingsdigitallab/corpus-building/commit/4dcc83583fc7d604333ec29a707ef24e3d0d225d))
* **etl:** move the metadata extraction into it's own file ([def1ce1](https://github.com/kingsdigitallab/corpus-building/commit/def1ce1305c08016365a07dcd37fe4f5dedd2140))
* **frontend:** add base styles ([658fc98](https://github.com/kingsdigitallab/corpus-building/commit/658fc98fd76ba51a4a17a99c554637ee9cdaf108))
* **frontend:** add config params for search ([45b8789](https://github.com/kingsdigitallab/corpus-building/commit/45b878970b60bb0d29c10d42129d53d3d55e93cd))
* **frontend:** add lib with functions to get inscriptions ([ae07ce8](https://github.com/kingsdigitallab/corpus-building/commit/ae07ce83f9b95c869b756b355500c6e1dac08fa4))
* **frontend:** add pagination component ([30d72ad](https://github.com/kingsdigitallab/corpus-building/commit/30d72ad4cd61256b65202806b45bb64eda7579b3))
* **frontend:** add unpic-img for image optimisation ([c0b2136](https://github.com/kingsdigitallab/corpus-building/commit/c0b21366b2eaf3caa4b8680edd630e7a50c5adbf))
* **frontend:** display place of origin ([4d16ce2](https://github.com/kingsdigitallab/corpus-building/commit/4d16ce2cc32444f7d2da12c063f2b5dd8311aade))
* **frontend:** use inscriptions helper functions ([615b693](https://github.com/kingsdigitallab/corpus-building/commit/615b693825bd4c0b5ff675a45ba459db2750a0df))


### Performance Improvements

* **frontend:** simplify the search by keyword ([94b4a09](https://github.com/kingsdigitallab/corpus-building/commit/94b4a0983f4c1970e8749002ef2ceed703906aff))

## [0.4.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.4.0...v0.4.1) (2024-07-10)


### Bug Fixes

* **etl:** convert dates in keywords to string ([2c03c14](https://github.com/kingsdigitallab/corpus-building/commit/2c03c14084049528f906b8f6ae10f7e28e8897d2))
* **frontend:** type in field name ([2cde63e](https://github.com/kingsdigitallab/corpus-building/commit/2cde63e908f919b079332486c69e71d38b8c5030))

# [0.4.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.3.2...v0.4.0) (2024-07-09)


### Bug Fixes

* **frontend:** add base path to openseadragon prefix url ([002610e](https://github.com/kingsdigitallab/corpus-building/commit/002610ecec58eb3e78ab6511030273b913d094d7))
* **frontend:** typo ([fbe69a7](https://github.com/kingsdigitallab/corpus-building/commit/fbe69a71cec5c590d1a05750898bb7a3035fdadf))
* **frontend:** update path to load iiif images ([510de6a](https://github.com/kingsdigitallab/corpus-building/commit/510de6a64bbf23a881c0cfd8dbc3e435c92992b1))


### Features

* **etl:** extract dates and the first image ([88798f9](https://github.com/kingsdigitallab/corpus-building/commit/88798f9212af0d108c1c21b13d78c49364a1de24))
* **frontend:** add a bit more style to match the designs ([c42f4e7](https://github.com/kingsdigitallab/corpus-building/commit/c42f4e7dd31ae7818bb4f33d12d40a840d4cdd24))
* **frontend:** add entries function ([1993e86](https://github.com/kingsdigitallab/corpus-building/commit/1993e8648d307a20bb1edd9323940ce2cf2783c4))
* **frontend:** add link to the image ([ab719a1](https://github.com/kingsdigitallab/corpus-building/commit/ab719a1bebc5981a921e709fe43e14f743e23f99))
* **frontend:** add placeholder items to nav ([c7bd5ff](https://github.com/kingsdigitallab/corpus-building/commit/c7bd5ffb702a8b68727d3f21397a5abdb3e8f817))
* **frontend:** update the layout to match the mockups ([7e066c2](https://github.com/kingsdigitallab/corpus-building/commit/7e066c2871849f1b4dabcf7abcf0a18877cbe2f3))
* **frontend:** update the list layout to match the mockups ([0146052](https://github.com/kingsdigitallab/corpus-building/commit/01460529567e04dc207f8215b27b05381c47a175))

## [0.3.2](https://github.com/kingsdigitallab/corpus-building/compare/v0.3.1...v0.3.2) (2024-07-08)


### Bug Fixes

* **frontend:** remove extra / from links to current live site ([d9aaf4a](https://github.com/kingsdigitallab/corpus-building/commit/d9aaf4aa3d30f9a3b30ca6d44ae20f3110fdd79e))


### Features

* **frontend:** add link from the version number to the changelog ([689d180](https://github.com/kingsdigitallab/corpus-building/commit/689d180110a234e987b3fcd27e2e954e148d592e))
* **frontend:** add style for title links ([ecda638](https://github.com/kingsdigitallab/corpus-building/commit/ecda63889e81df1b5ca4d565e631d02e2722b90f))
* **frontend:** display current version ([ec175c1](https://github.com/kingsdigitallab/corpus-building/commit/ec175c11a95f51b2cb832c1a18454ec58cd40f86))
* **vite:** define project version ([ad53d1d](https://github.com/kingsdigitallab/corpus-building/commit/ad53d1d521b10fe660fafb517d91331f5341a4ac))

## [0.3.1](https://github.com/kingsdigitallab/corpus-building/compare/v0.3.0...v0.3.1) (2024-07-08)


### Features

* **frontend:** update metadata fields after metadata restructure ([e0a6229](https://github.com/kingsdigitallab/corpus-building/commit/e0a6229a449db38e7315b8441e2dfd4e63b68017))


### Performance Improvements

* **etl:** simplify the metadata structure ([bcfd80d](https://github.com/kingsdigitallab/corpus-building/commit/bcfd80df3142b71ecfd465bcda8dd43aa4648377))
* **frontend:** load individual inscription metadata file ([a7d1bc3](https://github.com/kingsdigitallab/corpus-building/commit/a7d1bc3e3c3c6fc2add66403ec90dd460b114d41))

# [0.3.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.2.0...v0.3.0) (2024-07-07)


### Bug Fixes

* **frontend:** do not use a header for the inscription title ([1da3c94](https://github.com/kingsdigitallab/corpus-building/commit/1da3c94b28a8dd3588b109bebbf1a37d04974436))


### Features

* **etl:** add status to the metadata ([fe50ae5](https://github.com/kingsdigitallab/corpus-building/commit/fe50ae5e52babf4cf6fd3f5b964790be101dd861))
* **frontend:** add image server setting ([81f5d75](https://github.com/kingsdigitallab/corpus-building/commit/81f5d756ed2baafebfcfc78520c953761e14aa98))
* **frontend:** add openseadragon image viewer to render inscription images ([0f40dd4](https://github.com/kingsdigitallab/corpus-building/commit/0f40dd495bd133ec284220a2d7d5949f9b5aa398))
* **frontend:** add placeholder file for global css ([1bc5152](https://github.com/kingsdigitallab/corpus-building/commit/1bc5152e6cad28427ce5fd326016dddcddf75263))
* **frontend:** display more details on error ([c8589da](https://github.com/kingsdigitallab/corpus-building/commit/c8589dae01093a5d979be2b3f5c70c37eafed492))
* **frontend:** display the inscription status ([a06e07e](https://github.com/kingsdigitallab/corpus-building/commit/a06e07e94278a0bafc55d6d9797b5e32b5db8e8a))
* **frontend:** load and display accessibility issues ([9d8dcdc](https://github.com/kingsdigitallab/corpus-building/commit/9d8dcdc6a2daae9b718f065f879cf3804ad4391d))
* **frontend:** load inscription metadata ([cf9ac53](https://github.com/kingsdigitallab/corpus-building/commit/cf9ac533793a4f26de721cb76867a561888f668a))

# [0.2.0](https://github.com/kingsdigitallab/corpus-building/compare/v0.1.0...v0.2.0) (2024-07-05)


### Features

* **etl:** add inscription uri and title to the keywords ([e05630a](https://github.com/kingsdigitallab/corpus-building/commit/e05630a750f29ac3b2d3d6ad20044a46ece1d98a))
* **etl:** add inscription uri and title to the keywords ([c63bbf2](https://github.com/kingsdigitallab/corpus-building/commit/c63bbf213e17be425259bc11e7306bb5ba7e54c3))
* **etl:** add keywords field to the metadata ([6dbcd21](https://github.com/kingsdigitallab/corpus-building/commit/6dbcd2192d907900c00351a6310d341c0ac05821))
* **frontend:** add error page ([5ad65cc](https://github.com/kingsdigitallab/corpus-building/commit/5ad65cc16f4d39c3b828f26c70c518852af93d37))
* **frontend:** add simple search and display basic metadata for the inscriptions ([c1f33e6](https://github.com/kingsdigitallab/corpus-building/commit/c1f33e651b6b5012b481916955d96a9fa242aa38))
* **frontend:** implement load more to progressively load the inscriptions ([12fc7b9](https://github.com/kingsdigitallab/corpus-building/commit/12fc7b96ee5b482c1f726b1164a66fb6e10a70a0))
* **frontend:** import open props buttons ([dda4a04](https://github.com/kingsdigitallab/corpus-building/commit/dda4a0401462a0950390d60afc39a215fae70f3c))

# 0.1.0 (2024-07-04)


### Bug Fixes

* **data:** ensure that listbibl/bibl generates a correct ul/li ([56cdd98](https://github.com/kingsdigitallab/corpus-building/commit/56cdd98648098fbfdb736385568468b55259222b))
* **etl:** typo ([b45afa4](https://github.com/kingsdigitallab/corpus-building/commit/b45afa451a89e7840b08eacc794e2166038cf04e))
* **frontend:** add missing nav element ([a416ca6](https://github.com/kingsdigitallab/corpus-building/commit/a416ca6937d14cf184cebc4e4ed97423b2a2312e))
* **frontend:** add title to head ([109e7e2](https://github.com/kingsdigitallab/corpus-building/commit/109e7e238199bf50e5a4b688f21610008614e409))
* **frontend:** update property name ([2ed2833](https://github.com/kingsdigitallab/corpus-building/commit/2ed2833e2c82495b06ceee8d232337679bd57967))
* **frontend:** use imports for the json instead of fetch ([b36b78e](https://github.com/kingsdigitallab/corpus-building/commit/b36b78e561a41233148c79ba9a046d449e53887c))


### Features

* **data:** add data processed from the inscriptions ([63c3e34](https://github.com/kingsdigitallab/corpus-building/commit/63c3e34a226c7956a4382de6a896a1227ec421de))
* **data:** update corpus data ([a2b4546](https://github.com/kingsdigitallab/corpus-building/commit/a2b45462d9455f8897ffefe14fe7163697a4c1fb))
* **data:** update inscription data ([4ec4142](https://github.com/kingsdigitallab/corpus-building/commit/4ec414238f7d3b2778815693b36142b316292e0d))
* **etl:** add package to etl inscription data ([7ce4978](https://github.com/kingsdigitallab/corpus-building/commit/7ce4978c1ca24dc41534343b31a42ff94920bd18))
* **frontend:** add a more relevant favicon ([7edc38d](https://github.com/kingsdigitallab/corpus-building/commit/7edc38ddb23494ba2915e51597a857e17bbf7f7c))
* **frontend:** add base link component ([5836972](https://github.com/kingsdigitallab/corpus-building/commit/58369725cf60fb54d04fcdc72b04706673479523))
* **frontend:** add frontend app ([2f7a4b3](https://github.com/kingsdigitallab/corpus-building/commit/2f7a4b39a1d8885597206175a3003a4a6f940573))
* **frontend:** add link to qa view when in debug mode ([cd0f0eb](https://github.com/kingsdigitallab/corpus-building/commit/cd0f0ebfe5ad0116d105dae4c65f167bebed365c))
* **frontend:** add route to display build errors ([7f166d8](https://github.com/kingsdigitallab/corpus-building/commit/7f166d89dbdeaf93f0338b780671b11dfabf2cfa))
* **frontend:** enable prerender ([fea7eaa](https://github.com/kingsdigitallab/corpus-building/commit/fea7eaab9db02de20c013f7acd62b5fe0324b64d))
* **frontend:** parse the inscription html to prepend relative links with the base url ([65e5682](https://github.com/kingsdigitallab/corpus-building/commit/65e5682d82d1e759a299fc92c249e68f6246f402))
* **frontend:** parse the number of incriptions to locale string ([87fa558](https://github.com/kingsdigitallab/corpus-building/commit/87fa558bed4f327a1e8256cf1b31936b450c5059))
* **frontend:** use the base link component instead of a ([06fa992](https://github.com/kingsdigitallab/corpus-building/commit/06fa992de416dabd3f68b8c9b9bd70a948bf5731))
* **xslt:** add compile xslt to transform the inscriptions into html ([7784f41](https://github.com/kingsdigitallab/corpus-building/commit/7784f413201ec5b902a7d550549f1811e5c6c47d))
