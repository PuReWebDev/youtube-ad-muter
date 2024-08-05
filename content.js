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

    hideClarifyBox();
}

/**
 * Function to store ad mute information in local storage
 */
function storeAdMuteInfo() {
    const url = window.location.href;
    const timestamp = new Date().toISOString();
    const pageTitle = document.title;

    // Retrieve existing data from chrome.storage
    chrome.storage.local.get(['adMuteData'], function (result) {
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
        chrome.storage.local.set({ adMuteData: adMuteData }, function () {
            console.log('Ad mute data is saved to chrome.storage');
        });
    });

    // Retrieve existing count from chrome.storage
    chrome.storage.local.get(['adMuteCount'], function (result) {
        let adMuteCount = result.adMuteCount || 0;
        adMuteCount += 1;

        chrome.storage.local.set({ adMuteCount: adMuteCount }, function () {
            // Update the badge text with the new count
            if (chrome.action) {
                chrome.action.setBadgeTextColor({ color: "gray" });
                chrome.action.setBadgeText({ text: adMuteCount.toString() });
                console.log('Ad mute count is saved to chrome.storage via action');
            } else if (chrome.browserAction) {
                chrome.browserAction.setBadgeText({ text: adMuteCount.toString() });
                // browser.browserAction.setBadgeText({ text: "1234" });
                chrome.browserAction.setBadgeTextColor({ color: "red" });
                console.log('Ad mute count is saved to chrome.storage via browserAction');
            } else if (chrome.pageAction) {
                chrome.pageAction.setBadgeText({ text: adMuteCount.toString() });
                chrome.pageAction.setBadgeTextColor({ color: "blue" });
                console.log('Ad mute count is saved to chrome.storage via pageAction');
            }

        });


    });
}

// Check for ads every second
setInterval(checkForAds, 1000);

function initializeBadgeText() {
    chrome.storage.local.get(['adMuteCount'], function (result) {
        let adMuteCount = result.adMuteCount || 0;
        if (chrome.action) {
            chrome.action.setBadgeText({ text: adMuteCount.toString() });
        }
    });
}

// Call the function to initialize the badge text
initializeBadgeText();

/**
 * Function to hide the clarify box if it exists
 */
function hideClarifyBox() {
    const clarifyBox = document.getElementById('clarify-box');
    if (clarifyBox) {
        clarifyBox.style.display = 'none';
    }
}
