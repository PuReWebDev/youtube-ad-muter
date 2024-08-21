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

// Call the function to add the event listener
addLoadDataButtonListener();

// Initialize checkboxes on page load
document.addEventListener('DOMContentLoaded', function () {
    updateTotalCount();
    initializeCheckboxes();
});