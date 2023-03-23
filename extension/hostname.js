export function getCanonicalHostname(name) {
  if (name.startsWith("www.")) {
    return name.substring(4);
  } else {
    return name;
  }
}