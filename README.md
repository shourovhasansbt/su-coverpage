# Assignment Cover Page Generator

A small static site (HTML/CSS/JS) that lets a student fill a form and download
a print-ready cover page PDF, styled after the Sonargaon University Lab
Report cover page. Every successful download is logged by `counter.php`.

## Folder structure

```
assinment-cover/          <- upload this whole folder to your Azure site
├── index.html
├── style.css
├── script.js
├── counter.php
├── counter_data.json      <- auto-created/updated, stores the download count
└── img/
    └── sulogo.png          (700 × 800 university logo)
```

## How it works

- `index.html` — the form (left) and a live cover-page preview (right).
- `script.js` — updates the preview as you type, then on **Download PDF**:
  1. Renders `#cover-page` to an image with `html2canvas`.
  2. Places it on an A4 page with `jsPDF` and triggers the download.
  3. Sends a `POST` to `counter.php` to bump the download counter.
- `counter.php` — reads/writes `counter_data.json` with a file lock so
  concurrent downloads don't overwrite each other's count. It returns
  `{"count": N}` as JSON. You can check the current total any time by
  visiting `counter.php` in a browser (GET request, no increment).

Both `html2canvas` and `jsPDF` are loaded from a CDN in `index.html`, so no
build step or npm install is needed.

## Deploying via Kudu (Azure App Service)

1. Make sure your App Service has **PHP** enabled (Configuration → General
   settings → Stack settings → PHP version), since `counter.php` needs a PHP
   runtime.
2. Open the Kudu dashboard: `https://<your-app-name>.scm.azurewebsites.net`.
3. Go to **Debug console → CMD** (or Bash) and navigate to `site/wwwroot`.
4. Drag-and-drop the entire `assinment-cover` folder onto the Kudu file
   listing (or use **Zip Push Deploy** with a zipped copy of this folder).
5. Confirm the final path is `site/wwwroot/assinment-cover/...` — i.e. the
   `img` folder and `counter.php` sit directly inside `assinment-cover`.
6. Visit `https://<your-app-name>.azurewebsites.net/assinment-cover/` to use
   the generator.
7. The first download will auto-create `counter_data.json` if it isn't
   already there. Make sure the app's file system allows writes (App Service
   local storage is writable by default — no extra config needed).

## Customizing

- **Logo**: replace `img/sulogo.png` (keep it roughly 700×800 for crisp
  print quality; transparent background recommended).
- **University name / colors**: edit the `.cp-university` text in
  `index.html` and the `--blue` / `--navy` variables at the top of
  `style.css`.
- **Extra fields**: add an `<input>` in the form, a matching `<span>` in the
  `#cover-page` preview, and one line in the `fieldMap` object in
  `script.js`.
- **Session**: the semester dropdown (Spring/Summer/Fall) is combined with
  the current year automatically — the year field is read-only and always
  reflects `new Date().getFullYear()`, so it never needs manual updating.
- **Designation**: defaults to "Assignment Teacher" but stays editable.
- **Experiment / Project Name**: a dedicated field shown as its own line on
  the cover page, right under the document title (useful for lab reports
  or project submissions).
- **Signatures**: "Signature of Student" and "Signature of Teacher" lines
  are pinned to the bottom of the printed page automatically.
