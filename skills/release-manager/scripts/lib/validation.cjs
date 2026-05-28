// SemVer regex based on https://semver.org/
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

function validateVersion(version) {
  if (typeof version !== 'string') return false;
  // Allow 'v' prefix but validate the rest as SemVer
  const v = version.startsWith('v') ? version.substring(1) : version;
  return SEMVER_REGEX.test(v);
}

module.exports = { validateVersion };
