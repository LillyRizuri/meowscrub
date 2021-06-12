module.exports.endsWithAny = (suffixes, string) => {
  // suffixes is an array
  return suffixes.some(function (suffix) {
    return string.endsWith(suffix);
  });
};
