# Hirewise Admin (Vite + React)

## Dynamic dropdown data via CSV/Excel

The app can auto-generate dropdown lists (countries, country codes, colleges) from CSV/Excel files. Place files in `vite-admin/hirewise-admin-vite/data/` with any of these names:

- `countries.csv` or `countries.xlsx`
	- Columns: `name` or `country`
- `country-codes.csv` or `country-codes.xlsx`
	- Columns: either `code,label` OR `country,dial_code`
		- Examples:
			- code,label => `+91,India (+91)`; `+1,United States (+1)`
			- country,dial_code => `India,91`; `United States,1`
- `colleges.csv` or `colleges.xlsx`
	- Columns: `name` or `college` or `university`

On `npm run dev` or `npm run build`, a generator script creates:

- `src/lib/countries.js`
- `src/lib/country-codes.js`
- `src/lib/colleges.js`

If no files are present, the app uses existing hard-coded lists.

## Duplicate submission guard (idempotency)

- Client: Submit button disables during submission to prevent double-click duplicates.
- Server: The application endpoint rejects duplicate applications for the same user + position + department + branch with HTTP 409.
	- Consider adding a composite unique constraint in the database for strict enforcement.

## Dev setup

1. Install dependencies in both frontend and server:
	 - Frontend (`vite-admin/hirewise-admin-vite`): `npm install`
	 - Server (`vite-admin/server`): `npm install`
2. Optional: add CSV/Excel files to `data/` as described above.
3. Start the frontend: `npm run dev`
4. Start the server: `npm start` (ensure CORS allows your origin; default localhost:5173 is whitelisted)

Set `VITE_API_BASE_URL` in frontend env if your server runs on a non-default URL.
