# Nova Digital Menu

QR table ordering with kitchen and bar dashboards and an admin panel. Node.js + Express + SQLite, live updates over Server-Sent Events.

## Run
    npm install
    npm start          # http://localhost:3000

The first start prints the admin username (`admin`) and a generated password. Set your own with `ADMIN_PASSWORD` before the first start.

## Environment variables (all optional)
PORT, ADMIN_PASSWORD, JWT_SECRET, HOTEL_NAME (default Etetu Abusha Hotel), DB_PATH (default ./nova.db)

## Deploy
Any Node host works (Render, Railway, Fly.io, a VPS). Keep `nova.db` and the `uploads` folder on a persistent disk (set DB_PATH to a path on it; uploads go beside it), or the orders and menu reset on restart. Serve over HTTPS.

## Use
- Customers scan `https://your-domain/?table=5`. Admin > Table QR codes prints one per table.
- Staff sign in at `/#/login`. Roles: kitchen (food and desserts), bar (drinks), admin (everything, plus menu, prices, staff).
- To make an Android app, point your web-to-app converter at your live HTTPS URL.

Photos: admin uploads a photo per menu item (Menu & prices tab). Files are saved in an `uploads` folder next to the database (or UPLOAD_DIR). Back up `nova.db` and `uploads` together.

Not included yet: real Chapa payment (the button records the choice only).

## Free hosting without a card (Render + GitHub backup)
Set env vars GH_TOKEN and GH_REPO (user/private-repo). The database (with photos inside) is saved to that repo 15 seconds after every change and restored on start. Keep photos small (under 500 KB).
