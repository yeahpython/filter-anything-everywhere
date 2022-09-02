chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	var count_string = msg.count ? msg.count.toString() : "";
	chrome.browserAction.setBadgeBackgroundColor({ color: [100, 100, 100, 255] });
	chrome.browserAction.setBadgeText({text: count_string, "tabId": sender.tab.id});
});

chrome.runtime.setUninstallURL("https://goo.gl/forms/uNxb8D4S8B9YeEln2");