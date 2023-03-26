export function getCanonicalHostname(name:string) {
  if (name.startsWith('www.')) {
    return name.substring(4);
  } else {
    return name;
  }
}
