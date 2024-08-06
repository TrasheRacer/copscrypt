## Copscrypt

> Free Open Source Sousveillance

### Quickstart

Find and replace example server IP address: `192.168.178.103`

0. Generate a self-signed certificate for the correct host with `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=192.168.178.103"` in `ssl/`
1. Install with `pnpm`
2. Run with `node server.js`
3. Import certificate into browser for all peers
4. Go to `https://192.168.178.103:3000/`

### Styleguide

- Lowercase docs (including comments) everywhere but Markdown
