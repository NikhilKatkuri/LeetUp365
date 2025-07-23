
/**
 * @param {string[]} strs
 * @return {string}
 */

var longestCommonPrefix = function (strs) {
  if (strs.length === 1) return strs[0];

  let sortstr = strs.sort((a, b) => a.length - b.length);

  let [prefix, ...remstr] = sortstr;

  for (const str of remstr) {
    while (!str.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }

  return prefix;
};

const s = [
  ["hi"],
  ["flower", "flow", "flight"],
  ["dog", "racecar", "car"],
  ["interview", "internet", "interval"],
  ["apple", "ape", "april"],
  ["cat", "caterpillar", "catalog"],
  ["sun", "moon", "star"],
  ["prefix", "preach", "prevent"],
  ["hello", "helicopter", "help"],
  ["fast", "faster", "fastest"],
  ["blue", "black", "blank"],
];

s.forEach((strs) => {
  console.log(longestCommonPrefix(strs));
});
