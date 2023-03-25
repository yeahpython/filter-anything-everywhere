// Escape bad characters from user input, but allow wildcards.
function escapeRegExp(str) {
  return str
    .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, '\\$&')
    .replace(/\*/g, '[^\\s]*')
    .replace(/\?/g, '[^\\s]');
}

export function regexpFromWordList(bannedWords) {
  const escapedBannedWords = bannedWords.map((word) => {
    let result = escapeRegExp(word);

    // Require word boundaries next to letters except in languages that don't
    // necessarily use spaces between words
    // See https://www.w3.org/International/articles/typography/linebreak.en
    const letterInLanguageWithoutSpacesRegexp =
      /[\p{sc=Han}\p{sc=Katakana}\p{sc=Hangul}\p{sc=Hiragana}\p{sc=Khmer}\p{sc=Lao}\p{sc=Myanmar}\p{sc=Thai}\p{sc=Balinese}\p{sc=Batak}\p{sc=Javanese}\p{sc=Cham}\p{sc=Vai}]/u;
    const lastChar = word.slice(-1);
    const firstChar = word.slice(0, 1);
    if (
      lastChar.match(/\p{Letter}/u) &&
      !lastChar.match(letterInLanguageWithoutSpacesRegexp)
    ) {
      result = result + '(?!\\p{Letter})';
    }
    if (
      firstChar.match(/\p{Letter}/u) &&
      !firstChar.match(letterInLanguageWithoutSpacesRegexp)
    ) {
      result = '(?<!\\p{Letter})' + result;
    }
    return result;
  });
  let regexString = escapedBannedWords.join('|');

  if (regexString == '') {
    // Rejects everything
    regexString = '[^\\w\\W]';
  }
  return new RegExp(regexString, 'iu');
}
