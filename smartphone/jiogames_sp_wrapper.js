//#region "Variable"
var adSpotInterstitial = "qm19ko74";
var adSpotRewardedVideo = "s8omi3we";
var packageName = "com.kaifoundry.pacmanSP";
var isAdReady = false;
var isRVReady = false;
// Expose ad ready states globally so app.js can check them
window.isAdReady = false;
window.isRVReady = false;

var banner_ZoneKey = "5abvng4i";
var bannerPackageName = "com.kaifoundry.pacmanSP";

// Protection flags & cooldowns
// Prevent duplicate ad caching
var isCachingAds = false;
var lastCacheTime = 0;
var CACHE_COOLDOWN = 2000;  // 2 seconds cooldown between cache requests
var isCachingMidRoll = false;
var isCachingRewarded = false;
var lastMidRollCacheTime = 0;
var lastRewardedCacheTime = 0;

// Prevent duplicate ad showing
var isShowingAd = false;
var isShowingRewarded = false;
var lastShowAdTime = 0;
var lastShowRewardedTime = 0;
var SHOW_AD_COOLDOWN = 3000;  // 3 seconds cooldown between show ad requests

//#endregion


console.log("Jiogames: Initialized SDK!");
function postScore(score) {
    console.log("Jiogames: postScore() ",score);
    if(!score){
            console.log("Jiogames: postScore() no value ",score);
    }
    // window.topScore is integer
    if  (window.DroidHandler) {
        window.DroidHandler.postScore(score);
    }
}

