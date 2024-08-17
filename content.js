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
    try {
        const video = document.querySelector('video');
        const adOverlay = document.querySelector('.ad-showing');
        const skipButton = document.querySelector('.ytp-skip-ad-button');
        const enforcementMessage = document.querySelector('.style-scope.ytd-enforcement-message-view-model');

        // Retrieve preferences from local storage
        chrome.storage.local.get(['muteAdsEnable', 'hideDistractingAds', 'skipAdOption'], function (result) {
            const muteAdsEnable = result.muteAdsEnable || false;
            const hideDistractingAds = result.hideDistractingAds || false;
            const skipAdOption = result.skipAdOption || false;

            if (adOverlay && muteAdsEnable) {
                // Mute the video if an ad is playing and the preference is enabled
                if (video) {
                    video.muted = true;
                    storeAdMuteInfo();
                }
            } else {
                // Unmute the video if no ad is playing
                if (video) video.muted = false;
            }

            if (skipButton && skipAdOption) {
                // Add a random delay between 1-3 seconds before clicking the skip button
                const delay = Math.random() * 2000 + 1000; // Random delay between 1000ms (1s) and 3000ms (3s)
                setTimeout(() => {
                    skipButton.click();
                    if (video) video.muted = false;
                }, delay);
            }

            if (enforcementMessage && enforcementMessage.style.display !== 'none') {
                // Redirect to the video at the current time if the enforcement message is displayed
                if (video) {
                    const currentTime = video.currentTime;
                    if (currentTime > 0) {
                        const videoUrl = new URL(window.location.href);
                        videoUrl.searchParams.set('t', `${Math.floor(currentTime)}s`);
                        window.location.href = videoUrl.toString();
                    } else {
                        // Refresh the page if the current time is 0
                        location.reload();
                    }
                } else {
                    // Refresh the page if the enforcement message is displayed
                    location.reload();
                }
            }

            hideClarifyBox();
            enableDownload(); // Call the new method to enable download

            if (hideDistractingAds) {
                hideImageAds();
            }
        });
    } catch (error) {
        console.error('Error in checkForAds:', error);
    }
}

/**
 * Function to hide image advertisements
 */
function hideImageAds() {
    try {
        const adImageClasses = [
            'YtwAdImageViewModelHostImage',
            'player-ads',
            'ytd-engagement-panel-section-list-renderer',
            'YtwAdImageViewModelHostImageContainer',
            'YtwAdImageViewModelHostIsClickableAdComponent',
            'ytd-player-legacy-desktop-watch-ads-renderer',
            'ytd-in-feed-ad-layout-renderer',
            'ytd-engagement-panel-title-header-renderer',
            'ytd-popup-container',
            'mealbar-promo-renderer',
            'yt-mealbar-promo-renderer',
            // Add other known image advertisement classes here
        ];

        adImageClasses.forEach(adClass => {
            const adImages = document.querySelectorAll(`.${adClass}`);
            adImages.forEach(adImage => {
                adImage.style.display = 'none';
            });
        });
    } catch (error) {
        console.error('Error in hideImageAds:', error);
    }
}

/**
 * Function to store ad mute information in local storage
 */
function storeAdMuteInfo() {
    try {
        const url = window.location.href;
        const timestamp = new Date().toISOString();
        const pageTitle = document.title;

        // Retrieve existing data from chrome.storage
        chrome.storage.local.get(['adMuteData'], function (result) {
            try {
                let adMuteData = result.adMuteData || {};

                // Initialize or update the count for the current URL
                if (!adMuteData[url]) {
                    adMuteData[url] = {
                        count: 0,
                        entries: []
                    };
                }

                // Update the count and add a new entry
                adMuteData[url].count += 1;
                adMuteData[url].entries.push({ timestamp, pageTitle });

                // Save the updated data back to chrome.storage
                chrome.storage.local.set({ adMuteData }, function () {
                    console.log('Ad mute information stored successfully.');
                });
            } catch (error) {
                console.error('Error updating ad mute data:', error);
            }
        });
    } catch (error) {
        console.error('Error in storeAdMuteInfo:', error);
    }
}

// Check for ads every second
setInterval(checkForAds, 1000);

/**
 * Function to hide the clarify box if it exists
 */
function hideClarifyBox() {
    try {
        const clarifyBox = document.getElementById('clarify-box');
        if (clarifyBox) {
            clarifyBox.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in hideClarifyBox:', error);
    }
}

/**
 * Function to enable download for YouTube video players
 * and fetch the MP4 URL of the currently playing video
 */
function enableDownload() {
    try {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            const mp4Url = videoElement.src;
            if (mp4Url && mp4Url.endsWith('.mp4')) {
                localStorage.setItem('mp4Url', mp4Url);
            } else {
                localStorage.removeItem('mp4Url');
            }
        }
    } catch (error) {
        console.error('Error in enableDownload:', error);
    }
}
