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
    const enforcementMessage = document.querySelector('.style-scope.ytd-enforcement-message-view-model');

    if (adOverlay) {
        // Mute the audio when the user selected video is interrupted
        if (video) {
            video.muted = true;
            storeAdMuteInfo();
        }
    } else {
        // Unmute the video if no ad is playing
        if (video) video.muted = false;
    }

    if (skipButton) {
        // Add a random delay between 1-3 seconds before clicking the skip button
        // Needed because of inappropriately being flagged as an ad blocker.
        const delay = Math.random() * 2000 + 1000; // Random delay between 1000ms (1s) and 3000ms (3s)
        setTimeout(() => {
            // If YouTube presents skip button, use opts to use it. This is preference, not an adblocker.
            skipButton.click();
            if (video) video.muted = false;
        }, delay);
    }

    if (enforcementMessage && enforcementMessage.style.display !== 'none') {
        // Refresh the page if the enforcement message is displayed
        location.reload();
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

    try {
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
    } catch (error) {
        console.error('Error in storeAdMuteInfo: ', error);
    }
}

// Check for ads every second
setInterval(checkForAds, 1000);

/**
 * Function to hide the clarify box if it exists
 */
function hideClarifyBox() {
    const clarifyBox = document.getElementById('clarify-box');
    if (clarifyBox) {
        clarifyBox.style.display = 'none';
    }
}
