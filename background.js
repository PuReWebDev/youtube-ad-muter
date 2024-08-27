/**
 * @file background.js
 * @description Background script to set up rules for when the extension should be active.
 * @example This script is automatically run by the Chrome extension when it is installed.
 * @returns {void} This script does not return any value.
 * @author Genesis Font <purewebdev@gmail.com>
 */

chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'www.youtube.com' },
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'takeScreenshot') {
		chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
				sendResponse({ success: false });
				return;
			}

			// Store the screenshot in local storage
			chrome.storage.local.set({ lastScreenshot: dataUrl }, function () {
				console.log('Screenshot saved. with a data url of: ', dataUrl);
				sendResponse({ success: true });
			});
		});

		// Indicate that the response will be sent asynchronously
		return true;
	}
});