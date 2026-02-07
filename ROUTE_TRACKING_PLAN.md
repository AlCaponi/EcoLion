# Route Tracking Implementation Plan

## Overview
Add GPS route tracking during activity recording to visualize the user's path on a map and store it for future reference.

## Current State Analysis

### ✅ What's Already in Place:
1. **Database Schema**: `activities` table has `gpx_json TEXT` column for storing route data
2. **Backend API**: `stopActivity` endpoint already accepts optional `gpx` parameter
3. **Frontend Types**: `StopActivityRequestDTO` already has optional `gpx?: unknown` field
4. **Live Location**: GPS location is already being acquired for current position marker
5. **Map Display**: Leaflet map with CartoDB tiles already showing during recording

### 🔧 What Needs to Be Built:

## Implementation Plan

---

## **Phase 1: Frontend - GPS Tracking Service** ⭐ START HERE

### 1.1 Create Location Tracking Hook
**File**: `eco-loewe-pwa/src/hooks/useLocationTracking.ts`

**Purpose**: Custom React hook to track GPS coordinates at regular intervals

**Features**:
- Start/stop tracking
- Collect lat/lng points every X seconds (configurable, default: 5-10 seconds)
- Store points in state array: `{ lat, lng, timestamp, accuracy? }[]`
- Handle geolocation errors gracefully
- Battery-friendly: use `navigator.geolocation.watchPosition()` with appropriate options

**Interface**:
```typescript
interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string; // ISO
  accuracy?: number; // meters
}

interface UseLocationTrackingReturn {
  points: LocationPoint[];
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => LocationPoint[];
  clearPoints: () => void;
  error: string | null;
}
```

**Implementation Notes**:
- Use `watchPosition` with `enableHighAccuracy: true`, `maximumAge: 5000`
- Filter out low-accuracy points (> 50m accuracy)
- Handle browser permission requests
- Clean up on unmount

---

## **Phase 2: Frontend - Map Visualization**

### 2.1 Add Polyline to Map
**File**: `eco-loewe-pwa/src/pages/HomePage.tsx`

**Changes**:
- Import `Polyline` from `react-leaflet`
- Pass `points` array from tracking hook to map
- Render polyline: `<Polyline positions={points.map(p => [p.lat, p.lng])} color="#e74c3c" weight={4} />`
- Update map center to follow latest point (optional, could be distracting)

**Visual Style**:
- Red line (`#e74c3c`) to match app theme
- 4px weight for visibility
- Smooth line with `smoothFactor={1.0}`

---

## **Phase 3: Frontend - Integration with Activity Recording**

### 3.1 Update HomePage Component
**File**: `eco-loewe-pwa/src/pages/HomePage.tsx`

**Changes**:
1. Import and use `useLocationTracking` hook
2. Start tracking when activity starts: `startTracking()` in `handleStart()`
3. Stop tracking and get points when stopping: `const routePoints = stopTracking()` in `handleStop()`
4. Pass `routePoints` to `stopActivity` API call

**Code Structure**:
```typescript
const { points, startTracking, stopTracking } = useLocationTracking();

const handleStart = async (id: string) => {
  // ... existing code ...
  startTracking(); // NEW
  setActiveActivity(type);
}

const handleStop = async () => {
  const routePoints = stopTracking(); // NEW
  
  if (currentActivityId) {
    await Api.stopActivity({ 
      activityId: currentActivityId, 
      stopTime: new Date().toISOString(),
      gpx: { points: routePoints } // NEW - send route data
    });
  }
  // ... rest of existing code ...
}
```

---

## **Phase 4: Backend - GPX Data Type Definition**

### 4.1 Define GPX Structure
**File**: `backend/src/db.js` (add comment/documentation)

**GPX Format** (simplified):
```javascript
{
  points: [
    { lat: 47.5001, lng: 8.7201, timestamp: "2026-02-07T10:00:00Z", accuracy: 10 },
    { lat: 47.5002, lng: 8.7202, timestamp: "2026-02-07T10:00:05Z", accuracy: 12 },
    // ... more points
  ]
}
```

**No backend changes needed** - the current implementation already:
- Accepts `gpx` parameter in `stopActivity()`
- Stores it as JSON in `gpx_json` column via `JSON.stringify(gpx)`
- Returns it via `safeParseJson(row.gpx_json)`

---

## **Phase 5: Frontend - TypeScript Type Updates**

