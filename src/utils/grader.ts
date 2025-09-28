interface GraderResult {
  ok: boolean;
  message: string;
  details?: {
    expected: string;
    actual: string;
  };
}

// Basic HTML normalization function
function normalizeHTML(html: string): string {
  return html
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\n\s*/g, '') // Remove newlines and indentation
    .replace(/data-[^=]*="[^"]*"/g, '') // Remove data-* attributes
    .replace(/id="[^"]*"/g, '') // Remove id attributes (assuming they're auto-generated)
    .toLowerCase();
}

// Basic console output normalization
function normalizeConsoleOutput(output: string): string {
  return output.trim().replace(/\s+/g, ' ');
}

// Parse HTML and extract key elements for comparison
function parseHTMLStructure(html: string): {
  textContent: string;
  tags: string[];
  normalizedHTML: string;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Get text content
  const textContent = doc.body?.textContent || '';

  // Get all tag names
  const tags: string[] = [];
  const elements = doc.body?.querySelectorAll('*') || [];
  elements.forEach(el => {
    tags.push(el.tagName.toLowerCase());
  });

  return {
    textContent: textContent.trim(),
    tags,
    normalizedHTML: normalizeHTML(html)
  };
}

// Find missing tags between expected and actual HTML
function findMissingTags(expectedTags: string[], actualTags: string[]): string[] {
  const expectedSet = new Set(expectedTags);
  const actualSet = new Set(actualTags);

  return [...expectedSet].filter(tag => !actualSet.has(tag));
}

// HTML grading function
export function runHtmlGrader(userHtml: string, expectedHtml: string): GraderResult {
  try {
    const userStructure = parseHTMLStructure(userHtml);
    const expectedStructure = parseHTMLStructure(expectedHtml);

    // First check: exact match after normalization
    if (userStructure.normalizedHTML === expectedStructure.normalizedHTML) {
      return {
        ok: true,
        message: 'Правильно! Задание выполнено.',
      };
    }

    // Second check: text content match
    if (userStructure.textContent !== expectedStructure.textContent) {
      return {
        ok: false,
        message: `Ожидался вывод "${expectedStructure.textContent}", получено "${userStructure.textContent}"`,
        details: {
          expected: expectedStructure.textContent,
          actual: userStructure.textContent
        }
      };
    }

    // Third check: missing tags
    const missingTags = findMissingTags(expectedStructure.tags, userStructure.tags);
    if (missingTags.length > 0) {
      const missingTag = missingTags[0]; // Focus on first missing tag
      const userFirstTag = userStructure.tags[0] || '';

      if (userFirstTag && userFirstTag !== missingTag) {
        return {
          ok: false,
          message: `Ожидался элемент <${missingTag}>, получено <${userFirstTag}>`,
          details: {
            expected: `<${missingTag}>`,
            actual: userFirstTag ? `<${userFirstTag}>` : 'отсутствует'
          }
        };
      } else {
        return {
          ok: false,
          message: `Отсутствует элемент <${missingTag}>`,
          details: {
            expected: `<${missingTag}>`,
            actual: 'отсутствует'
          }
        };
      }
    }

    // Fourth check: simple inclusion check
    const normalizedUser = normalizeHTML(userHtml);
    const normalizedExpected = normalizeHTML(expectedHtml);

    if (normalizedUser.includes(normalizedExpected)) {
      return {
        ok: true,
        message: 'Правильно! Задание выполнено.',
      };
    }

    // Fifth check: check if expected HTML elements exist separately
    // Split expected HTML by tags and check each one individually
    const expectedParts = expectedHtml.split(/(?=<[^/])/g).filter(part => part.trim());
    let allPartsFound = true;

    for (const part of expectedParts) {
      const normalizedPart = normalizeHTML(part.trim());
      if (normalizedPart && !normalizedUser.includes(normalizedPart)) {
        allPartsFound = false;
        break;
      }
    }

    if (allPartsFound && expectedParts.length > 0) {
      return {
        ok: true,
        message: 'Правильно! Задание выполнено.',
      };
    }

    // Sixth check: Try a more lenient approach - check if all expected text content and tags are present
    if (userStructure.textContent.includes(expectedStructure.textContent) ||
        expectedStructure.textContent.includes(userStructure.textContent)) {

      // Check if all expected tags are present in user HTML
      const expectedTags = new Set(expectedStructure.tags);
      const userTags = new Set(userStructure.tags);
      let hasAllTags = true;

      for (const tag of expectedTags) {
        if (!userTags.has(tag)) {
          hasAllTags = false;
          break;
        }
      }

      if (hasAllTags) {
        return {
          ok: true,
          message: 'Правильно! Задание выполнено.',
        };
      }
    }

    // Default fallback
    return {
      ok: false,
      message: 'Неправильно. Повторите попытку.',
      details: {
        expected: expectedHtml,
        actual: userHtml
      }
    };

  } catch (error) {
    return {
      ok: false,
      message: 'Неправильно. Повторите попытку.',
      details: {
        expected: expectedHtml,
        actual: userHtml
      }
    };
  }
}

// Console output grading function
export function runConsoleGrader(consoleOutput: string, expected: string): GraderResult {
  try {
    const normalizedOutput = normalizeConsoleOutput(consoleOutput);
    const normalizedExpected = normalizeConsoleOutput(expected);

    if (normalizedOutput === normalizedExpected) {
      return {
        ok: true,
        message: 'Правильно! Задание выполнено.',
      };
    }

    return {
      ok: false,
      message: `Ожидался: "${normalizedExpected}", получено: "${normalizedOutput}"`,
      details: {
        expected: normalizedExpected,
        actual: normalizedOutput
      }
    };

  } catch (error) {
    return {
      ok: false,
      message: 'Неправильно. Повторите попытку.',
      details: {
        expected,
        actual: consoleOutput
      }
    };
  }
}