function cacheAdMidRoll(adKeyId, source) {
    if(!adKeyId || !source){
        adKeyId? null: (console.log("Jiogames: cacheAdMidRoll() no adKeyId to cacheAd ",adKeyId));
        source? null : (console.log("Jiogames: cacheAdMidRoll() no source to cacheAd ",source));
        return;
    }
    
    // CRITICAL: Don't cache if we're in the middle of RV video reward flow
    if (window.skipCachingAfterRV || window.continuingFromRV) {
        console.log("JioGames: cacheAdMidRoll BLOCKED - RV video reward flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
        return;
    }
    
    // Prevent duplicate caching - check if already caching or recently cached
    var currentTime = Date.now();
    if (isCachingMidRoll || isAdReady || (currentTime - lastMidRollCacheTime < CACHE_COOLDOWN)) {
        console.log("JioGames: cacheAdMidRoll skipped - already caching, ready, or recently cached");
        return;
    }
    
    // Set caching flag and timestamp
    isCachingMidRoll = true;
    lastMidRollCacheTime = currentTime;
    console.log("JioGames: cacheAdMidRoll - Caching midroll ad");
    
    if (window.DroidHandler) {
        window.DroidHandler.cacheAd(adKeyId, source);
    }
    
    // Reset flag after reasonable time (backup safety)
    setTimeout(function() {
        isCachingMidRoll = false;
    }, 10000);
}

function showAdMidRoll(adKeyId, source) {
    if(!adKeyId || !source){
        adKeyId? null: (console.log("Jiogames: showAdMidRoll() no adKeyId to showAd ",adKeyId));
        source? null : (console.log("Jiogames: showAdMidRoll() no source to showAd ",source));
        return;
    }
    if (window.DroidHandler) {
        window.DroidHandler.showAd(adKeyId, source);
    }
}

function cacheAdRewardedVideo(adKeyId, source) {
    if (!adKeyId || !source) {
        adKeyId ? null : (console.log("Jiogames: cacheAdRewardedVideo() no adKeyId to cacheAd ", adKeyId));
        source ? null : (console.log("Jiogames: cacheAdRewardedVideo() no source to cacheAd ", source));
        return;
    }
    
    // CRITICAL: Don't cache if we're in the middle of RV video reward flow
    if (window.skipCachingAfterRV || window.continuingFromRV) {
        console.log("JioGames: cacheAdRewardedVideo BLOCKED - RV video reward flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
        return;
    }
    
    // Prevent duplicate caching
    var currentTime = Date.now();
    if (isCachingRewarded || isRVReady || (currentTime - lastRewardedCacheTime < CACHE_COOLDOWN)) {
        console.log("JioGames: cacheAdRewardedVideo skipped - already caching, ready, or recently cached");
        return;
    }
    
    // Also check if RV has been used - don't cache again if already used
    if (window.rvVideoUsedOnce) {
        console.log("JioGames: cacheAdRewardedVideo skipped - RV video already used once in this session");
        return;
    }
    
    // Set caching flag and timestamp
    isCachingRewarded = true;
    lastRewardedCacheTime = currentTime;
    console.log("JioGames: cacheAdRewardedVideo - Caching rewarded ad");
    
    if (window.DroidHandler) {
        window.DroidHandler.cacheAdRewarded(adKeyId, source);
    }
    
    // Reset flag after reasonable time (backup safety)
    setTimeout(function() {
        isCachingRewarded = false;
    }, 10000);
}

function showAdRewardedVideo(adKeyId, source) {
    if (!adKeyId || !source) {
        adKeyId ? null : (console.log("Jiogames: showAdRewardedVideo() no adKeyId to showAd ", adKeyId));
        source ? null : (console.log("Jiogames: showAdRewardedVideo() no source to showAd ", source));
        return;
    }
    if (window.DroidHandler) {
        window.DroidHandler.showAdRewarded(adKeyId, source);
    }
}

function getUserProfile() {
    console.log("Jiogames: getUserProfile called");
    if (window.DroidHandler) {
        window.DroidHandler.getUserProfile();
    }
}


window.onAdPrepared = function (adSpotKey) {
    console.log("JioGames: onAdPrepared "+adSpotKey.toString());
    
    if (adSpotKey == adSpotInterstitial) {
        isAdReady = true;
        window.isAdReady = true;
        isCachingMidRoll = false; // Reset caching flag when ad is ready
        console.log("JioGames: onAdPrepared Show Ads " + isAdReady);
    }
    
    if (adSpotKey == adSpotRewardedVideo) {
        isRVReady = true;
        window.isRVReady = true;
        isCachingRewarded = false; // Reset caching flag when ad is ready
        console.log("JioGames: onAdPrepared RewardedVideo " + isRVReady);
    }
    
    // Pause music when ad is prepared (about to show)
    try { 
        if (window.pauseMusic) window.pauseMusic(); 
    } catch(e) { 
        console.warn('JioGames: pauseMusic call failed', e); 
    }
};

window.onAdClosed = function (data, pIsVideoCompleted, pIsEligibleForReward) {
    var localData = data.split(",");
    var adSpotKey = data;
    var isVideoCompleted = pIsVideoCompleted;
    var isEligibleForReward = pIsEligibleForReward;

    if (localData != null && localData.length > 1) {
        adSpotKey = localData[0].trim();
        isVideoCompleted = Boolean(localData[1].trim());
        isEligibleForReward = Boolean(localData[2].trim());
    }
    console.log("JioGames: onAdClosed "+data.toString());

    if (adSpotKey == adSpotInterstitial) {
        isAdReady = false;
        window.isAdReady = false;
        isCachingMidRoll = false; // Reset caching flag when ad is closed
        isShowingAd = false; // Reset showing flag when ad is closed
        console.log("JioGames: onAdClose Show Ads " + isAdReady);
        
        // Prevent game caching when ad closes from x icon click
        if (window.skipGameCachingOnAdClose) {
            console.log("JioGames: Skipping game caching on ad close (x icon click flow)");
            window.skipGameCachingOnAdClose = false; // Clear flag after use
        }
        
        // ⚠️ DO NOT re-cache ads here - only cache on explicit button clicks
    }
    
    if (adSpotKey == adSpotRewardedVideo) {
        isRVReady = false;
        window.isRVReady = false;
        isCachingRewarded = false; // Reset caching flag when ad is closed
        isShowingRewarded = false; // Reset showing flag when ad is closed
        console.log("JioGames: onAdClose RewardedVideo " + isRVReady);
        
        // CRITICAL: Set flags IMMEDIATELY when RV video closes to prevent any caching
        // Set these BEFORE calling GratifyReward() to ensure they're active
        window.skipCachingAfterRV = true;
        window.continuingFromRV = true;
        console.log("JioGames: Set skipCachingAfterRV and continuingFromRV flags when RV video closes");
        
        // ⚠️ DO NOT re-cache ads here - only cache on explicit button clicks
    }

    // Grant reward if eligible
    if (adSpotKey == adSpotRewardedVideo && isEligibleForReward) {
        GratifyReward();
    }
    
    // Resume music when ad closes
    try { 
        if (window.resumeMusic) window.resumeMusic(); 
    } catch(e) { 
        console.warn('JioGames: resumeMusic call failed', e); 
    }
    
    // Dispatch adClosed event for game logic
    try {
        window.dispatchEvent(new CustomEvent('adClosed', { detail: { placement: adSpotKey } }));
    } catch(evtErr) {
        console.log('JioGames: Failed to dispatch adClosed event', evtErr);
    }
};

window.onAdFailedToLoad = function (data, pDescription){
    var localData = data.split(",");
    var adSpotKey = data;
    var description = pDescription;

    if (localData != null && localData.length > 1) {
        adSpotKey = localData[0].trim();
        description = localData[1].trim();
    }

    console.log("JioGames: onAdFailedToLoad "+data.toString());
    
    // Reset flags when ad fails to load
    if (adSpotKey == adSpotInterstitial) {
        isAdReady = false;
        window.isAdReady = false;
        isCachingMidRoll = false; // Reset caching flag on failure
        isShowingAd = false; // Reset showing flag on failure
        console.log("JioGames: onAdFailedToLoad Show Ads " + isAdReady+" description "+description);
    }
    
    if (adSpotKey == adSpotRewardedVideo) {
        isRVReady = false;
        window.isRVReady = false;
        isCachingRewarded = false; // Reset caching flag on failure
        isShowingRewarded = false; // Reset showing flag on failure
        console.log("JioGames: onAdFailedToLoad RewardedVideo " + isRVReady+" description "+description);
    }
};


window.onAdClick = function (adSpotKey) {};
window.onAdMediaCollapse = function (adSpotKey) {};
window.onAdMediaExpand = function (adSpotKey) {};
window.onAdMediaStart = function (adSpotKey) {};
window.onAdRefresh = function (adSpotKey) {};
window.onAdRender = function (adSpotKey) {};
window.onAdRender = function (adSpotKey) {};
window.onAdReceived = function (adSpotKey) {};
window.onAdSkippable = function (adSpotKey) {};
window.onAdView = function (adSpotKey) {};

window.onUserProfileResponse = function(message)
{
// Sample JSON which will receive in response to getUserProfile()
// {gamer_id: 'T9EMNU++dbtW0sdadgo83m795flags/8WaOZjdJa4x8=', gamer_name: 'Player19998', gamer_avatar_url: 'https://jiogames.net/profile_images', device_type: 'sp', dob: null}
    const obj = JSON.parse(message);
    console.log("gamer_id "+obj.gamer_id);
    console.log("gamer_name "+obj.gamer_name);
    console.log("gamer_avatar_url "+obj.gamer_avatar_url);
    console.log("device_type "+obj.device_type);
    console.log("dob "+obj.dob);
    // console.log("JioGames: onUserProfileResponse "+[JSON.stringify(message)]);
};

window.onClientPause = function () {
    console.log("JioGames: onClientPause called");
     window.pauseMusic();
};

window.onClientResume = function () {
    console.log("JioGames: onClientResume called");
     window.resumeMusic();
};


function GratifyReward() {
    console.log("JioGames: GratifyReward - User watched rewarded ad successfully!");
    // Give reward: Extra life to continue playing
    try {
        // Call game's reward function if it exists (will be defined in app.js)
        if (typeof window.giveRewardExtraLife === 'function') {
            window.giveRewardExtraLife();
            console.log("JioGames: Reward granted - Extra life given!");
        } else {
            console.warn("JioGames: giveRewardExtraLife function not found. Reward not applied.");
        }
    } catch(e) {
        console.error("JioGames: Error granting reward:", e);
    }
};

function cacheAd() {
    console.log("JioGames: cacheAd called");
    
    // CRITICAL: Don't cache if we're in the middle of RV video reward flow
    if (window.skipCachingAfterRV || window.continuingFromRV) {
        console.log("JioGames: cacheAd BLOCKED - RV video reward flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
        return;
    }
    
    if (!isAdReady) {
        cacheAdMidRoll(adSpotInterstitial, packageName);
    } else {
        console.log("JioGames: cacheAd skipped - ad already ready (isAdReady=true)");
    }
}
function cacheAdRewarded() {
    console.log("JioGames: cacheAdRewarded called");
    
    // CRITICAL: Don't cache if we're in the middle of RV video reward flow
    if (window.skipCachingAfterRV || window.continuingFromRV) {
        console.log("JioGames: cacheAdRewarded BLOCKED - RV video reward flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
        return;
    }
    
    if (!isRVReady) {
        // Only cache RV once per session - check if already cached or used
        if (window.rvVideoCachedOnce) {
            console.log("JioGames: cacheAdRewarded skipped - RV video already cached once in this session");
            return;
        }
        // Also check if RV has been used - don't cache again if already used
        if (window.rvVideoUsedOnce) {
            console.log("JioGames: cacheAdRewarded skipped - RV video already used once in this session");
            return;
        }
        window.rvVideoCachedOnce = true; // Mark as cached
        cacheAdRewardedVideo(adSpotRewardedVideo, packageName);
    } else {
        console.log("JioGames: cacheAdRewarded skipped - rewarded ad already ready (isRVReady=true)");
    }
}
function showAd() {
    console.log("JioGames: showAd (Show Ads) called. isAdReady=", isAdReady);
    
    // Prevent duplicate show ad calls
    var currentTime = Date.now();
    if (isShowingAd || (currentTime - lastShowAdTime < SHOW_AD_COOLDOWN)) {
        console.log("JioGames: showAd skipped - already showing or recently shown");
        return;
    }
    
    if (isAdReady) {
        // Set showing flag and timestamp
        isShowingAd = true;
        lastShowAdTime = currentTime;
        
        // Pause game and audio when ad is shown
        try {
            var suppressPauseKey = window.skipPauseKeyOnNextAd === true;
            if (suppressPauseKey) {
                console.log("JioGames: Skipping pause key dispatch for ad (flag active)");
                window.skipPauseKeyOnNextAd = false;
            } else if (typeof document !== 'undefined') {
                // Fire P key to pause game (default behavior)
                var pauseEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    keyCode: 80,
                    which: 80
                });
                Object.defineProperty(pauseEvent, 'keyCode', {get: function(){return 80;}});
                Object.defineProperty(pauseEvent, 'which', {get: function(){return 80;}});
                document.dispatchEvent(pauseEvent);
            }
            // Pause all audio
            var allAudio = document.querySelectorAll('audio');
            for (var i = 0; i < allAudio.length; i++) {
                if (allAudio[i] && !allAudio[i].paused) {
                    allAudio[i].pause();
                }
            }
            console.log("JioGames: Game and audio paused - ad shown");
        } catch(e) {
            console.log("JioGames: Error pausing game/audio on ad show", e);
        }
        
        try {
            window.dispatchEvent(new CustomEvent('adShown', { detail: { type: 'interstitial' } }));
        } catch(e) {
            console.log('JioGames: Failed to dispatch adShown event', e);
        }
        
        console.log("JioGames: calling showAdMidRoll('" + adSpotInterstitial + "', '"+packageName+"')");
        showAdMidRoll(adSpotInterstitial, packageName);
        
        // Reset flag after ad should be shown (will also reset in onAdClosed)
        setTimeout(function() {
            isShowingAd = false;
        }, 5000);
    } else {
        console.warn("JioGames: showAd skipped - show ads not ready yet. Ensure cacheAd() ran and onAdPrepared fired.");
    }
}
function showAdRewarded() {
    console.log("JioGames: showAdRewarded called");
    
    // Prevent duplicate show rewarded ad calls
    var currentTime = Date.now();
    if (isShowingRewarded || (currentTime - lastShowRewardedTime < SHOW_AD_COOLDOWN)) {
        console.log("JioGames: showAdRewarded skipped - already showing or recently shown");
        return;
    }
    
    if (isRVReady) {
        // Set showing flag and timestamp
        isShowingRewarded = true;
        lastShowRewardedTime = currentTime;
        
        // Pause game and audio when rewarded ad is shown
        try {
            // Fire P key to pause game
            if (typeof document !== 'undefined') {
                var pauseEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    keyCode: 80,
                    which: 80
                });
                Object.defineProperty(pauseEvent, 'keyCode', {get: function(){return 80;}});
                Object.defineProperty(pauseEvent, 'which', {get: function(){return 80;}});
                document.dispatchEvent(pauseEvent);
            }
            // Pause all audio
            var allAudio = document.querySelectorAll('audio');
            for (var i = 0; i < allAudio.length; i++) {
                if (allAudio[i] && !allAudio[i].paused) {
                    allAudio[i].pause();
                }
            }
            console.log("JioGames: Game and audio paused - rewarded ad shown");
        } catch(e) {
            console.log("JioGames: Error pausing game/audio on rewarded ad show", e);
        }
        
        try {
            window.dispatchEvent(new CustomEvent('adShown', { detail: { type: 'rewarded' } }));
        } catch(e) {
            console.log('JioGames: Failed to dispatch rewarded adShown event', e);
        }
        
        showAdRewardedVideo(adSpotRewardedVideo, packageName);
        
        // Reset flag after ad should be shown (will also reset in onAdClosed)
        setTimeout(function() {
            isShowingRewarded = false;
        }, 5000);
        
        /******* CHEAT *******/
//         window.onAdMediaEnd(adSpotRewardedVideo, true, 1);
//         window.onAdClosed(adSpotRewardedVideo, true, true);
        /******* CHEAT *******/
    } else {
        console.warn("JioGames: showAdRewarded skipped - rewarded ad not ready yet.");
    }
}

