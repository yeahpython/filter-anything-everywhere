import { regexpFromWordList } from '../extension/word_matcher.js'

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
  describe('with Chinese [\'你好\']', () => {
    const re = regexpFromWordList(['你好']);
    it('should not require word boundaries', () => {
      expect(re.test('你好吗')).toBe(true);
    });
  });
  describe('with Japanese [\'です\']', () => {
    const re = regexpFromWordList(['です']);
    it('should not require word boundaries', () => {
      expect(re.test('私はアマンダです。')).toBe(true);
    });
  });
});