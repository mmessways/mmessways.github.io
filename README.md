# MESSWAYS — Website package

## Included
- Responsive homepage with six training programmes and live course search.
- Six dedicated course pages: computer skills, Microsoft Office, Adobe/design, internet/digital skills, AI, and web/programming.
- MESSWAYS lowercase typographic wordmark (`mess` black, `ways` red); no separate or invented logo.
- Software/tool illustrations for each training programme, reused on the matching dedicated course page.
- Black, white and red design system, subtle CSS motion, reduced-motion support.
- WhatsApp contact: +230 54577976.
- Email contact: info.messways@gmail.com.
- Contact form submits to the configured Google Apps Script web app and displays a dedicated thank-you page after a successful save. No automatic WhatsApp tab is opened.

## Publish
Upload the complete contents of this folder to the same hosting directory. Keep the `assets` folder and all HTML, CSS and JS files together.

## Images
Course photography is loaded from Unsplash image CDN at resized widths and compressed quality to reduce transfer size. Unsplash states its images can be used free for commercial and non-commercial purposes; attribution is appreciated but not required. Image use remains subject to the Unsplash license and exclusions for third-party trademarks, identifiable people and depicted copyrighted works.

## Performance
- Course-card images use lazy loading and async decoding.
- Course hero images use eager loading for the visible first viewport.
- No external animation framework or heavy JavaScript dependency.
- CSS motion respects `prefers-reduced-motion`.
- Images are requested at 1100px width and quality 78.

## Langues et identité visuelle
Le français est la langue initiale du site. Le bouton EN/FR bascule l'ensemble des textes entre le français et l'anglais. Le nom MESSWAYS est composé en typographie HTML/CSS ; aucun fichier de logo fourni séparément n'est utilisé.


## Google Apps Script — clean enquiry form receiver
1. Open the Apps Script project associated with the supplied Web App deployment.
2. Replace the entire contents of `Code.gs` with `Google_Apps_Script_Code.gs` from this package.
3. The spreadsheet ID is already configured in the script. Do not remove it.
4. Run `resetMesswaysEnquiries()` once and authorise access. **This intentionally clears the old rows in the `Enquiries` tab** and rebuilds the sheet with the new, ordered columns. Other spreadsheet tabs are not touched.
5. Deploy > Manage deployments > Edit the existing Web App deployment; select **New version** and deploy. Keep execution as you and access set to Anyone.
6. Keep the existing Web App URL in `config.js`.
7. Submit a test enquiry and confirm that columns C, D and E contain the country code, local phone number and full phone number.

The `Enquiries` tab is rebuilt in this order: Date received, Full name, Country calling code, Local phone number, Full phone number, Specialised training, Package, Format, Current level, Objective / skill to develop, Source. The country code and phone fields are stored as text so the leading `+` is preserved. The reset does not delete the spreadsheet or any other tabs.

The website shows `merci.html` only after Apps Script confirms that the row was saved. The visitor can choose a country calling code, and WhatsApp is not opened automatically.

## WhatsApp delivery limitation
A website cannot silently send a form submission into a personal WhatsApp inbox. A pre-filled WhatsApp chat can be opened, but the visitor must press Send. Fully automated delivery requires the WhatsApp Business Platform / Cloud API and an authorised business number. The current setup stores enquiries in Google Sheets and shows the thank-you page; it does not auto-send WhatsApp messages.
