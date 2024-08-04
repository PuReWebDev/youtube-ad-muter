// Function to add event listener to the button
function addLoadDataButtonListener() {
	const loadDataButton = document.getElementById('loadDataButton');
	if (loadDataButton) {
		document.addEventListener('DOMContentLoaded', function () {
			// Retrieve existing data from chrome.storage
			chrome.storage.local.get(['adMuteData'], function (result) {
				const adMuteData = result.adMuteData || {};
				const tableBody = document.querySelector('#adMuteTable tbody');

				// Clear existing table data
				tableBody.innerHTML = '';

				Object.keys(adMuteData).forEach(url => {
					const { count, entries } = adMuteData[url];
					entries.forEach(entry => {
						const row = document.createElement('tr');
						row.innerHTML = `
				<td>${url}</td>
				<td>${entry.timestamp}</td>
				<td>${entry.pageTitle}</td>
				<td>${count}</td>
			  `;
						tableBody.appendChild(row);
					});
				});

				  // Check if DataTable is already initialized
				if (!$.fn.DataTable.isDataTable('#adMuteTable')) {
					// Initialize DataTable
					$('#adMuteTable').DataTable({
					"pageLength": 50
					});
				} else {
					// Refresh DataTable
					$('#adMuteTable').DataTable().draw();
				}
			});
		});
	}
}

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
addLoadDataButtonListener();