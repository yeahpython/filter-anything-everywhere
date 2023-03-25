import { getCanonicalHostname } from './hostname.js';

// Saves options to chrome.storage.local.
function save_options() {
  const hide_completely_string =
    document.getElementById('hide_completely').value;
  const hide_completely_strings = hide_completely_string.split('\n');
  const hide_completely = {};
  hide_completely_strings.forEach(function (element) {
    if (element) {
      hide_completely[getCanonicalHostname(element)] = true;
    }
  });

  const blacklist_string = document.getElementById('blacklist').value;
  const blacklist_strings = blacklist_string.split('\n');
  const blacklist = {};
  blacklist_strings.forEach(function (element) {
    if (element) {
      blacklist[element] = true;
    }
  });

  const disable_site_string = document.getElementById('disable_site').value;
  const disable_site_strings = disable_site_string.split('\n');
  const disable_site = {};
  disable_site_strings.forEach(function (element) {
    if (element) {
      disable_site[getCanonicalHostname(element)] = true;
    }
  });

  const enabled = document.getElementById('enabled').checked;
  chrome.storage.local.set(
    {
      hide_completely: hide_completely,
      blacklist: blacklist,
      disable_site: disable_site,
      enabled: enabled,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function () {
        status.textContent = '';
      }, 750);
    },
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(
    {
      blacklist: {},
      hide_completely: {},
      disable_site: {},
      enabled: true,
    },
    function (items) {
      const hide_completely = items['hide_completely'];
      const hide_completely_array = [];
      for (const key in hide_completely) {
        if (hide_completely[key] === true) {
          hide_completely_array.push(key);
        }
      }
      document.getElementById('hide_completely').value =
        hide_completely_array.join('\n');

      const blacklist = items['blacklist'];
      const blacklist_array = [];
      for (const key in blacklist) {
        if (blacklist[key] === true) {
          blacklist_array.push(key);
        }
      }
      document.getElementById('blacklist').value = blacklist_array.join('\n');

      const disable_site = items['disable_site'];
      const disable_site_array = [];
      for (const key in disable_site) {
        if (disable_site[key] === true) {
          disable_site_array.push(key);
        }
      }
      document.getElementById('disable_site').value =
        disable_site_array.join('\n');

      document.getElementById('enabled').checked = items.enabled;
    },
  );
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
