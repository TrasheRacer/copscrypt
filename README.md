## Copscrypt

Free Open Source Sousveillance

> Even when only X% of snakes are deadly, you still carry antivenom

### Quickstart

Example server IP address: `192.168.178.103`

1. Generate a self-signed certificate with `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=192.168.178.103"` in `ssl/` after replacing `CN`
2. Install with `pnpm`
3. Run with `node server.js`
4. Go to `https://192.168.178.103:3000/` for correct host and import certificate

### Styleguide

- Lowercase docs (including comments) everywhere but Markdown
- See https://www.gov.uk/service-manual/service-standard
