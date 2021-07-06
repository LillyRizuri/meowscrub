module.exports.endsWithAny = (suffixes, string) => {
  // suffixes is an array
  return suffixes.some(function (suffix) {
    return string.endsWith(suffix);
  });
};

module.exports.trim = (string, max) => {
  return string.length > max ? `${string.slice(0, max - 3)}...` : string;
};

function formatInt(int) {
  if (int < 10) return `0${int}`;
  return `${int}`;
}

module.exports.formatDuration = (milliseconds) => {
  if (!milliseconds || !parseInt(milliseconds)) return "00:00";
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const hours = Math.floor(milliseconds / 3600000);
  if (hours > 0) {
    return `${formatInt(hours)}:${formatInt(minutes)}:${formatInt(seconds)}`;
  }
  if (minutes > 0) {
    return `${formatInt(minutes)}:${formatInt(seconds)}`;
  }
  return `00:${formatInt(seconds)}`;
};