### 5.1 Define GPX Types
**Files**: 
- `eco-loewe-pwa/src/shared/api/types.ts`
- `api-tests/src/contracts/types.ts` (must stay in sync!)

**Changes**:
```typescript
export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy?: number;
}

export interface GPXData {
  points: LocationPoint[];
}

// Update existing interface:
export interface StopActivityRequestDTO {
  activityId: number;
  stopTime: string;
  gpx?: GPXData; // Changed from 'unknown' to 'GPXData'
  proofs?: object[];
}

// Update response types similarly
export interface StopActivityResponseDTO {
  // ... existing fields ...
  gpx?: GPXData; // Changed from 'unknown'
}
```

---

## **Phase 6: Testing & Validation**

### 6.1 Frontend Testing
**Manual tests**:
1. Start activity → verify GPS tracking starts
2. Walk/move around → verify polyline appears on map
3. Stop activity → verify route is sent to backend
4. Check browser console for any errors
5. Test with GPS denied → verify graceful error handling

### 6.2 Backend Testing
**Verify**:
1. `activities` table `gpx_json` column contains point data
2. `GET /v1/activity/:id` returns GPX data
3. Invalid coordinates are handled (lat/lng bounds check)

### 6.3 API Contract Tests
**File**: `api-tests/src/tests/activity.test.ts` (create if doesn't exist)

**Tests**:
- Start activity returns valid activityId
- Stop activity with GPX data succeeds
- Stop activity without GPX data succeeds (optional field)
- Retrieve activity returns GPX data

---

## **Phase 7: Enhancements (Future)**

### 7.1 Route History View
- New page/modal to view past routes on map
- Load GPX data from completed activities
- Display activity metadata (date, duration, distance)

### 7.2 Distance Calculation
- Use Haversine formula to calculate actual distance from GPS points
- Replace backend's estimated distance with real tracked distance
- Update `distance_meters` in activities table

### 7.3 Battery Optimization
- Reduce tracking frequency for longer activities
- Pause tracking when device is stationary
- Use lower accuracy mode for non-critical activities

### 7.4 Privacy Controls
- Option to disable route tracking
- Auto-delete old route data after X days
- Blur/simplify routes near home/work addresses

---

## Configuration Constants

**Recommended Settings**:
```typescript
const TRACKING_CONFIG = {
  intervalSeconds: 5,        // Record point every 5 seconds
  minAccuracyMeters: 50,     // Ignore points with accuracy > 50m
  enableHighAccuracy: true,  // Use GPS (not just WiFi/cell towers)
  maximumAge: 5000,          // Don't use cached positions older than 5s
  timeout: 10000,            // Give up on location request after 10s
};
```

---

## File Checklist

### New Files to Create:
- [ ] `eco-loewe-pwa/src/hooks/useLocationTracking.ts` - GPS tracking hook

### Files to Modify:
- [ ] `eco-loewe-pwa/src/pages/HomePage.tsx` - Integrate tracking + polyline
- [ ] `eco-loewe-pwa/src/shared/api/types.ts` - Add GPXData types
- [ ] `api-tests/src/contracts/types.ts` - Add GPXData types (keep in sync!)

### Files to Test:
- [ ] Backend: Verify `gpx_json` is stored correctly
- [ ] Frontend: Test polyline rendering
- [ ] API: Test stopActivity with GPX data

---

## Step-by-Step Execution Order

1. ✅ Create this plan document
2. 📝 Create `useLocationTracking.ts` hook (Phase 1)
3. 🧪 Test hook in isolation (console.log points)
4. 🗺️ Add Polyline to map (Phase 2)
5. 🔗 Integrate with activity start/stop (Phase 3)
6. 📘 Update TypeScript types (Phase 5)
7. ✅ Test end-to-end flow (Phase 6)
8. 🚀 Commit and push to feature branch

---

## Estimated Effort
- **Phase 1-3 (Core Feature)**: 2-3 hours
- **Phase 4-5 (Types & Documentation)**: 30 minutes
- **Phase 6 (Testing)**: 1 hour
- **Total**: ~4 hours

## Success Criteria
✅ User can see their route as a red line on the map during recording  
✅ Route data is saved to database when activity stops  
✅ No errors in browser console  
✅ Works on mobile devices with GPS permission granted  
✅ Graceful degradation when GPS is unavailable  

---

**Next Action**: Proceed with Phase 1 - Create `useLocationTracking.ts` hook
