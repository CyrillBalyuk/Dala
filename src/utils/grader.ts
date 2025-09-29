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

// Multi-language text matching function
function createTextMatcher(text: string, lang: string = 'ru'): string[] {
  const variations = [text];

  // Add language-specific variations
  if (lang === 'kz') {
    // Common Kazakh-Russian word equivalents
    const kazakhRussianMap: {[key: string]: string} = {
      'сәлем': 'привет',
      'қош келдіңіз': 'добро пожаловать',
      'мен туралы': 'обо мне',
      'хобби': 'хобби',
      'басты': 'главная',
      'контактілер': 'контакты',
      'жіберу': 'отправить',
      'аты': 'имя',
      'жасы': 'возраст',
      'алма': 'яблоко',
      'банан': 'банан',
      'апельсин': 'апельсин',
      'бірінші': 'первый',
      'екінші': 'второй',
      'үшінші': 'третий',
      'су': 'вода',
      'шырын': 'сок',
      'сусындар': 'напитки',
      'менің сайтым': 'мой сайт',
      'менің алғашқы бетім': 'моя первая страница',
      'менің сайтыма қош келдіңіз': 'добро пожаловать на мой сайт',
      'қалың мәтін': 'жирный текст',
      'курсив мәтін': 'курсивный текст',
      'асты сызылған мәтін': 'подчёркнутый текст',
      'сүйкімді мысық': 'милый кот',
      'басуға болатын мысық': 'кликабельный кот',
      'арсен аманбай': 'арсен',
      'иван иванов': 'иван иванов',
      'аты жөні': 'имя',
      'маған хабарласу': 'связаться со мной',
      'мен туралы': 'обо мне',
      'менің суретім': 'моё фото',
      'менің хобби': 'мои хобби',
      'негізгі ақпарат': 'основная информация',
      'бағдарламау': 'программирование',
      'гитарада ойнау': 'игра на гитаре',
      'саяхаттау': 'путешествия'
    };

    // Add Russian equivalents for Kazakh text
    let russianVersion = text.toLowerCase();
    for (const [kz, ru] of Object.entries(kazakhRussianMap)) {
      russianVersion = russianVersion.replace(new RegExp(kz, 'gi'), ru);
    }
    if (russianVersion !== text.toLowerCase()) {
      variations.push(russianVersion);
    }
  }

  return variations.map(v => v.toLowerCase().trim());
}

// Enhanced HTML grading function with multilingual support
export function runHtmlGrader(userHtml: string, expectedHtml: string, userLang: string = 'ru'): GraderResult {
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

    // Second check: text content match with multilingual support
    const userTextVariations = createTextMatcher(userStructure.textContent, userLang);
    const expectedTextVariations = createTextMatcher(expectedStructure.textContent, userLang);

    let textMatches = false;
    for (const userVar of userTextVariations) {
      for (const expectedVar of expectedTextVariations) {
        if (userVar === expectedVar || userVar.includes(expectedVar) || expectedVar.includes(userVar)) {
          textMatches = true;
          break;
        }
      }
      if (textMatches) break;
    }

    if (!textMatches && userStructure.textContent.trim() !== '' && expectedStructure.textContent.trim() !== '') {
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

    // Sixth check: Try a more lenient approach with multilingual text matching
    const userTextLower = userStructure.textContent.toLowerCase();
    const expectedTextLower = expectedStructure.textContent.toLowerCase();

    let hasTextMatch = false;
    const userVariations = createTextMatcher(userStructure.textContent, userLang);
    const expectedVariations = createTextMatcher(expectedStructure.textContent, userLang);

    for (const userVar of userVariations) {
      for (const expectedVar of expectedVariations) {
        if (userVar.includes(expectedVar) || expectedVar.includes(userVar)) {
          hasTextMatch = true;
          break;
        }
      }
      if (hasTextMatch) break;
    }

    if (hasTextMatch || userTextLower.includes(expectedTextLower) || expectedTextLower.includes(userTextLower)) {
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

// Console output grading function with multilingual support
export function runConsoleGrader(consoleOutput: string, expected: string, userLang: string = 'ru'): GraderResult {
  try {
    const normalizedOutput = normalizeConsoleOutput(consoleOutput);
    const normalizedExpected = normalizeConsoleOutput(expected);

    // Check exact match first
    if (normalizedOutput === normalizedExpected) {
      return {
        ok: true,
        message: 'Правильно! Задание выполнено.',
      };
    }

    // Check multilingual variations
    const outputVariations = createTextMatcher(normalizedOutput, userLang);
    const expectedVariations = createTextMatcher(normalizedExpected, userLang);

    for (const outputVar of outputVariations) {
      for (const expectedVar of expectedVariations) {
        if (outputVar === expectedVar) {
          return {
            ok: true,
            message: 'Правильно! Задание выполнено.',
          };
        }
      }
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