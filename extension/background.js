chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  const count_string = msg.count ? msg.count.toString() : '';
  chrome.action.setBadgeBackgroundColor({ color: [100, 100, 100, 255] });
  chrome.action.setBadgeText({ text: count_string, tabId: sender.tab.id });
});

chrome.runtime.setUninstallURL('https://goo.gl/forms/uNxb8D4S8B9YeEln2');
