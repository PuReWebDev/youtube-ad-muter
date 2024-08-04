/**
 * @file content.js
 * @description Content script to detect YouTube ads and mute/unmute the video accordingly.
 * @example This script is automatically injected into YouTube pages by the Chrome extension.
 * @returns {void} This script does not return any value.
 * @author Genesis Font <purewebdev@gmail.com>
 */

/**
 * Function to check for ad elements and mute/unmute video
 */
function checkForAds() {
    const video = document.querySelector('video');
    const adOverlay = document.querySelector('.ad-showing');
    const skipButton = document.querySelector('.ytp-skip-ad-button');

    if (adOverlay) {
        // Mute the video if an ad is playing
        if (video) {
            video.muted = true;
            storeAdMuteInfo();
        }
    } else {
        // Unmute the video if no ad is playing
        if (video) video.muted = false;
    }

    if (skipButton) {
        // Click the skip button if present
        skipButton.click();
        if (video) video.muted = false;
    }
}

/**
 * Function to store ad mute information in local storage
 */
function storeAdMuteInfo() {
    const url = window.location.href;
    const timestamp = new Date().toISOString();
    const pageTitle = document.title;

    // Retrieve existing data from chrome.storage
    chrome.storage.local.get(['adMuteData'], function(result) {
        let adMuteData = result.adMuteData || {};

        // Initialize or update the count for the current URL
        if (!adMuteData[url]) {
            adMuteData[url] = {
                count: 0,
                entries: []
            };
        }

        adMuteData[url].count += 1;
        adMuteData[url].entries.push({ timestamp, pageTitle });

        // Store the updated data back in chrome.storage
        chrome.storage.local.set({ adMuteData: adMuteData }, function() {
            console.log('Ad mute data is saved to chrome.storage');
        });
    });
}

// Check for ads every second
setInterval(checkForAds, 1000);