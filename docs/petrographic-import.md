# How to import the petrographic metadata?

Document status: untested DRAFT. **Do not follow those instructions yet**.

## Pre-requisites (one-off step)

Follow [the prerequisites and Getting Started sections in the main README.md](../README.md#prerequisites).

Fork the [ISicily repository](https://github.com/ISicily/ISicily/fork) with your own account as the owner (leave all other fields in the web form untouched).

Wire your local copy of Corpus Building to your own ISicily fork: TODO

## Get the latest `develop` branch

Change into the corpus-building folder then get the latest version of the `develop` branch.

```bash
cd corpus-building
git checkout develop
git pull
```

And verify there is no pending local change. 
The following command should show no change at all.

```bash
cd corpus-building
git diff
```

## Download the Google sheets

Export each Google sheet into a CSV file under `corpus-building/data/petrography` folder.

Make sure the CSVs have the correct name by following the [mapping with Sheet names](../data/petrography/README.md)

Commit your changes:

```bash
cd corpus-building
git commit -m "chore(petro): updated CSVs from Google Sheets" data/petrography/*csv
git push
```

## Convert the CSV into a json file

```bash
cd corpus-building/packages/etl
npm run petrography:json
```

## Import the json file data into your ISicily fork

```bash
cd corpus-building/packages/etl
npm run petrography:import > ../../data/processed/petrography-import.log
```

## Check intermediary outputs

1. The json conversion warnings: look for `"warnings": ` under each entry.
2. The import log: look first at the last line of the log. For instance, if you see something like 'No XML: 19', then 19 files had no (valid) XML. Check occurences by searchings for "No XML".
3. The TEI files: `cd corpus-building/data/raw/` then `git diff` to see which lines have changed in each TEI file. You can also use VSCode to compare more easily. Additionally you can also check on github after sharing your output.

## Share the intermediary output

```bash
cd corpus-building
git commit -m "chore(petro): converted CSVs to petrography.json; " data/processed/petrography.json data/processed/petrography-import.log
git push
```

## Create a pull request from your ISicily fork

TODO

# Special situations

TODO

