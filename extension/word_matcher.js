// Escape bad characters from user input, but allow wildcards.
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&")
            .replace(/\*/g, "[^\\s]*")
            .replace(/\?/g, "[^\\s]");
}

// Some characters are represented by more than a byte. To match them
// in a regular expression, we need to modify the way they are stored.
function makeRegexCharactersOkay(string){
  var hex, i;

  var result = "";
  for (i=0; i<string.length; i++) {
      hex = string.charCodeAt(i);
      if (hex < 256) {
        result += string.charAt(i);
      } else {
        hex = hex.toString(16);
        result += "\\u" + (("000"+hex).slice(-4));
      }
  }
  return result;
}

export function regexpFromWordList(bannedWords) {
  var escapedBannedWords = bannedWords.map((word) => {
    let result = escapeRegExp(word);

    // Require word boundaries next to letters except in languages that don't
    // necessarily use spaces between words
    // See https://www.w3.org/International/articles/typography/linebreak.en
    const letterInLanguageWithoutSpacesRegexp =
      /[\p{sc=Han}\p{sc=Katakana}\p{sc=Hangul}\p{sc=Hiragana}\p{sc=Khmer}\p{sc=Lao}\p{sc=Myanmar}\p{sc=Thai}\p{sc=Balinese}\p{sc=Batak}\p{sc=Javanese}\p{sc=Cham}\p{sc=Vai}]/u;
    const lastChar = word.slice(-1);
    const firstChar = word.slice(0, 1);
    if (lastChar.match(/\p{Letter}/u) && !lastChar.match(letterInLanguageWithoutSpacesRegexp)) {
      result = result + "\\b";
    }
    if (firstChar.match(/^\p{Letter}/u) && !firstChar.match(letterInLanguageWithoutSpacesRegexp)) {
      result = "\\b" + result;
    }
    return result;
  });
  var regexString = escapedBannedWords.map(function(elem, index){
    return makeRegexCharactersOkay(elem);
  }).join("|");

  if (regexString == "") {
    // Rejects everything
    regexString = "[^\\w\\W]";
  }
  return new RegExp(regexString, "i");
}