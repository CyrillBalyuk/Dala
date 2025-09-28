import { describe, it, expect } from 'vitest';
import { runHtmlGrader, runConsoleGrader } from './grader';

describe('HTML Grader', () => {
  it('should return success for exact match', () => {
    const userHtml = '<div>Hello World</div>';
    const expectedHtml = '<div>Hello World</div>';

    const result = runHtmlGrader(userHtml, expectedHtml);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Правильно! Задание выполнено.');
  });

  it('should detect missing tag', () => {
    const userHtml = '<div>Hello World</div>';
    const expectedHtml = '<div><span>Hello World</span></div>';

    const result = runHtmlGrader(userHtml, expectedHtml);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Ожидался элемент <span>');
    expect(result.details).toBeDefined();
    expect(result.details?.expected).toBe('<span>');
    expect(result.details?.actual).toBe('<div>');
  });

  it('should handle whitespace differences correctly', () => {
    const userHtml = `
      <div>
        Hello World
      </div>
    `;
    const expectedHtml = '<div>Hello World</div>';

    const result = runHtmlGrader(userHtml, expectedHtml);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Правильно! Задание выполнено.');
  });
});

describe('Console Grader', () => {
  it('should return success for exact match', () => {
    const userOutput = 'Hello World';
    const expectedOutput = 'Hello World';

    const result = runConsoleGrader(userOutput, expectedOutput);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Правильно! Задание выполнено.');
  });

  it('should handle whitespace normalization', () => {
    const userOutput = '  Hello   World  ';
    const expectedOutput = 'Hello World';

    const result = runConsoleGrader(userOutput, expectedOutput);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Правильно! Задание выполнено.');
  });

  it('should detect output mismatch', () => {
    const userOutput = 'Hello Universe';
    const expectedOutput = 'Hello World';

    const result = runConsoleGrader(userOutput, expectedOutput);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Ожидался: "Hello World", получено: "Hello Universe"');
    expect(result.details).toBeDefined();
    expect(result.details?.expected).toBe('Hello World');
    expect(result.details?.actual).toBe('Hello Universe');
  });
});