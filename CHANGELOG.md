# CHANGELOG

```txt
Summary
  1. document grouping follow 'SemVer2.0' protocol
  2. use 'PATCH' as a minimum granularity
  3. use concise descriptions
  4. type: feat \ fix \ update \ perf \ remove \ docs \ chore
  5. version timestamp follow the yyyy.MM.dd format
```

## 1.1.0 [2026.10.28]

- update: translate with double Shift instead of a single Shift press
- feat: one-time tutorial for new and upgrading users
- feat: popup shows loading and error states
- feat: close popup with Esc or the close button
- feat: delete history items from a hover button, with undo
- fix: popup stays inside the viewport
- fix: crash when pressing Shift with no selection
- fix: stacked popups and leaked React roots
- fix: concurrent history saves overwriting each other
- fix: sanitize example sentences instead of injecting HTML
- update: repeated words move to the top of history instead of duplicating
- update: history capped at 1000 words
- remove: swipe-to-delete
- remove: sending Google cookies with translation requests

## 0.0.0 [2025.02.12]

- feat: initial
- feat: generator by ![create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)
