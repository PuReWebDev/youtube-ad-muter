document.addEventListener('DOMContentLoaded', function () {
	// Retrieve existing data from chrome.storage
	chrome.storage.local.get(['adMuteData'], function (result) {
		const adMuteData = result.adMuteData || {};
		const tableBody = document.querySelector('#adMuteTable tbody');

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

		// Initialize DataTable
		$('#adMuteTable').DataTable({
			"pageLength": 50
		});
	});
});
