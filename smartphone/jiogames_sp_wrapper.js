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
    if (window.DroidHandler) {
        window.DroidHandler.cacheAd(adKeyId, source);
    }
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
    if (window.DroidHandler) {
        window.DroidHandler.cacheAdRewarded(adKeyId, source);    
    }
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
    adSpotKey == adSpotInterstitial && (isAdReady = true, window.isAdReady = true, console.log("JioGames: onAdPrepared Show Ads " + isAdReady));
    adSpotKey == adSpotRewardedVideo && (isRVReady = true, window.isRVReady = true, console.log("JioGames: onAdPrepared RewardedVideo " + isRVReady));   
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
    console.log("JioGames: onAdClosed "+data.toString(), "localData "+localData[0]+" "+localData[1]+" "+localData[2]);

    adSpotKey == adSpotInterstitial && (isAdReady = false, window.isAdReady = false, console.log("JioGames: onAdClose Show Ads " + isAdReady));
    adSpotKey == adSpotRewardedVideo && (isRVReady = false, window.isRVReady = false, console.log("JioGames: onAdClose RewardedVideo " + isRVReady));

    if (adSpotKey == adSpotRewardedVideo && isEligibleForReward) {
        GratifyReward();
    }    
    // No caching on ad close - caching only happens on start game and play again
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

    console.log("JioGames: onAdFailedToLoad "+data.toString()+" localData "+localData[0]+" "+localData[1]);
    
    adSpotKey == adSpotInterstitial && (isAdReady = false, window.isAdReady = false, console.log("JioGames: onAdFailedToLoad Show Ads " + isAdReady+" description "+description));
    adSpotKey == adSpotRewardedVideo && (isRVReady = false, window.isRVReady = false, console.log("JioGames: onAdFailedToLoad RewardedVideo " + isRVReady+" description "+description));
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
    if (isAdReady) {
        console.log("JioGames: cacheAd skipped - ad already ready (isAdReady=true)");
        return;
    }
    console.log("JioGames: cacheAd called - caching show ads");
    cacheAdMidRoll(adSpotInterstitial, packageName);
}
function cacheAdRewarded() {
    // Only cache RV once per session - check if already cached or used
    if (isRVReady) {
        console.log("JioGames: cacheAdRewarded skipped - rewarded ad already ready (isRVReady=true)");
        return;
    }
    if (window.rvVideoCachedOnce) {
        console.log("JioGames: cacheAdRewarded skipped - RV video already cached once in this session");
        return;
    }
    console.log("JioGames: cacheAdRewarded called - caching rewarded ad");
    window.rvVideoCachedOnce = true; // Mark as cached
    cacheAdRewardedVideo(adSpotRewardedVideo, packageName);
}
function showAd() {
    console.log("JioGames: showAd called");
    
    // Pause game and audio when ad is shown
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
        console.log("JioGames: Game and audio paused - ad shown");
    } catch(e) {
        console.log("JioGames: Error pausing game/audio on ad show", e);
    }
    
    if (isAdReady) {
        try {
            window.dispatchEvent(new CustomEvent('adShown', { detail: { type: 'interstitial' } }));
        } catch(e) {
            console.log('JioGames: Failed to dispatch adShown event', e);
        }
        showAdMidRoll(adSpotInterstitial, packageName);
    }
}
function showAdRewarded() {
    console.log("JioGames: showAdRewarded called");
    
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
    
    if (isRVReady) {
        try {
            window.dispatchEvent(new CustomEvent('adShown', { detail: { type: 'rewarded' } }));
        } catch(e) {
            console.log('JioGames: Failed to dispatch rewarded adShown event', e);
        }
        showAdRewardedVideo(adSpotRewardedVideo, packageName);
        
        /******* CHEAT *******/
//         window.onAdMediaEnd(adSpotRewardedVideo, true, 1);
//         window.onAdClosed(adSpotRewardedVideo, true, true);
        /******* CHEAT *******/
    }
}

function gameCacheAd() {
    console.log("JioGames: gameCacheAd called");
    cacheAd();
	setTimeout(function(){
		cacheAdRewarded();
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
