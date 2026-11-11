## Adding content to the site

See the [frontend README](../frontend/README.md#adding-content) 
for instructions on how to add static pages to the site via markdown files.

## Importing the petrographic metadata

See [the petrographic import documentation](./petrographic-import.md) 
for details.

## Editorial and release workflow

### Edits on the `develop` branch and preview on staging site

Changes to the content or code should normally happen on the `develop` branch. 
Any commit on the `develop` branch will automatically trigger a github workflow that:
1. **fetches the latest version of the TEI corpus from the main `branch` of [the ISicily repository](https://github.com/ISicily/ISicily)**;
2. runs the Extract, Transform and Load process (ETL) from that corpus to rebuild the site metadata and indices;
3. runs some automated tests and stops the release if any fails;
4. commits the updated metadata and indices to the `develop` branch;
5. releases/deploys everything to the **[staging/preview site](https://kingsdigitallab.github.io/corpus-building/)**.

### Public release

When the changes accumulated on the staging site are ready for public release
a [new Pull Request](https://github.com/kingsdigitallab/corpus-building/compare/main...develop)
can be created from the `develop` branch to the `main` branch.

Once the Pull Request has been merged into the `main` branch 
it will automatically trigger a release of the site 
via SSH to the **[public/live/production site](https://sicily.classics.ox.ac.uk/)** 
hosted on Oxford server.

### Release timeframe

The release process may take up to 30 minutes to complete. 
[Current and past release workflows are visible on the Actions tab](https://github.com/kingsdigitallab/corpus-building/actions) 
of the repository. 
There can be a slight delay between the end of the action 
and the actual refresh of the content on the target site. 
Also note that [hard-refresh in your browser](https://www.wikihow.com/Force-Refresh-in-Your-Internet-Browser) 
may be needed to flush old, cached content.

### Hot fixes

Small **[hot fixes](https://en.wikipedia.org/wiki/Hotfix)** 
to the code or content of the live site can be done 
with a Pull Request directly on the `main` branch. 
In that situation extra care should be taken when verifying the changes.

Any such change to the `main` branch should be merged back into the `develop` branch.

### Changes to the corpus only

Because the TEI corpus belongs to the 
[`main` branch of the ISicily repository](https://github.com/ISicily/ISicily/tree/master/inscriptions)
neither the staging or the live site are updated when it changes.

Therefore, if you want the staging site to reflect the latest version of the TEI corpus 
then you can manually trigger a rebuild by following these steps:
1. go to the [Build and deploy workflow](https://github.com/kingsdigitallab/corpus-building/actions/workflows/frontend.yml) on the Corpus Building repository;
2. click the "Run workflow" dropdown on the right,, just above the table;
3. select the `develop` branch (**NOT the `main` branch**);
4. confirm by clicking the "Run workflow" button.

<img width="932" height="544" alt="Screenshot_20260805_121747" src="https://github.com/user-attachments/assets/221f1737-18c7-40c0-8ab0-d2ef80a112ba" />

You should be redirected to a new page for that build and release job 
where you can see its running status in real time. 
You'll notice a "Cancel workflow" button in the top right corner
to interrupt the job. You can't resume a cancelled job; 
instead you would run a new one.

<img width="1139" height="736" alt="Screenshot_20260805_121201" src="https://github.com/user-attachments/assets/153dcc5e-3b27-4399-8f2a-25ba2d3e3555" />

You can also see all the current and past jobs on the 
[Build and deploy workflow](https://github.com/kingsdigitallab/corpus-building/actions/workflows/frontend.yml) page.
The color of the icon in fron of each row indicates the status of the job:
animated orange is curently running; blue tick was successful; 
red cross failed; and greyed was cancelled.

<img width="932" height="757" alt="Screenshot_20260805_121318" src="https://github.com/user-attachments/assets/d4ca61e3-2814-4647-b20d-72f907de5b22" />

The steps above will rebuild the site on the `develop` branch and deploy it to the staging site only.
**If you want to release this version to the live website, see the above section "Public release"**.
