# Voicio — Full Deployment Guide
**Stack:** Cloudflare Pages (frontend) + PocketBase on xcloud VPS (backend)

---

## Step 1 — Prepare your GitHub repo

On your local machine, in the Voicio project folder:

```bash
git init
git add .
git commit -m "Initial Voicio deploy"
```

Create a new repo at github.com (call it `voicio`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/voicio.git
git branch -M main
git push -u origin main
```

Your repo should contain:
```
voicio/
├── landing.html
├── auth.html
├── index.html
└── _redirects
```

---

## Step 2 — PocketBase on xcloud VPS

SSH into your VPS:

```bash
ssh root@104.238.133.219
```

### Install PocketBase

```bash
mkdir -p /opt/voicio && cd /opt/voicio
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase
rm pocketbase_0.22.0_linux_amd64.zip
```

### Create systemd service

```bash
nano /etc/systemd/system/voicio-pb.service
```

Paste:

```ini
[Unit]
Description=Voicio PocketBase
After=network.target

[Service]
User=root
WorkingDirectory=/opt/voicio
ExecStart=/opt/voicio/pocketbase serve --http="127.0.0.1:8090"
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable voicio-pb
systemctl start voicio-pb
systemctl status voicio-pb   # Should show: active (running)
```

### Nginx config for api.voicio.app

```bash
nano /etc/nginx/sites-available/voicio-api
```

Paste:

```nginx
server {
    listen 80;
    server_name api.voicio.app;

    location / {
        proxy_pass          http://127.0.0.1:8090;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade     $http_upgrade;
        proxy_set_header    Connection  'upgrade';
        proxy_set_header    Host        $host;
        proxy_set_header    X-Real-IP   $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;
        proxy_cache_bypass  $http_upgrade;
        proxy_read_timeout  360s;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/voicio-api /etc/nginx/sites-enabled/
nginx -t        # Must say: syntax is ok
systemctl reload nginx
```

---

## Step 3 — Cloudflare DNS

In your Cloudflare dashboard for voicio.app:

| Type | Name | Content              | Proxy   |
|------|------|----------------------|---------|
| A    | api  | 104.238.133.219      | ✅ Proxied (orange cloud) |

SSL/TLS settings → set mode to **Full** (not Full Strict).

Verify it works: visit `https://api.voicio.app/_/`
→ You should see the PocketBase admin UI.

**Create your admin account immediately** — first person to visit `/_/` sets the admin password.

---

## Step 4 — Configure PocketBase

In the PocketBase admin UI at `https://api.voicio.app/_/`:

### Add custom fields to the users collection

Go to **Collections → users → Edit collection** and add these fields:

| Field name  | Type   | Required |
|-------------|--------|----------|
| firstName   | Text   | No       |
| lastName    | Text   | No       |
| headline    | Text   | No       |
| industry    | Text   | No       |
| goal        | Text   | No       |
| plan        | Text   | No       |

### Enable email auth
Settings → Auth → Email/Password → **Enabled** ✅

### Enable OAuth (optional — for Google/LinkedIn buttons)
Settings → Auth providers:

**Google:**
1. Go to console.cloud.google.com → Credentials → Create OAuth 2.0 Client
2. Authorised redirect URI: `https://api.voicio.app/api/oauth2-redirect`
3. Paste Client ID and Secret into PocketBase

**LinkedIn:**
1. Go to linkedin.com/developers → Create app
2. Redirect URL: `https://api.voicio.app/api/oauth2-redirect`
3. Paste Client ID and Secret into PocketBase

### Set CORS to allow your Cloudflare domain
Settings → Application settings → Trusted domains:
```
https://voicio.app
https://www.voicio.app
```

---

## Step 5 — Deploy to Cloudflare Pages

1. Go to **dash.cloudflare.com → Pages → Create a project**
2. Connect to Git → select your `voicio` GitHub repo
3. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/`
4. Click **Save and Deploy**

### Connect custom domain
Pages project → Custom domains → Add domain → `voicio.app`

Cloudflare will automatically configure the DNS — since your domain is already on Cloudflare it happens instantly.

---

## Step 6 — Verify everything works

Test this sequence end to end:

```
voicio.app            → landing page loads ✓
voicio.app/auth.html  → sign up form loads ✓
Create account        → redirects to index.html ✓
index.html            → app loads, avatar shows initials ✓
Logout button         → returns to auth.html ✓
api.voicio.app/_/     → PocketBase admin, user appears in users collection ✓
```

---

## Ongoing maintenance

```bash
# Check PocketBase logs
journalctl -u voicio-pb -f

# Restart PocketBase
systemctl restart voicio-pb

# Update PocketBase (download new binary, restart service)
cd /opt/voicio
wget https://github.com/pocketbase/pocketbase/releases/download/vX.X.X/pocketbase_X.X.X_linux_amd64.zip
unzip -o pocketbase_X.X.X_linux_amd64.zip
systemctl restart voicio-pb

# Deploy frontend updates — just push to GitHub
git add . && git commit -m "Update" && git push
# Cloudflare Pages auto-deploys in ~30 seconds
```

---

## Cost summary

| Service          | Cost         |
|------------------|--------------|
| xcloud VPS       | Already paying — no new cost |
| PocketBase       | Free, open source |
| Cloudflare Pages | Free tier (unlimited sites, 500 builds/month) |
| Cloudflare DNS   | Free |
| **Total new cost** | **$0** |

---

## File map

```
voicio.app/           → Cloudflare Pages
  landing.html        → Marketing / home page
  auth.html           → Login, signup, forgot password (PocketBase SDK)
  index.html          → App (session-gated, PocketBase token auth)
  _redirects          → Routes / → landing.html

api.voicio.app/       → xcloud VPS → Nginx → PocketBase :8090
  /_/                 → PocketBase admin UI
  /api/collections/   → REST API (used by auth.html)
```
