export interface Options {
  blacklist: Record<string, boolean>;
  hide_completely: Record<string, boolean>;
  disable_site: Record<string, boolean>;
  enabled: boolean;
}

export async function GetOptions() : Promise<Options> {
  return await chrome.storage.local.get(
    {
      blacklist: {},
      hide_completely: {},
      disable_site: {},
      enabled: true,
    }) as Options;
}