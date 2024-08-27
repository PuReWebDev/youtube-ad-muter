/**
 * @file content.js
 * @description Content script to detect YouTube ads and mute/unmute the video accordingly. It also handles additional functionalities such as hiding distracting ads, skipping ads, and auto-liking videos at the end.
 * @example This script is automatically injected into YouTube pages by the Chrome extension.
 * @returns {void} This script does not return any value.
 * 
 * Main functionalities include:
 * - Checking for ad elements and muting/unmuting the video (`checkForAds`)
 * - Storing ad mute information (`storeAdMuteInfo`)
 * - Taking a screenshot (`takeScreenshot`)
 * - Hiding distracting ads (`hideDistractingAds`)
 * - Skipping ads when the option is available (`skipAd`)
 * - Auto-liking the video at the end (`autoLikeVideo`)
 * 
 * @autor Genesis Font <purewebdev@gmail.com>
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
        chrome.storage.local.get(['muteAdsEnable', 'hideDistractingAds', 'skipAdOption', 'autoLikeEndVideo'], function (result) {
            const muteAdsEnable = result.muteAdsEnable || false;
            const hideDistractingAds = result.hideDistractingAds || false;
            const skipAdOption = result.skipAdOption || false;
            const autoLikeEndVideo = result.autoLikeEndVideo || false;

            if (adOverlay && muteAdsEnable) {
                // Mute the video if an ad is playing and the preference is enabled
                if (video) {
                    video.muted = true;
                    storeAdMuteInfo();

                    // Call the function to take a screenshot after storing ad mute info
                    // Request the background script to take a screenshot
                    chrome.runtime.sendMessage({ action: 'takeScreenshot' }, function (response) {
                        if (response && response.success) {
                            console.log('Screenshot request successful.');
                        } else {
                            console.error('Screenshot request failed.');
                        }
                    });
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
            hideInfoPanelContent();
            enableDownload(); // Call the new method to enable download

            // conditionally call likeVideoIfEnding
            if (autoLikeEndVideo) {
                likeVideoIfEnding(); // Call the new method to like the video if it's ending
            }

            if (hideDistractingAds) {
                hideImageAds();
            }

            autoSubscribe(); // Call the new method to auto-subscribe to the channel

            // Call the new methods to handle watch later queue
            addToWatchLaterIfPlayedFor10Seconds();
            removeFromWatchLaterIfEnding();
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
            // 'ytd-popup-container',
            'mealbar-promo-renderer',
            'yt-mealbar-promo-renderer',
            'YtwTopBannerImageTextIconButtonedLayoutViewModelHost',
            'YtwTopBannerImageTextIconButtonedLayoutViewModelHostBannerImage',
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
 * Function to hide the ytd-info-panel-content-renderer element if it exists
 */
function hideInfoPanelContent() {
    try {
        const infoPanelContent = document.querySelector('ytd-info-panel-content-renderer');
        if (infoPanelContent) {
            infoPanelContent.style.display = 'none';
        }
    } catch (error) {
        console.error('Error in hideInfoPanelContent:', error);
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

// Function to like the video if it's within the last ten seconds of finishing
function likeVideoIfEnding() {
    try {
        const video = document.querySelector('video');
        if (video) {
            const remainingTime = video.duration - video.currentTime;
            if (remainingTime <= 10) {
                const likeButton = document.querySelector('button[title="I like this"]');
                if (likeButton) {
                    likeButton.click();
                }
            }
        }
    } catch (error) {
        console.error('Error in likeVideoIfEnding:', error);
    }
}

// Function to add the current video to the watch later queue after it plays for 10 seconds
function addToWatchLaterIfPlayedFor10Seconds() {
    try {
        const video = document.querySelector('video');
        chrome.storage.local.get(['inQueue'], function (result) {
            if (video && !result.inQueue) {
                video.addEventListener('timeupdate', function () {
                    if (video.currentTime >= 10) {
                        const watchLaterButton = document.querySelector('ytd-playlist-add-to-option-renderer tp-yt-paper-checkbox');
                        if (watchLaterButton) {
                            watchLaterButton.click();
                            chrome.storage.local.set({ inQueue: true });
                        }
                        video.removeEventListener('timeupdate', arguments.callee);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error in addToWatchLaterIfPlayedFor10Seconds:', error);
    }
}

// Function to remove the current video from the watch later queue if it has less than 10 seconds remaining
function removeFromWatchLaterIfEnding() {
    try {
        const video = document.querySelector('video');
        chrome.storage.local.get(['inQueue'], function (result) {
            if (video && result.inQueue) {
                video.addEventListener('timeupdate', function () {
                    const remainingTime = video.duration - video.currentTime;
                    if (remainingTime <= 10) {
                        const removeWatchLaterButton = document.querySelector('ytd-playlist-add-to-option-renderer tp-yt-paper-checkbox');
                        if (removeWatchLaterButton) {
                            removeWatchLaterButton.click();
                            chrome.storage.local.set({ inQueue: false });
                        }
                        video.removeEventListener('timeupdate', arguments.callee);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error in removeFromWatchLaterIfEnding:', error);
    }
}

let lastScreenshotTime = 0;

/**
 * Function to take a screenshot
 * @returns {void}
 */
function takeScreenshot() {
    const currentTime = Date.now();
    if (currentTime - lastScreenshotTime >= 1000) {
        chrome.tabs.captureVisibleTab(null, {}, function (image) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            // Process the screenshot image here
            console.log('Screenshot taken:', image);
        });
        lastScreenshotTime = currentTime;
    } else {
        console.log('Screenshot request ignored to avoid exceeding quota.');
    }
}

/**
 * Function to auto-subscribe to the channel
 * @returns {void}
 */
function autoSubscribe() {
    chrome.storage.local.get(['autoSubscribe'], function (result) {
        const autoSubscribe = result.autoSubscribe || false;
        if (autoSubscribe) {
            const video = document.querySelector('video');
            if (video) {
                let hasSubscribed = false;

                const remainingTime = video.duration - video.currentTime;
                if (remainingTime <= 10 && !hasSubscribed) {
                    const subscribeButton = document.querySelector('ytd-subscribe-button-renderer button');
                    const channelNameElement = document.querySelector('#channel-name .yt-simple-endpoint');
                    const channelName = channelNameElement ? channelNameElement.innerText : 'Unknown Channel';

                    if (subscribeButton && subscribeButton.innerText.toLowerCase().includes('subscribe')) {
                        subscribeButton.click();
                        hasSubscribed = true;
                        console.log(`User has been auto-subscribed to the channel: ${channelName}`);
                    }
                    enableAllNotifications();
                }
            }
        }
    });
}

/**
 * Function to click the "All" button for notifications
 * @returns {void}
 */
function enableAllNotifications() {
    const notificationButton = document.querySelector('ytd-subscribe-button-renderer tp-yt-paper-button');
    if (notificationButton && notificationButton.getAttribute('aria-pressed') === 'false') {
        notificationButton.click();
        const allButton = document.querySelector('tp-yt-paper-listbox tp-yt-paper-item');
        if (allButton && allButton.innerText.toLowerCase().includes('all')) {
            allButton.click();
            console.log('User has enabled notifications for all new videos.');
        }
    }
}
