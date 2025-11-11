# Pacman JioPhone - Ad Integration Flow

## Overview
This document describes the complete ad integration flow for the Pacman game on JioPhone using the JioGames SDK.

## Ad Types Implemented

1. **Banner Ad** - Shows at the bottom of the screen on page load
2. **Interstitial Ad** - Full-screen ad shown at key game moments
3. **Rewarded Video Ad** - Optional ad that gives extra life when watched

## Complete Ad Flow

```
Page Load
    ↓
Banner Ad Loads & Shows (bottom)
    ↓
User Clicks "Start Game" (Press 5/OK)
    ↓
gameCacheAd() → Cache Interstitial + Rewarded Ads
    ↓
Gameplay Starts
    ↓
┌─────────────────────────────────┬────────────────────────────┐
│ Level Complete                  │ Game Over (Lives = 0)      │
│    ↓                            │    ↓                       │
│ Show Interstitial Ad            │ Check Rewarded Ad Ready?   │
│    ↓                            │    ↓                       │
│ Re-cache Ads                    │ ┌─Yes → Show Confirm       │
│    ↓                            │ │   ↓                      │
│ Start Next Level                │ │ Accept → Play Rewarded   │
│                                 │ │   ↓                      │
│                                 │ │ Extra Life + Continue    │
│                                 │ │   ↓                      │
│                                 │ │ Re-cache Ads             │
│                                 │ │                          │
│                                 │ └─No/Reject → Post Score   │
│                                 │       ↓                    │
│                                 │   Show Interstitial Ad     │
│                                 │       ↓                    │
│                                 │   Re-cache Ads             │
└─────────────────────────────────┴────────────────────────────┘
```

## Implementation Details

### 1. Page Load - Banner Ad
**Location:** `jiogames_jp.js`
- Banner ad container is created and placed at bottom of screen
- Banner ad element (`<ins id="banner">`) is automatically created
- Banner ad is cached 2 seconds after page load
- Visible throughout gameplay

### 2. Game Start - Cache Ads
**Location:** `app.js` → `startNewGame()`
```javascript
if (typeof gameCacheAd === 'function') {
    gameCacheAd();
}
```
- Caches both Interstitial and Rewarded ads
- 5 second delay between caching each ad type
- Happens when user presses 5/OK to start

### 3. Level Complete - Interstitial Ad
**Location:** `app.js` → `completedLevel()`
```javascript
// Show interstitial ad
if (typeof showAd === 'function') {
    showAd();
}

// Re-cache ads after 1 second
setTimeout(function() {
    if (typeof gameCacheAd === 'function') {
        gameCacheAd();
    }
}, 1000);
```
- Shows interstitial ad when level is completed
- Re-caches both ad types after showing
- Continues to next level after 2 seconds

### 4. Game Over - Rewarded Video Flow
**Location:** `app.js` → `loseLife()` → `handleGameOver()`

#### 4a. Check Rewarded Ad Availability
```javascript
if (typeof isRVReady !== 'undefined' && isRVReady) {
    showRewardedAdConfirm();
} else {
    postScoreAndShowAd();
}
```

#### 4b. Show Confirmation Dialog
```javascript
var accept = confirm("Watch an ad to get an extra life and continue playing?");
```
- If accepted → Play rewarded ad
- If rejected → Post score and show interstitial

#### 4c. Rewarded Ad Completed - Grant Extra Life
**Location:** `app.js` → `gratifyUser()`
```javascript
user.addLife();
startLevel();
// Re-cache ads
```
- Called when user watches full rewarded ad
- Adds 1 extra life
- Continues gameplay
- Re-caches ads for next use

#### 4d. Rewarded Ad Skipped/Not Available - Game Over
**Location:** `app.js` → `postScoreAndShowAd()`
```javascript
// Post score
if (typeof postScore === 'function') {
    postScore(user.theScore());
}

// Show interstitial ad
if (typeof showAd === 'function') {
    showAd();
}

// Re-cache ads
setTimeout(function() {
    if (typeof gameCacheAd === 'function') {
        gameCacheAd();
    }
}, 1000);
```

## SDK Functions Used

### From JioGames SDK (`jiogames_jp.js`)

| Function | Purpose |
|----------|---------|
| `gameCacheAd()` | Cache both interstitial and rewarded ads |
| `showAd()` | Show interstitial ad |
| `showAdRewarded()` | Show rewarded video ad |
| `postScore(score)` | Submit player's score to leaderboard |
| `isRVReady` | Boolean flag indicating if rewarded ad is ready |

### SDK Callbacks (Modified for Pacman)

| Callback | Action |
|----------|--------|
| `GratifyReward()` | Calls `PACMAN.gratifyUser()` to add extra life |
| `rvSkipped()` | Calls `PACMAN.rvSkipped()` to handle ad skip |

## Game Functions (Exposed via PACMAN object)

| Function | Purpose |
|----------|---------|
| `PACMAN.gratifyUser()` | Add extra life and continue game |
| `PACMAN.rvSkipped()` | Handle rewarded ad skip - post score |

## User Methods Added

**Location:** `app.js` → `Pacman.User`
```javascript
function addLife() {
    lives += 1;
}
```
- Adds one life to the player
- Called when rewarded ad is completed

## Ad Spot Keys (Configuration)

**Location:** `jiogames_jp.js`
```javascript
var adSpotBanner_key = "banner123";           // Banner ad
var adSpotInterstitial_key = "4bot8u3y";      // Interstitial ad
var adSpotRewardedVideo_key = "dhrczu3s";     // Rewarded video ad
```

## Testing Checklist

- [ ] Banner ad loads on page load (bottom of screen)
- [ ] Ads cache when "Start Game" is pressed
- [ ] Interstitial ad shows on level complete
- [ ] Rewarded ad offer appears on game over (if available)
- [ ] Extra life granted when rewarded ad is watched completely
- [ ] Score posted when rewarded ad is skipped/rejected
- [ ] Interstitial ad shows after score post
- [ ] Ads re-cache after each display
- [ ] Game continues properly after all ad interactions

## Key Files Modified

1. **index.html** - Added banner ad container, removed instruction text
2. **app.js** - Added ad integration logic and reward functions
3. **jiogames_jp.js** - Modified callbacks to work with Pacman game

## Notes

- Ads are automatically re-cached after every display to ensure availability
- Rewarded ad confirmation uses native `confirm()` dialog
- All ad calls are wrapped in safety checks (`typeof` checks)
- Banner ad remains visible throughout gameplay
- User score is posted to JioGames leaderboard on game over

