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
        if (video) video.muted = true;
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

// Check for ads every second
setInterval(checkForAds, 1000);