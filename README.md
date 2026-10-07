# stillsatdown

Personal contact app with a Node server, public contact tools and a privacy policy.

Run `npm start` to serve port 3000. Railway supplies its own `PORT`.
Run `npm test` to check routing, input validation and private path denial.

Routes: `/`, `/contact`, `/about`, `/privacy`, `/healthz`.
The contact tool prepares an email in the visitor's mail client. It does not send
or store submissions. Delivery uses the existing digestnews24 mailbox. Custom
domain email, account access, calendar booking and mailbox integration are not
implemented in this public app. The dashboard stays private on Tailscale.

Deploy to the dedicated Railway service using `railway.json` and `Dockerfile`.
The original root HTML and GitHub Pages configuration remain as a fallback until
the new domain routing is verified. The runtime serves only `public/` via an
explicit route allowlist and contains no mailbox or private dashboard credentials.
