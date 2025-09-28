// Language Switch Verification Script
// Run this in browser console on each page to verify functionality

console.log('🧪 Language Switch Verification Script');
console.log('=====================================');

// Test 1: Check if language switcher exists
function checkLanguageSwitcher() {
    const langSwitcher = document.querySelector('.language-switcher');
    const ruBtn = document.querySelector('.lang-btn:first-child');
    const kzBtn = document.querySelector('.lang-btn:last-child');

    console.log('📍 Test 1: Language Switcher Presence');
    console.log('Language switcher found:', !!langSwitcher);
    console.log('RU button found:', !!ruBtn);
    console.log('KZ button found:', !!kzBtn);

    if (ruBtn && kzBtn) {
        console.log('RU button disabled:', ruBtn.disabled);
        console.log('KZ button disabled:', kzBtn.disabled);
        console.log('RU button tooltip:', ruBtn.title);
        console.log('KZ button tooltip:', kzBtn.title);
        console.log('RU button classes:', ruBtn.className);
        console.log('KZ button classes:', kzBtn.className);
    }

    return { langSwitcher: !!langSwitcher, ruBtn, kzBtn };
}

// Test 2: Check current page type
function checkPageType() {
    const path = window.location.pathname;
    const isModulePage = /^\/course\/[^/]+\/module\/[^/]+$/.test(path);
    const isCourse = path.includes('/course/') && !isModulePage;
    const isLanding = path === '/';

    console.log('📍 Test 2: Page Type Detection');
    console.log('Current path:', path);
    console.log('Is module page:', isModulePage);
    console.log('Is course page:', isCourse);
    console.log('Is landing page:', isLanding);

    return { path, isModulePage, isCourse, isLanding };
}

// Test 3: Test language switching (only if not on module page)
function testLanguageSwitch() {
    const pageInfo = checkPageType();
    const { ruBtn, kzBtn } = checkLanguageSwitcher();

    console.log('📍 Test 3: Language Switch Functionality');

    if (pageInfo.isModulePage) {
        console.log('❌ Skipping language switch test - on module page (buttons should be disabled)');
        return false;
    }

    if (!ruBtn || !kzBtn) {
        console.log('❌ Cannot test - buttons not found');
        return false;
    }

    // Get current language
    const currentLang = localStorage.getItem('language') || 'ru';
    console.log('Current language from localStorage:', currentLang);

    // Try switching language
    try {
        if (currentLang === 'ru') {
            console.log('Attempting to switch to KZ...');
            kzBtn.click();
        } else {
            console.log('Attempting to switch to RU...');
            ruBtn.click();
        }

        // Check if language changed
        setTimeout(() => {
            const newLang = localStorage.getItem('language') || 'ru';
            console.log('New language after click:', newLang);
            console.log('Language switch successful:', newLang !== currentLang);
        }, 500);

        return true;
    } catch (error) {
        console.log('❌ Error during language switch:', error);
        return false;
    }
}

// Test 4: Check for translation content
function checkTranslationContent() {
    console.log('📍 Test 4: Translation Content Check');

    // Check for translated text in common elements
    const headerLinks = document.querySelectorAll('.nav-link');
    const authButtons = document.querySelectorAll('.auth-btn');

    console.log('Header navigation links found:', headerLinks.length);
    headerLinks.forEach((link, index) => {
        console.log(`Nav link ${index + 1}:`, link.textContent.trim());
    });

    console.log('Auth buttons found:', authButtons.length);
    authButtons.forEach((btn, index) => {
        console.log(`Auth button ${index + 1}:`, btn.textContent.trim());
    });
}

// Main test runner
function runAllTests() {
    console.log('🚀 Running all language switch tests...');
    console.log('');

    const switcherInfo = checkLanguageSwitcher();
    const pageInfo = checkPageType();
    checkTranslationContent();

    if (!pageInfo.isModulePage) {
        testLanguageSwitch();
    }

    console.log('');
    console.log('✅ Test run completed');

    // Return summary
    return {
        hasLanguageSwitcher: !!switcherInfo.langSwitcher,
        buttonsDisabled: switcherInfo.ruBtn?.disabled && switcherInfo.kzBtn?.disabled,
        isModulePage: pageInfo.isModulePage,
        currentPath: pageInfo.path,
        tooltipText: switcherInfo.ruBtn?.title || switcherInfo.kzBtn?.title
    };
}

// Auto-run tests
const results = runAllTests();

// Export results for verification
window.languageTestResults = results;
console.log('Results available in window.languageTestResults');