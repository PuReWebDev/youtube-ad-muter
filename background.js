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