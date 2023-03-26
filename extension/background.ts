/// <reference types="chrome" />

chrome.runtime.onMessage.addListener(function(msg, sender) {
  const countString = msg.count ? msg.count.toString() : '';
  chrome.action.setBadgeBackgroundColor({color: [100, 100, 100, 255]});
  if (!sender.tab) {
    console.error('Unable to handle message without tab ID.');
    return;
  }
  chrome.action.setBadgeText({text: countString, tabId: sender.tab.id});
});

chrome.runtime.setUninstallURL('https://goo.gl/forms/uNxb8D4S8B9YeEln2');
