import {regexpFromWordList} from './word_matcher';

describe('regexpFromWordList', () => {
  describe('with [\'bob\']', () => {
    const re = regexpFromWordList(['bob']);
    it('should match original word', () => {
      expect(re.test('bob')).toBe(true);
    });
    it('should match word at end of string', () => {
      expect(re.test(' bob')).toBe(true);
    });
    it('should match word at start of string', () => {
      expect(re.test('bob ')).toBe(true);
    });
    it('should allow spaces on both sides', () => {
      expect(re.test(' bob ')).toBe(true);
    });
    it('should allow uppercase', () => {
      expect(re.test('Bob')).toBe(true);
    });
    it('should match word surrounded by special characters', () => {
      expect(re.test('*bob~')).toBe(true);
    });
    it('should match word in parentheses', () => {
      expect(re.test('(bob)')).toBe(true);
    });
    it('should not match word prefix', () => {
      expect(re.test('bobcat')).toBe(false);
    });
    it('should not match middle of word', () => {
      expect(re.test('kabobs')).toBe(false);
    });
    it('should not match word suffix', () => {
      expect(re.test('thingamabob')).toBe(false);
    });
  });
  describe('with asterisk [\'a*c\']', () => {
    const re = regexpFromWordList(['a*c']);
    it('should allow zero letter substitution', () => {
      expect(re.test('ac')).toBe(true);
    });
    it('should allow single letter substitution', () => {
      expect(re.test('abc')).toBe(true);
    });
    it('should allow multi letter substitution', () => {
      expect(re.test('abbc')).toBe(true);
    });
  });
  describe('with wildcard [\'a?c\']', () => {
    const re = regexpFromWordList(['a?c']);
    it('should allow single letter substitution', () => {
      expect(re.test('abc')).toBe(true);
    });
    it('should not allow multi letter substitution', () => {
      expect(re.test('abbc')).toBe(false);
    });
    it('should not allow zero letter substitution', () => {
      expect(re.test('ac')).toBe(false);
    });
  });
  it('should match back slash', () => {
    const re = regexpFromWordList(['A\\B']);
    expect(re.test('A\\B')).toBe(true);
  });
  describe("when matching special characters", () => {
    const specialCharacters = ['-', '[', '\\', ']', '/', '{', '}', '(', ')', '+', '.', '^', '$', '|'];
    const table = specialCharacters.map((str) => [[str], true]);
    it.each(table)('should handle %s', (words: string[], match: boolean) => {
      const re = regexpFromWordList(words);
      expect(re.test(words[0])).toBe(true);
    });
  });
  describe('with Chinese [\'你好\']', () => {
    const re = regexpFromWordList(['你好']);
    it('should not require word boundaries', () => {
      expect(re.test('你好吗')).toBe(true);
    });
  });
  describe('with Chinese wildcard [\'你?吗\']', () => {
    const re = regexpFromWordList(['你?吗']);
    it('should allow single character substitution', () => {
      expect(re.test('你好吗')).toBe(true);
    });
    it('should not allow multi-character substitution', () => {
      expect(re.test('你还好吗')).toBe(false);
    });
  });
  describe('with Japanese [\'です\']', () => {
    const re = regexpFromWordList(['です']);
    it('should not require word boundaries', () => {
      expect(re.test('私はアマンダです。')).toBe(true);
    });
  });
  describe('with Bulgarian [\'учител\']', () => {
    const re = regexpFromWordList(['учител']);
    it('should match the complete word', () => {
      expect(re.test('Аз съм учител.')).toBe(true);
    });
    it('should match the capitalized version', () => {
      expect(re.test('Аз съм Учител.')).toBe(true);
    });
    it('should not match fragments of words such as \'учителище\'', () => {
      expect(re.test('учителище')).toBe(false);
    });
  });
  describe('with emoji [\'🤠\']', () => {
    const re = regexpFromWordList(['🤠']);
    it('should match even if not surrounded by spaces', () => {
      expect(re.test('Hi🤠!')).toBe(true);
    });
    it('should not match unrelated words', () => {
      expect(re.test('Hi🤖!')).toBe(false);
    });
  });
  describe('with parenthesized terms [\'(sic)\']', () => {
    const re = regexpFromWordList(['(sic)']);
    it('should match normally when surrounded by spaces', () => {
      expect(re.test('He like (sic) burgers')).toBe(true);
    });

    it('should also match when embedded in a word', () => {
      expect(re.test('Abc(sic)def')).toBe(true);
    });
    it('should not match word missing parentheses', () => {
      expect(re.test('Jurassic park')).toBe(false);
    });
  });
});
