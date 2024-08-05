// Function to add event listener to the button
// Function to add event listener to the button
function addLoadDataButtonListener() {
    const loadDataButton = document.getElementById('loadDataButton');
    if (loadDataButton) {
        document.addEventListener('DOMContentLoaded', function () {
            // Retrieve existing data from chrome.storage
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
        });
    }
}

// Call the function to add the event listener
addLoadDataButtonListener();

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