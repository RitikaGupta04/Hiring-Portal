# Data files for dynamic dropdowns

Place one or more of these files in this folder to override hard-coded lists:

- countries.csv or countries.xlsx
  - Columns: `name` or `country`
- country-codes.csv or country-codes.xlsx
  - Columns: either `code,label` or `country,dial_code`
    - Examples:
      - code,label => 
        - "+91","India (+91)"
        - "+1","United States (+1)"
      - country,dial_code =>
        - "India",91
        - "United States",1
- colleges.csv or colleges.xlsx
  - Columns: `name` or `college` or `university`

When present, `npm run dev` or `npm run build` will auto-generate:
- `src/lib/countries.js`
- `src/lib/country-codes.js`
- `src/lib/colleges.js`

If no files are present, the app uses the existing hard-coded lists. To refresh, update CSV/Excel and restart dev/build.
