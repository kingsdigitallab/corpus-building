# How to import the petrographic metadata?

Document status: untested DRAFT. **Do not follow those instructions yet**.

## One-off set up

Follow [the prerequisites and Getting Started sections in the main README.md](../README.md#prerequisites).

Clone the [Corpus Building repository](https://github.com/kingsdigitallab/corpus-building):

```bash
git clone https://github.com/kingsdigitallab/corpus-building.git
cd corpus-building
git checkout develop
git submodule update --init --recursive
# git pull --recurse-submodules
```

Fork the [ISicily repository](https://github.com/ISicily/ISicily/fork) with your own account as the owner (leave all other fields in the web form untouched).

Click the Code button on your repo home page and copy the address (something like https://github.com/XXX/ISicily.git).

Ensure Corpus building is using your own fork of ISicily:

```bash
cd data/raw
git remote add mysicily https://github.com/XXX/ISicily.git
git fetch mysicily
git reset --hard mysicily/master
```

## Preparation (each time)

Go to your ISicily fork and check if it is "behind" the main repo. 
If it is click "Sync fork", "Update branch".

Change into the corpus-building folder then get the latest version of the `develop` branch.
And verify there is no pending local change. 

```bash
cd corpus-building
git checkout develop
git status
```

Same with the nested copy of your ISicily repo.

```bash
cd data/raw
git checkout master
git status
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

