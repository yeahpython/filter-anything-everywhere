import $ from 'jquery';
import {getCanonicalHostname} from './hostname.js';

const input = document.getElementById('input');

// Add the word from $("#input") to the stored blacklist
function addWord() {
  const word = input.value;
  if (word === '') {
    return;
  }
  // Get the stored blacklist
  chrome.storage.local.get('blacklist', function(items) {
    let blacklist = items['blacklist'];
    // Add word to our copy of the blacklist
    if (blacklist === undefined) {
      blacklist = {};
    }
    blacklist[word] = true;
    // Set the blacklist with our modified copy
    chrome.storage.local.set({blacklist: blacklist}, function() {
      rerender();
      input.value = '';
    });
  });
}

$('#toggle').click(function() {
  chrome.storage.local.get({enabled: true}, function(items) {
    chrome.storage.local.set({enabled: !items['enabled']}, rerender);
  });
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
  if ($(event.target).is('li')) {
    const word = event.target.innerHTML;
    const items = await chrome.storage.local.get('blacklist');
    const blacklist = items['blacklist'];
    if (blacklist) {
      delete blacklist[word];
      await chrome.storage.local.set({blacklist: blacklist});
      await rerender();
    }
  }
});

function showErrorNotAllowed() {
  $('#disable_site input[type=checkbox]').hide();
  $('#disable_site_label').hide();
  $('#disable_site').show();
  $('#hide_completely').hide();
  $('#list').hide();
  $('#toggle').hide();
  $('#status').text('Extensions aren\'t allowed on this page.').show();
}

function showErrorRefreshRequired() {
  $('#disable_site input[type=checkbox]').hide();
  $('#disable_site_label').hide();
  $('#disable_site').show();
  $('#hide_completely').hide();
  $('#list').hide();
  $('#toggle').hide();
  $('#status')
    .text(
      'Looks like a new installation. To start filtering, refresh the page.',
    )
    .show();
}

// Shows a list of words generated from the blacklist.
async function rerender() {
  const list = $('<ul/>');
  const items = await chrome.storage.local.get(
    {blacklist: {}, enabled: true, hide_completely: {}, disable_site: {}});
    // async function(items)  {
  if (items['enabled'] === false) {
    $('#toggle').html('&#9658;').addClass('resume').show();
    $('#list').hide();
    $('#disable_site').hide();
    $('#hide_completely').hide();
    $('#status').text('Filter Anything Everywhere is paused.').show();
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const injection = {
    target: {tabId: tab.id},
    func: () => {
      return window.hasAqi;
    },
  };

  const injection_results = await chrome.scripting.executeScript(injection);

  if (chrome.runtime.lastError) {
    const errorMsg = chrome.runtime.lastError.message;
    if (
      errorMsg == 'Cannot access a chrome:// URL' ||
            injection_results == undefined
    ) {
      showErrorNotAllowed();
      return;
    }
  }
  if (!injection_results[0].result) {
    showErrorRefreshRequired();
    return;
  }

  $('#toggle').html('&#10074;&#10074;').removeClass('resume').show();
  const tab_url = new URL(tab.url);
  const canonical_hostname = getCanonicalHostname(tab_url.hostname);
  const hostname_disabled =
          items['disable_site'][canonical_hostname] === true;
  $('#disable_site')
    .find('#disable_site_label')
    .html('Filter ' + canonical_hostname)
    .show()
    .end()
    .find('input[type=checkbox]')
    .prop('checked', !hostname_disabled)
    .click(async () => {
      const items = await chrome.storage.local.get({disable_site: {}});
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
  if (hostname_disabled) {
    $('#list').hide();
    $('#status').hide();
    $('#hide_completely').hide();
    return;
  }
  if (!hostname_disabled) {
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
        const items = await chrome.storage.local.get(
          {hide_completely: {}});
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
      $.each(items['blacklist'], function(currentValue, trueOrFalse) {
        $('<li/>').html(currentValue).appendTo(list);
      });
      $('#triggers').html(list);
    } else {
      $('#triggers').html('blacklist is empty');
    }
  }
}

// Initial render
rerender();

chrome.storage.onChanged.addListener(function(changes, namespace) {
  rerender();
});
