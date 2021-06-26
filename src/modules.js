module.exports.endsWithAny = (suffixes, string) => {
  // suffixes is an array
  return suffixes.some(function (suffix) {
    return string.endsWith(suffix);
  });
};

module.exports.trim = (string, max) => {
  return string.length > max ? `${string.slice(0, max - 3)}...` : string;
};