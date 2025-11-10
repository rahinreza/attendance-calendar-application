# WiFi Attendance Auto-Marker Setup

Automatically mark your attendance when you connect to your work WiFi!

## ⚡ Quick Install (One Command)

Open Terminal and run:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/rahinreza/Attendance-Calendar-Application/main/install-wifi-automark.sh)
```

OR download and run locally:

```bash
curl -O https://raw.githubusercontent.com/rahinreza/Attendance-Calendar-Application/main/install-wifi-automark.sh
chmod +x install-wifi-automark.sh
./install-wifi-automark.sh
```

## 📋 What You'll Need

1. Your **work WiFi name** (e.g., "CCemployee")
2. Your **attendance app URL** (default: http://rahin-attendance-app.s3-website-us-east-1.amazonaws.com)

## ✨ How It Works

1. **Install once** - runs the installer script
2. **Forget about it** - automatically marks attendance when you connect to work WiFi
3. **Get notified** - see a popup confirming your attendance was marked

## 🔧 Manual Installation (Alternative)

If you prefer to set it up manually:

### Step 1: Download the script
```bash
mkdir -p ~/Library/Scripts
curl -o ~/Library/Scripts/wifi-attendance-marker.sh https://raw.githubusercontent.com/rahinreza/Attendance-Calendar-Application/main/wifi-attendance-marker.sh
chmod +x ~/Library/Scripts/wifi-attendance-marker.sh
```

### Step 2: Edit the configuration
```bash
nano ~/Library/Scripts/wifi-attendance-marker.sh
```

Change these lines:
```bash
WORK_WIFI_NAME="YourWorkWiFiName"  # Change to your WiFi name
ATTENDANCE_APP_URL="http://rahin-attendance-app.s3-website-us-east-1.amazonaws.com"
```

### Step 3: Set up auto-run
```bash
mkdir -p ~/Library/LaunchAgents
curl -o ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist https://raw.githubusercontent.com/rahinreza/Attendance-Calendar-Application/main/com.rahin.wifi-attendance.plist
launchctl load ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist
```

## 📊 View Logs

To see when the script runs:

```bash
tail -f ~/Library/Logs/wifi-attendance.log
```

## 🗑️ Uninstall

To remove the auto-marker:

```bash
launchctl unload ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist
rm ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist
rm ~/Library/Scripts/wifi-attendance-marker.sh
rm ~/Library/Logs/wifi-attendance*.log
```

## ❓ Troubleshooting

**Not working?**
1. Check logs: `tail -f ~/Library/Logs/wifi-attendance.log`
2. Verify WiFi name matches exactly (case-insensitive)
3. Make sure you're on macOS
4. Restart the agent: 
   ```bash
   launchctl unload ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist
   launchctl load ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist
   ```

**Test manually:**
```bash
~/Library/Scripts/wifi-attendance-marker.sh
```

## 🔒 Security

- Script only runs on your Mac
- Only marks attendance when connected to YOUR work WiFi
- Uses URL parameters to communicate with the app
- No passwords or sensitive data stored

## 💡 Notes

- Works only on macOS
- Requires the attendance app to be accessible
- Won't mark weekends or holidays automatically
- Won't overwrite existing attendance marks
- Completely optional - app works normally without it

---

Created by Rahin Reza | [GitHub](https://github.com/rahinreza/Attendance-Calendar-Application)
