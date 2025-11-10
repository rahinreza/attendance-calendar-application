# Multi-User File-Based Storage Setup

## Overview
This implementation uses a simple Node.js API server with file-based storage. Each user gets a unique session ID stored in a cookie, and their attendance data is saved in a separate JSON file on the server.

## Features
✅ No database required
✅ Each user's data stored in separate file
✅ Cookie-based session management
✅ Automatic fallback to localStorage if server is down
✅ Data persists across browser sessions
✅ Works for multiple users simultaneously

## Setup Instructions

### 1. Install API Server Dependencies

```bash
cd /Users/rreza200/Downloads/attendance-app
npm install express cors cookie-parser
```

### 2. Start the API Server

```bash
node server-api.js
```

You should see:
```
📁 File-based API server running on http://localhost:3000
📂 User data stored in: /path/to/user-data
```

### 3. Start the Angular App (in another terminal)

```bash
npm start
```

### 4. Access the App

Open http://localhost:4200 in your browser

## How It Works

### User Identification
- When a user first visits, the server generates a unique session ID
- Session ID is stored in an HTTP-only cookie (secure, can't be accessed by JavaScript)
- Each subsequent request includes this cookie for user identification

### Data Storage
- User data stored in: `user-data/{sessionId}.json`
- Each file contains: `{ year: 2025, attendance: [[date, isPresent], ...] }`
- Files are created/updated automatically

### Multi-User Support
- Each browser/device gets its own session ID
- Multiple users can use the app simultaneously
- Each user sees only their own data
- Data persists even if browser is closed

### Fallback Mechanism
- If API server is down, app falls back to localStorage
- User can still mark attendance locally
- Data syncs to server when it becomes available again

## File Structure

```
attendance-app/
├── server-api.js          # API server (runs on port 3000)
├── user-data/             # Created automatically
│   ├── abc123...json      # User 1's data
│   ├── def456...json      # User 2's data
│   └── ...
└── src/                   # Angular app (runs on port 4200)
```

## API Endpoints

### GET /api/attendance
- Load user's attendance data
- Returns: `{ year: number, attendance: [[string, boolean]] }`

### POST /api/attendance
- Save user's attendance data
- Body: `{ year: number, attendance: [[string, boolean]] }`

### DELETE /api/attendance
- Clear user's attendance data
- Deletes the user's file

### GET /api/health
- Check server status
- Returns: `{ status: 'ok', timestamp: '...' }`

## Production Deployment

### For Internal Server (Same Network):
1. Deploy both Angular app and API server on your server
2. Update `apiUrl` in component to your server's IP:
   ```typescript
   private apiUrl = 'http://YOUR_SERVER_IP:3000/api/attendance';
   ```
3. Run both servers with PM2 or similar process manager:
   ```bash
   pm2 start server-api.js --name attendance-api
   pm2 start npm --name attendance-app -- start
   ```

### For Internet Deployment:
1. Use HTTPS (Let's Encrypt/Certbot)
2. Update CORS settings in `server-api.js`
3. Consider adding rate limiting
4. Set up automatic backups of `user-data/` folder

## Backup & Restore

### Backup User Data
```bash
tar -czf attendance-backup-$(date +%Y%m%d).tar.gz user-data/
```

### Restore User Data
```bash
tar -xzf attendance-backup-YYYYMMDD.tar.gz
```

## Security Notes

- ✅ Session IDs are cryptographically secure (32 bytes random)
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ Each user can only access their own data
- ⚠️  No authentication - anyone can create a session
- ⚠️  Data stored in plain JSON (not encrypted)

### For More Security:
Consider adding:
- Username/password login
- Data encryption at rest
- HTTPS/TLS
- Rate limiting
- Session expiration

## Troubleshooting

### "Failed to load attendance data"
- Check if API server is running on port 3000
- Check browser console for CORS errors
- App will fallback to localStorage automatically

### "Port 3000 already in use"
- Stop existing process: `lsof -ti:3000 | xargs kill -9`
- Or change port in server-api.js and app.component.ts

### Users seeing each other's data
- Clear browser cookies and refresh
- Check that sessionId cookie is being set

## Monitoring

View user data files:
```bash
ls -lh user-data/
# Shows all user files with sizes

cat user-data/SESSIONID.json
# View specific user's data
```

Count active users:
```bash
ls user-data/ | wc -l
```