// Reset caching flags - call this when starting a new game session
function resetCachingFlags() {
    isCachingAds = false;
    lastCacheTime = 0;
    isCachingMidRoll = false;
    isCachingRewarded = false;
    lastMidRollCacheTime = 0;
    lastRewardedCacheTime = 0;
    console.log("JioGames: Caching flags reset for new game session");
}
// Expose globally for use in button handlers
window.resetCachingFlags = resetCachingFlags;

function gameCacheAd() {
    // CRITICAL: Don't cache if we're in the middle of RV video reward flow
    // Check if we're continuing from RV video - if yes, skip caching completely
    if (window.skipCachingAfterRV || window.continuingFromRV) {
        console.log("JioGames: gameCacheAd BLOCKED - RV video reward flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
        console.trace("JioGames: gameCacheAd call stack trace (RV flow active)");
        return;
    }
    
    // Prevent game caching when ad closes from x icon click
    if (window.skipGameCachingOnAdClose) {
        console.log("JioGames: gameCacheAd BLOCKED - ad closed from x icon click, skipping game caching");
        return;
    }
    
    console.log("JioGames: gameCacheAd called - checking if caching is allowed...");
    
    // Prevent duplicate caching - check if already caching or recently cached
    var currentTime = Date.now();
    // If lastCacheTime is 0, it means flags were reset - allow caching
    if (isCachingAds || (lastCacheTime > 0 && (currentTime - lastCacheTime < CACHE_COOLDOWN))) {
        // Only log if not recently cached (to reduce console spam)
        if (lastCacheTime === 0 || currentTime - lastCacheTime >= CACHE_COOLDOWN - 1000) {
            console.log("JioGames: gameCacheAd skipped - already caching or recently cached. isCachingAds:", isCachingAds, "lastCacheTime:", lastCacheTime, "timeDiff:", lastCacheTime > 0 ? (currentTime - lastCacheTime) : "N/A");
        }
        return;
    }
    
    // Set caching flag and timestamp
    isCachingAds = true;
    lastCacheTime = currentTime;
    
    console.log("JioGames: gameCacheAd - Starting ad cache (midroll + rewarded)");
    cacheAd();  // Cache midroll ad immediately (has RV flag check)
    
    // Cache rewarded ad after 5 seconds delay
    // IMPORTANT: Check flags again in setTimeout - flags might be set during the delay
    setTimeout(function(){
        // Double-check flags before caching rewarded ad
        if (window.skipCachingAfterRV || window.continuingFromRV) {
            console.log("JioGames: cacheAdRewarded BLOCKED in setTimeout - RV video reward flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
            // Reset caching flag even if blocked
            isCachingAds = false;
            return;
        }
        cacheAdRewarded(); // Has RV flag check, but double-check here too
        // Reset caching flag after both ads are requested
        setTimeout(function() {
            isCachingAds = false;
        }, 6000); // Reset after 6 seconds (5s delay + 1s buffer)
    }, 5000);
}


// Banner ad impliment code
function loadBanner() {
    console.log("JioGames: loadBanner called");
	if (window.DroidHandler) {
        window.DroidHandler.postMessage('{"key":"getUserProperties"}');
    }
    else{
        window.onUserPropertiesResponse(JSON.parse('{"detail":{"uid":"","ifa":""}}'));
    }
}

window.onUserPropertiesResponse = function(message)
{
    console.log("JioGames: onUserPropertiesResponse "+[JSON.stringify(message)]);
    const obj = JSON.parse(JSON.stringify(message));

    var element = document.createElement("div");
    element.id = 'bannercontainer';
    element.style.position = 'fixed';
    element.style.width = 'auto';
    element.style.height = 'auto';
    element.style.left = '50%';
    element.style.bottom = '12px';
    element.style.transform = 'translateX(-50%)';
    element.style.zIndex = '1250';
    element.style.display = 'none';
    element.style.backgroundPosition = 'center center';
    element.style.backgroundRepeat = 'no-repeat';
    
    document.body.appendChild(element);
    
    var script = document.createElement('script');
    script.src = 'https://jioadsweb.akamaized.net/jioads/websdk/default/stable/v2/jioAds.js';

    script.onload = () => {
        callback_Banner();
        banner_Configuration(obj);
    };

    script.onerror = () => {
        console.log('Error occurred while loading script');
    };

    document.body.appendChild(script);
}

function setTopBanner(){
    console.log("JioGames: setTopBanner");
    var element = document.getElementById('bannercontainer');
    element.style.removeProperty('bottom');
    element.style.top = '0%';
}

function setBottomBanner(){
    console.log("JioGames: setBottomBanner");
    var element = document.getElementById('bannercontainer');
    element.style.removeProperty('top');
    element.style.bottom = '0%'
}

function banner_Configuration(obj){
    console.log("JioGames: banner_Configuration IFA : " , obj.detail.ifa);
    console.log("JioGames: banner_Configuration UID : " , obj.detail.uid);
    JioAds.setConfiguration({
        endpoint: "jioads",
        clkSelf: true,
        reqType: "prod", //stg, prod
        logLevel: 1,
		ifa: obj.detail.ifa,
		uid: obj.detail.uid,
        adRequestTimeout: 6000,
        adRenderingTimeout: 5000
    });
}

function showBanner() {
    console.log("JioGames: showBanner");
    document.getElementById("bannercontainer").innerHTML = `<ins id="uid1" data-adspot-key=${banner_ZoneKey} data-source=${bannerPackageName} data-ad-sizes="320x50"></ins>`;
    setBottomBanner();
}

function showNativeBanner() {
    console.log("JioGames: showNativeBanner");
    document.getElementById("bannercontainer").innerHTML = `<ins id="uid1" data-adspot-key=${banner_ZoneKey} data-source=${bannerPackageName} data-ad-sizes="300x250"></ins>`;
    
    var element = document.getElementById('bannercontainer');
    element.style.removeProperty('top');
    element.style.removeProperty('bottom');
}

function hideBanner() {
    console.log("JioGames: hideBanner");
    document.getElementById("bannercontainer").innerHTML = '';
}

function callback_Banner(){
    JioAds.onAdFailedToLoad = function(placementId, options) {
        console.log ("JioGames: onAdFailedToLoad "+placementId+" options "+JSON.stringify(options));
    };
    JioAds.onAdPrepared = function(placementId, adUxType) {
        console.log ("JioGames: onAdPrepared "+placemenId);
    };
    JioAds.onAdRender = function(placementId) {
        console.log ("JioGames: onAdRender "+placementId);
    };
    JioAds.onAdChange = function(placementId, options) {
        console.log ("JioGames: onAdChange "+placementId);
    };
    JioAds.onAdClosed = function(placementId, isVideoCompleted, reward) {
        console.log ("JioGames: onAdClosed "+placementId);
    };
    JioAds.onAdClicked = function(placementId, url) {
        console.log ("JioGames: onAdClicked "+placementId + " URL : " +url);
        window.DroidHandler.postMessage('{"key":"openLink","value":{"url":"' + url + '"}}');
    };
    JioAds.onAdMediaStart = function(placementId) {
        console.log ("JioGames: onAdMediaStart "+placementId);
    };
    JioAds.onAdProgress = function(placementId, quartileInfo) {
        console.log ("JioGames: onAdProgress "+placementId);
    };
    JioAds.onAdMediaEnd = function(placementId, reward) {
        console.log ("JioGames: onAdMediaEnd "+placementId);
    };
    JioAds.onAdRefresh = function(placementId, options) {
        console.log ("JioGames: onAdRefresh "+placementId);
    };
    JioAds.onAdSkippable = function(placementId, options) {
        console.log ("JioGames: onAdSkippable "+placementId);
    };
    JioAds.onAdsReceived = function(placementId, ads) {
        console.log ("JioGames: onAdsReceived "+placementId);
    };
    JioAds.onAdDuration = function(placementId, adDuration) {
        console.log ("JioGames: onAdDuration "+placementId);
    };
}

