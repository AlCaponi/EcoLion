# Testing GPS Route Tracking

## Mock Mode Testing

To test the route tracking feature without needing to physically move around, use the mock mode which simulates GPS movement.

### How to Enable Mock Mode

Add `?mock=true` to the URL:

```
http://localhost:5173/?mock=true
```

### What Happens in Mock Mode

1. **Simulated Route**: The system follows a predefined circular path around Winterthur city center
2. **Automatic Updates**: New GPS points are added every 2 seconds
3. **Visual Feedback**: 
   - Yellow warning banner appears: "🧪 Test-Modus: Simulierte GPS-Daten werden verwendet"
   - Console logs show each mock point being added
4. **Realistic Data**: Each point includes realistic accuracy values (5-25m)

### Testing Steps

1. **Start the application**:
   ```bash
   docker compose up --build -d
   ```

2. **Open in browser with mock mode**:
   ```
   http://localhost:5173/?mock=true
   ```

3. **Start an activity**:
   - Click any activity button (e.g., "Gehen", "Velo", "ÖV")
   - Watch the yellow test banner appear
   - See console logs: `🧪 Mock tracking started - simulating movement`

4. **Watch the route appear**:
   - The map will show a red line appearing every 2 seconds
   - The line follows a circular path around Winterthur
   - Check browser console for point logs: `📍 Mock point 1/9: 47.500000, 8.720000`

5. **Stop the activity**:
   - Click the red "STOP" button
   - Check console: `🛑 Location tracking stopped. Total points: X`
   - The route data is sent to the backend

6. **Verify in database** (optional):
   ```bash
   docker compose exec backend node -e "
   const db = require('better-sqlite3')('/app/data/db.sqlite');
   const activity = db.prepare('SELECT gpx_json FROM activities ORDER BY id DESC LIMIT 1').get();
   console.log(JSON.parse(activity.gpx_json));
   "
   ```

### Mock Route Path

The simulated route is a circular path:
- Start: 47.5000, 8.7200 (Winterthur center)
- 9 total points forming a loop
- ~500m total distance
- Points added every 2 seconds

### Real GPS Testing

To test with real GPS:

1. **Remove the mock parameter**:
   ```
   http://localhost:5173/
   ```

2. **Grant location permission** when prompted

3. **Move around** physically:
   - Walk, bike, or drive
   - GPS points are recorded automatically based on position changes
   - Minimum accuracy: 50m (lower accuracy points are filtered out)

### Console Logs

**Mock Mode:**
```
🧪 Mock tracking started - simulating movement
📍 Mock point 1/9: 47.500000, 8.720000
📍 Mock point 2/9: 47.501000, 8.721000
...
🛑 Location tracking stopped. Total points: 9
```

**Real GPS Mode:**
```
🎯 Location tracking started
📍 Tracked point: 47.500123, 8.720456 (±12.3m)
📍 Tracked point: 47.500234, 8.720567 (±15.1m)
...
🛑 Location tracking stopped. Total points: 15
```

### Troubleshooting

**No route appearing?**
- Check browser console for errors
- Verify `?mock=true` is in the URL
- Make sure you started an activity

**Real GPS not working?**
- Check browser location permissions
- Ensure HTTPS or localhost (required for geolocation API)
- Check GPS is enabled on device

**Route not saved to backend?**
- Check network tab for `/v1/activity/stop` request
- Verify the request includes `gpx` payload
- Check backend logs: `docker compose logs backend`

### Expected Data Structure

The route data sent to backend:

```json
{
  "activityId": 123,
  "stopTime": "2026-02-07T10:30:00.000Z",
  "gpx": {
    "points": [
      {
        "lat": 47.5000,
        "lng": 8.7200,
        "timestamp": "2026-02-07T10:25:00.000Z",
        "accuracy": 12.5
      },
      {
        "lat": 47.5010,
        "lng": 8.7210,
        "timestamp": "2026-02-07T10:25:02.000Z",
        "accuracy": 8.3
      }
      // ... more points
    ]
  }
}
```

### Performance Notes

- **Mock Mode**: Very lightweight, no GPS hardware usage
- **Real GPS**: Battery impact depends on tracking duration
- **Map Rendering**: Red polyline updates smoothly with new points
- **Data Size**: ~100 bytes per point, typical route = 1-5 KB

---

## Quick Test Commands

```bash
# Start services
docker compose up --build -d

# Open mock mode in browser
open http://localhost:5173/?mock=true

# Check latest activity in database
docker compose exec backend node -e "const db = require('better-sqlite3')('/app/data/db.sqlite'); console.log(db.prepare('SELECT * FROM activities ORDER BY id DESC LIMIT 1').get());"

# View backend logs
docker compose logs -f backend

# Stop services
docker compose down
```
