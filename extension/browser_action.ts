import $ from 'jquery';
import {getCanonicalHostname} from './hostname.js';
import {GetOptions} from './options_storage';

const input:HTMLInputElement = getInputElement();

function getInputElement() : HTMLInputElement {
  const e = document.getElementById('input');
  if (!(e instanceof HTMLInputElement)) {
    console.log('expected input to be an HTMLInputElement', e);
    throw new Error('Expected input to be an HTMLInputElement');
  }
  return e;
}

// Add the word from $("#input") to the stored blacklist
async function addWord() {
  const word = input.value;
  if (word === '') {
    return;
  }
  // Get the stored blacklist
  const items = await GetOptions();
  let blacklist = items.blacklist;
  // Add word to our copy of the blacklist
  if (blacklist === undefined) {
    blacklist = {};
  }
  blacklist[word] = true;
  // Set the blacklist with our modified copy
  await chrome.storage.local.set({blacklist: blacklist});
  await rerender();
  input.value = '';
}

$('#toggle').click(async () => {
  const items = await GetOptions();
  await chrome.storage.local.set({enabled: !items['enabled']})
  await rerender();
});

// Add the word to the blacklist when the user presses enter
$('#input').keyup(function(e) {
  if (e.keyCode == 13) {
    addWord();
  }
});

$('#options').click(function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
});

$('#feedback').click(function() {
  window.open('https://goo.gl/forms/YTaZXZA0IFys1v6y2');
});

// Remove any word in the blacklist that is clicked from the storage
$('#triggers').click(async (e) => {
  if ($(e.target).is('li')) {
    const word = e.target.innerHTML;
    const items = await GetOptions();
    const blacklist = items['blacklist'];
    if (blacklist) {
      delete blacklist[word];
      await chrome.storage.local.set({blacklist: blacklist});
      await rerender();
    }
  }
});

function showFilteringPaused() {
  $('#toggle').html('&#9658;').addClass('resume').show();
  $('#list').hide();
  $('#disable_site').hide();
  $('#hide_completely').hide();
  $('#status').text('Filter Anything Everywhere is paused.').show();
}

function showError(msg:string) {
  $('#disable_site input[type=checkbox]').hide();
  $('#disable_site_label').hide();
  $('#disable_site').show();
  $('#hide_completely').hide();
  $('#list').hide();
  $('#toggle').hide();
  $('#status')
    .text(msg)
    .show();
}

function showSiteToggle(canonical_hostname:string, hostname_disabled:boolean) {
  $('#disable_site')
    .find('#disable_site_label')
    .html('Filter ' + canonical_hostname)
    .show()
    .end()
    .find('input[type=checkbox]')
    .prop('checked', !hostname_disabled)
    .click(async () => {
      const items = await GetOptions();
      const disable_site = items['disable_site'];
      if (hostname_disabled) {
        delete disable_site[canonical_hostname];
      } else {
        disable_site[canonical_hostname] = true;
      }
      await chrome.storage.local.set({disable_site: disable_site});
    })
    .show()
    .end()
    .show();
}

function hidePageSettings() {
  $('#list').hide();
  $('#status').hide();
  $('#hide_completely').hide();
}

function showPageSettings(items: any, canonical_hostname: string) {
  const hostname_hide_completely =
          items['hide_completely'][canonical_hostname] === true;
  $('#status').hide();
  $('#hide_completely')
    .find('#hide_completely_label')
    .html('Indicate filtered content on this site')
    .show()
    .end()
    .find('input[type=checkbox]')
    .prop('checked', !hostname_hide_completely)
    .click(async () => {
      const items = await GetOptions();
      const hide_completely = items['hide_completely'];
      if (hostname_hide_completely) {
        delete hide_completely[canonical_hostname];
      } else {
        hide_completely[canonical_hostname] = true;
      }
      await chrome.storage.local.set({
        hide_completely: hide_completely,
      });
    })
    .show()
    .end()
    .show();

  $('#list').show();
  // only render list if it is enabled
  if (items['blacklist'] && items['blacklist'].length !== 0) {
    const blacklist = items['blacklist'];
    const $ul = $('<ul/>');
    Object.entries(blacklist).forEach(([key, value]) => {
      const $li = $('<li/>').text(key);
      $ul.append($li);
    });
    $('#triggers').empty().append($ul);
  } else {
    $('#triggers').html('blacklist is empty');
  }
}

// Shows a list of words generated from the blacklist.
async function rerender() {
  const items = await GetOptions();
  if (items['enabled'] === false) {
    showFilteringPaused();
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tab.id === undefined) {
    showError('Oops! Cannot determine the active tab!');
    throw new Error('Cannot determine the active tab!');
  }

  const injection = {
    target: {tabId: tab.id},
    func: () => {
      // This is a hack to check the status of the content script.
      // The value is set in content.ts.
      // @ts-expect-error Property 'hasAqi' does not exist on type 'Window & typeof globalThis'.
      return window.hasAqi;
    },
  };
  let injection_results = null;
  try {
    injection_results = await chrome.scripting.executeScript(injection);
  } catch (e) {
    showError('Extensions aren\'t allowed on this page.');
    throw (e);
  }
  if (!injection_results[0].result) {
    showError('Looks like a new installation. To start filtering, refresh the page.');
    return;
  }

  if (tab.url === undefined) {
    showError('Oops! Cannot determine the URL of the active tab!');
    throw new Error('Tab has undefined URL!');
  }

  $('#toggle').html('&#10074;&#10074;').removeClass('resume').show();

  const tab_url = new URL(tab.url);
  const canonical_hostname = getCanonicalHostname(tab_url.hostname);
  const hostname_disabled =
          items['disable_site'][canonical_hostname] === true;
  showSiteToggle(canonical_hostname, hostname_disabled);
  if (hostname_disabled) {
    hidePageSettings();
    return;
  }
  if (!hostname_disabled) {
    showPageSettings(items, canonical_hostname);
  }
}

// Initial render
rerender();

chrome.storage.onChanged.addListener(function(changes, namespace) {
  rerender();
});
