/**
 * @file popup.js
 * @description This file contains the JavaScript logic for the popup interface of the YouTube Ad Muter Chrome extension.
 * It handles the retrieval and display of ad mute statistics, user interactions with the popup elements, and the storage
 * of user preferences in Chrome's local storage. The main functionalities include updating the total count of ad mutes,
 * adding event listeners to buttons, and managing checkbox state changes.
 * @author Genesis Font <purewebdev@gmail.com>
 */

// Function to retrieve and display the total count of ad mutes
function updateTotalCount() {
    chrome.storage.local.get(['adMuteData'], function (result) {
        const adMuteData = result.adMuteData || {};
        let totalCount = 0;

        // Calculate the total count of entries
        Object.keys(adMuteData).forEach(url => {
            const { count } = adMuteData[url];
            totalCount += count;
        });

        // Display the total count in the popup
        const totalCountElement = document.getElementById('totalCount');
        if (totalCountElement) {
            totalCountElement.textContent = `Total Ad Mutes: ${totalCount}`;
        }
    });
}

// Function to add event listener to the button
function addLoadDataButtonListener() {
    const loadDataButton = document.getElementById('loadDataButton');
    if (loadDataButton) {
        loadDataButton.addEventListener('click', function () {
            updateTotalCount();
            updateLastScreenshot();
        });
    }
}

// Function to handle checkbox changes and store values in local storage
function handleCheckboxChange(event) {
    const checkboxId = event.target.id;
    const isChecked = event.target.checked;
    chrome.storage.local.set({ [checkboxId]: isChecked });
}

// Function to initialize checkboxes based on stored values
function initializeCheckboxes() {
    const checkboxes = ['muteAdsEnable', 'hideDistractingAds', 'skipAdOption', 'autoLikeEndVideo'];
    chrome.storage.local.get(checkboxes, function (result) {
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = result[checkboxId] || false;
                checkbox.addEventListener('change', handleCheckboxChange);
            }
        });
    });
}

/// Function to update the last screenshot
function updateLastScreenshot() {
    chrome.storage.local.get(['lastScreenshot'], function (result) {
        const screenshotPanel = document.getElementById('screenshotPanel');
        const screenshotImage = document.getElementById('screenshotImage');
        const downloadScreenshotLink = document.getElementById('downloadScreenshotLink');
        if (result.lastScreenshot) {
            screenshotImage.src = result.lastScreenshot;
            downloadScreenshotLink.href = result.lastScreenshot;
            downloadScreenshotLink.style.display = 'block';
            screenshotPanel.style.display = 'block';
        } else {
            downloadScreenshotLink.style.display = 'none';
            screenshotPanel.style.display = 'none';
        }
    });
}

// Call the function to add the event listener
addLoadDataButtonListener();

// Initialize checkboxes on page load
document.addEventListener('DOMContentLoaded', function () {
    updateTotalCount();
    initializeCheckboxes();
    updateLastScreenshot();
});

// Add event listener to the screenshot image to open it in a modal
document.getElementById('screenshotImage').addEventListener('click', function () {
    const modalScreenshotImage = document.getElementById('modalScreenshotImage');
    modalScreenshotImage.src = this.src;
    const screenshotModal = new bootstrap.Modal(document.getElementById('screenshotModal'));
    screenshotModal.show();
});

// Retrieve and display the last screenshot on load
updateLastScreenshot();