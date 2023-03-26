import {getCanonicalHostname} from './hostname.js';

interface Options {
  blacklist: Record<string, boolean>;
  hide_completely: Record<string, boolean>;
  disable_site: Record<string, boolean>;
  enabled: boolean;
}

// Saves options to chrome.storage.local.
async function save_options() {
  const hide_completely_elem = getTextAreaElementById('hide_completely');
  const hide_completely = getOptionsMapFromTextAreaElement(hide_completely_elem, getCanonicalHostname);

  const blacklist_elem = getTextAreaElementById('blacklist');
  const blacklist = getOptionsMapFromTextAreaElement(blacklist_elem);

  const disable_site_elem = getTextAreaElementById('disable_site');
  const disable_site = getOptionsMapFromTextAreaElement(disable_site_elem, getCanonicalHostname);

  const enabled = (document.getElementById('enabled') as HTMLInputElement).checked;

  await chrome.storage.local.set({ hide_completely, blacklist, disable_site, enabled });
  const status = document.getElementById('status');
  if (!(status instanceof HTMLElement)) {
    throw new Error(`Expected element with ID 'status' to be HTMLTextAreaElement`)
  }
  status.textContent = 'Options saved.';
  setTimeout(() => {
    status.textContent = '';
  }, 750);
}

function getInputElementById(id: string): HTMLInputElement {
  const elem = document.getElementById(id);
  if (!(elem instanceof HTMLInputElement)) {
    throw new Error(`Expected element with ID '${id}' to be HTMLInputElement`);
  }
  return elem;
}

function getTextAreaElementById(id: string): HTMLTextAreaElement {
  const elem = document.getElementById(id);
  if (!(elem instanceof HTMLTextAreaElement)) {
    throw new Error(`Expected element with ID '${id}' to be HTMLTextAreaElement`);
  }
  return elem;
}

function getButtonElementById(id: string): HTMLButtonElement {
  const elem = document.getElementById(id);
  if (!(elem instanceof HTMLButtonElement)) {
    throw new Error(`Expected element with ID '${id}' to be HTMLButtonElement`);
  }
  return elem;
}

function getOptionsMapFromTextAreaElement(
  elem: HTMLTextAreaElement,
  keyMapper: (x: string) => string = (x) => x.trim()
): Record<string, boolean> {
  const strings = elem.value.split('\n');
  const map: Record<string, boolean> = {};
  strings.forEach((line) => {
    const key = keyMapper(line.trim());
    if (key) {
      map[key] = true;
    }
  });
  return map;
}


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.

async function restore_options() {
  const items = await chrome.storage.local.get(
    {
      blacklist: {},
      hide_completely: {},
      disable_site: {},
      enabled: true,
    }) as Options;
  const hide_completely = items.hide_completely;
  const hide_completely_array = getOptionsArrayFromMap(hide_completely);
  const hide_completely_elem = getTextAreaElementById('hide_completely');
  hide_completely_elem.value = hide_completely_array.join('\n');

  const blacklist = items.blacklist;
  const blacklist_array = getOptionsArrayFromMap(blacklist);
  const blacklist_elem = getTextAreaElementById('blacklist');
  blacklist_elem.value = blacklist_array.join('\n');

  const disable_site = items.disable_site;
  const disable_site_array = getOptionsArrayFromMap(disable_site);
  const disable_site_elem = getTextAreaElementById('disable_site');
  disable_site_elem.value = disable_site_array.join('\n');

  const enabled = items.enabled;
  getInputElementById('enabled').checked = enabled;
}

function getOptionsArrayFromMap(map: Record<string, boolean>): string[] {
  const array: string[] = [];
  for (const key in map) {
    if (map[key] === true) {
      array.push(key);
    }
  }
  return array;
}

document.addEventListener('DOMContentLoaded', restore_options);
getButtonElementById('save').addEventListener('click', save_options);
