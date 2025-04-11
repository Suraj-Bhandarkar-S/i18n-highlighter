# Change Log

All notable changes to the "i18n-highlighter" extension will be documented in this file.

---

## [0.0.5] – 2025-04-11

### 💡 New Feature

- Added **Quick Fix (💡)** to ignore hardcoded strings using `<!-- i18n-ignore -->`
- Added `scanOnStartup` setting  
  → Automatically scans all `.html`, `.tsx`, `.jsx` files for hardcoded strings on VS Code launch

### ✅ Improvements

- Diagnostics now include a `source` for accurate Quick Fix matching
- Fixed issue with duplicate command registration
- Refactored for more stable activation and ignore logic
- Skips HTML entities like `&nbsp;`, `&copy;`, etc.
- Improved regex logic for more accurate detection

---

## [0.0.1] – 2025-04-10

### 🚀 Initial Release

- Detects and highlights hardcoded strings in HTML, JSX, TSX files  
- Shows warnings in the Problems tab for missing i18n usage  
- Ignores dynamic content wrapped in `{}` or string literals  
- Fully tested string matching engine with regex  
- Minimal, clean 128x128 icon included  




