npm run etl 2> >(tee -a data/processed/etl-warnings.log >&2)
