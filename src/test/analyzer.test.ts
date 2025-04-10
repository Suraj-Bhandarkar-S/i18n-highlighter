import { findHardcodedStrings } from '../utils/analyzer';
import * as assert from 'assert';

describe('Hardcoded String Detection', () => {
  it('should find one hardcoded string', () => {
    const content = `<div>Hello World</div>`;
    const result = findHardcodedStrings(content);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text.trim(), 'Hello World');
  });

  it('should ignore dynamic expressions', () => {
    const content = `<div>{t("hello")}</div>`;
    const result = findHardcodedStrings(content);
    assert.strictEqual(result.length, 0);
  });

  it('should handle quotes at end', () => {
    const content = `<p>Hello World"</p>`;
    const result = findHardcodedStrings(content);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].text.includes('Hello World'));
  });

  it('should find multiple text nodes', () => {
    const content = `<span>First</span><span>Second</span>`;
    const result = findHardcodedStrings(content);
    assert.strictEqual(result.length, 2);
  });
});
