# Deployment (Ubuntu VM, PM2, Nginx)

The app runs as a normal Node.js process on a virtual machine. No serverless platform is used.

Tested layout: Ubuntu 24.04 LTS, Node.js 22 LTS, MongoDB 8 Community, PM2, Nginx.

## 1. Install system packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx curl gnupg

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Install MongoDB Community

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

MongoDB listens on `127.0.0.1` only by default. Keep it that way so the database is not exposed to the internet.

## 3. Get the code and configure it

```bash
git clone <your-repo-url> chess-club-manager
cd chess-club-manager
npm ci
cp .env.example .env.production
nano .env.production
```

Set in `.env.production`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/chess-club
JWT_SECRET=<output of: openssl rand -base64 48>
# Only set this to true once the site is served over HTTPS
COOKIE_SECURE=false
```

## 4. Build, seed, start

```bash
npm run build
npm run seed:prod          # creates the organizer account and sample data
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup                # run the command it prints so the app restarts on reboot
```

Change the seeded organizer password after the first login (Players > Club Organizer > Edit).

## 5. Nginx reverse proxy

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/chess-club-manager
sudo ln -s /etc/nginx/sites-available/chess-club-manager /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo ufw allow 'Nginx Full' && sudo ufw allow OpenSSH && sudo ufw enable
```

The app is now available at `http://<vm-public-ip>/`.

Optional HTTPS with a domain name:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your.domain.com
```

Then set `COOKIE_SECURE=true` in `.env.production` and run `pm2 restart chess-club-manager`.

## Updating

```bash
cd chess-club-manager
git pull
npm ci
npm run build
pm2 restart chess-club-manager
```
