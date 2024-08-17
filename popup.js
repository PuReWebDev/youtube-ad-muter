/// Function to retrieve and display the total count of ad mutes
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
        });
    }
}

// Call the function to add the event listener
addLoadDataButtonListener();

// Update the total count on page load
document.addEventListener('DOMContentLoaded', function () {
    updateTotalCount();
});

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            addLoadDataButtonListener();
        }
    }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Also call the function directly in case the button is already present
// addLoadDataButtonListener();

document.addEventListener('DOMContentLoaded', function () {
    const muteAdsEnableCheckbox = document.getElementById('muteAdsEnable');
    const hideDistractingAdsCheckbox = document.getElementById('hideDistractingAds');
    const skipAdOptionCheckbox = document.getElementById('skipAdOption');

    // Load saved preferences
    chrome.storage.local.get(['muteAdsEnable', 'hideDistractingAds', 'skipAdOption'], function (result) {
        muteAdsEnableCheckbox.checked = result.muteAdsEnable || false;
        hideDistractingAdsCheckbox.checked = result.hideDistractingAds || false;
        skipAdOptionCheckbox.checked = result.skipAdOption || false;
    });

    // Save preferences when checkboxes are changed
    muteAdsEnableCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ muteAdsEnable: muteAdsEnableCheckbox.checked });
    });

    hideDistractingAdsCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ hideDistractingAds: hideDistractingAdsCheckbox.checked });
    });

    skipAdOptionCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ skipAdOption: skipAdOptionCheckbox.checked });
    });

    // Function to check for MP4 URL and display download link if available
    function checkForMp4Url() {
        const mp4Url = localStorage.getItem('mp4Url');
        if (mp4Url) {
            downloadLink.href = mp4Url;
            downloadLink.style.display = 'block';
        } else {
            downloadLink.style.display = 'none';
        }
    }

    // Check for MP4 URL and display download link if available on page load
    checkForMp4Url();

    // Check for MP4 URL and display download link when loadDataButton is clicked
    loadDataButton.addEventListener('click', function () {
        checkForMp4Url();
        updateTotalCount();
    });
});