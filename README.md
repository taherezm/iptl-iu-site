GitHub Pages: https://taherezm.github.io/iptl-iu-site/

Litigation Tracker: https://taherezm.github.io/iptl-iu-site/tools/litigation-tracker/

# IU IP & Technology Law Society Website

Static website for the IU IP & Technology Law Society, including the tools section and AI/IP litigation tracker.

## Form Handling

The application and publication forms are wired for Basin so they can run on GitHub Pages.

Configured endpoints:

- Membership applications: `https://usebasin.com/f/e2032128a50b`
- Publication submissions: `https://usebasin.com/f/eda739bd091b`

The forms use `enctype="multipart/form-data"` and `accept-charset="UTF-8"` for file uploads, plus Basin's standard `_gotcha` honeypot field. In Basin, enable notifications, allowed domains, and file upload settings for the production domain.
