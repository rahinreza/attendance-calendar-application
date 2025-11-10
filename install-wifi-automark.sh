#!/bin/bash
# WiFi Attendance Auto-Marker - Easy Installer
# Created by: Rahin Reza
# Usage: curl -sSL https://raw.githubusercontent.com/rahinreza/attendance-app/main/install-wifi-automark.sh | bash

echo "=========================================="
echo "WiFi Attendance Auto-Marker Installer"
echo "=========================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script only works on macOS"
    exit 1
fi

# Get user's work WiFi name
echo "📡 What is your work WiFi name?"
echo "   (Default: CCemployee)"
read -p "Work WiFi name (press Enter for default): " work_wifi

if [ -z "$work_wifi" ]; then
    work_wifi="CCemployee"
fi

# Get user's S3 URL
echo ""
echo "🌐 What is your attendance app URL?"
echo "   (Default: http://rahin-attendance-app.s3-website-us-east-1.amazonaws.com)"
read -p "App URL (press Enter for default): " app_url

if [ -z "$app_url" ]; then
    app_url="http://rahin-attendance-app.s3-website-us-east-1.amazonaws.com"
fi

echo ""
echo "⚙️  Installing WiFi attendance auto-marker..."

# Create Scripts directory if it doesn't exist
mkdir -p "$HOME/Library/Scripts"
mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/Library/Logs"

# Create the attendance marker script
cat > "$HOME/Library/Scripts/wifi-attendance-marker.sh" << 'EOFSCRIPT'
#!/bin/bash
# WiFi-based Attendance Auto-Marker
# This script runs automatically when WiFi changes

# Configuration
WORK_WIFI_NAME="__WORK_WIFI__"
ATTENDANCE_APP_URL="__APP_URL__"
LOG_FILE="$HOME/Library/Logs/wifi-attendance.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Log function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_message "Script triggered - checking WiFi..."

# Get current WiFi network name (SSID) on macOS
current_wifi=$(/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk '/ SSID/ {print substr($0, index($0, $2))}')

if [ -z "$current_wifi" ]; then
    log_message "Not connected to WiFi"
    exit 0
fi

log_message "Connected to: $current_wifi"

# Convert to lowercase for case-insensitive comparison
current_wifi_lower=$(echo "$current_wifi" | tr '[:upper:]' '[:lower:]')
work_wifi_lower=$(echo "$WORK_WIFI_NAME" | tr '[:upper:]' '[:lower:]')

# Check if connected to work WiFi (case-insensitive)
if [ "$current_wifi_lower" = "$work_wifi_lower" ]; then
    log_message "Work WiFi ($WORK_WIFI_NAME) detected! Auto-marking attendance..."
    
    # Get today's date in YYYY-MM-DD format
    today=$(date +%Y-%m-%d)
    
    # Open the app with auto-mark parameter in background
    open -g "${ATTENDANCE_APP_URL}?automark=true&date=${today}&wifi=verified"
    
    log_message "Attendance app opened with auto-mark enabled"
    
    # Show notification
    osascript -e 'display notification "Attendance marked automatically for '"$current_wifi"'" with title "Work WiFi Detected ✓" sound name "Glass"'
else
    log_message "Not on work WiFi (connected to: $current_wifi)"
fi
EOFSCRIPT

# Replace placeholders
sed -i '' "s|__WORK_WIFI__|$work_wifi|g" "$HOME/Library/Scripts/wifi-attendance-marker.sh"
sed -i '' "s|__APP_URL__|$app_url|g" "$HOME/Library/Scripts/wifi-attendance-marker.sh"

# Make script executable
chmod +x "$HOME/Library/Scripts/wifi-attendance-marker.sh"

# Create LaunchAgent plist
cat > "$HOME/Library/LaunchAgents/com.rahin.wifi-attendance.plist" << EOFPLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.rahin.wifi-attendance</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>$HOME/Library/Scripts/wifi-attendance-marker.sh</string>
    </array>
    
    <key>WatchPaths</key>
    <array>
        <string>/Library/Preferences/SystemConfiguration</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/wifi-attendance-out.log</string>
    
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/wifi-attendance-error.log</string>
</dict>
</plist>
EOFPLIST

# Unload existing agent if it exists
launchctl unload "$HOME/Library/LaunchAgents/com.rahin.wifi-attendance.plist" 2>/dev/null

# Load the LaunchAgent
launchctl load "$HOME/Library/LaunchAgents/com.rahin.wifi-attendance.plist"

echo ""
echo "✅ Installation complete!"
echo ""
echo "=========================================="
echo "Configuration:"
echo "  Work WiFi: $work_wifi"
echo "  App URL: $app_url"
echo "=========================================="
echo ""
echo "🎉 The auto-marker is now active!"
echo ""
echo "📝 What happens next:"
echo "   • When you connect to '$work_wifi', your attendance will be marked automatically"
echo "   • You'll see a notification confirming the auto-mark"
echo "   • Logs are saved to: ~/Library/Logs/wifi-attendance.log"
echo ""
echo "🔧 To uninstall later, run:"
echo "   launchctl unload ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist"
echo "   rm ~/Library/LaunchAgents/com.rahin.wifi-attendance.plist"
echo "   rm ~/Library/Scripts/wifi-attendance-marker.sh"
echo ""
echo "📖 View logs: tail -f ~/Library/Logs/wifi-attendance.log"
echo ""
