# Internationalization (i18n) Guide

## Overview

ROMA-01 frontend supports bilingual interface: **English** and **简体中文**.

## Quick Usage

### Switch Language

Click the language toggle in the header (top right):
- **EN** - English interface
- **中文** - Chinese interface

The selected language is saved to browser localStorage and persists across sessions.

## For Users

### Supported Languages

- ✅ **English (EN)**: Complete interface translation
- ✅ **简体中文 (ZH)**: Complete interface translation

### What Gets Translated

1. **Header Navigation**
   - Live / 实时
   - Leaderboard / 排行榜
   - Models / 模型
   - About / 关于
   - Language toggle (EN/中文)

2. **Right Side Tabs**
   - Positions / 持仓
   - Trades / 交易
   - Decisions / 决策
   - Prompts / 提示词
   - Agent selector / 智能体选择器

3. **Prompt Editor**
   - All labels and buttons
   - Status messages
   - Placeholders (with Chinese examples)
   - Field titles (Trading Philosophy, Entry Preferences, etc.)

4. **Leaderboard Page**
   - Page title / 页面标题
   - Overall Stats / Advanced Analytics / 总体统计 / 高级分析
   - Table headers (Rank, Model, Account Value, etc.)
   - Metrics (Win Rate, Profit Factor, Sharpe Ratio, etc.)
   - Notes and tooltips

5. **Agent Detail Page**
   - Statistics summary / 统计摘要
   - Active Positions / 活跃持仓
   - Last 25 Trades / 最近25笔交易
   - Recent Decisions / 最近决策
   - Hold Times / 持仓时间
   - Table headers and data labels

6. **About Page**
   - All paragraphs and descriptions
   - ROMA vs Traditional comparison
   - Platform features list
   - Quote and footer

7. **Common UI Elements**
   - Loading states / 加载状态
   - Error messages / 错误消息
   - Action buttons / 操作按钮
   - Empty states / 空状态提示

### Custom Prompts Language

You can use **either language** for custom prompts:
- ✅ **Chinese prompts** - Recommended for DeepSeek/Qwen (better understanding, lower token cost)
- ✅ **English prompts** - Recommended for Claude/GPT/Gemini (native language)

## For Developers

### Architecture

```
frontend/src/
├── store/
│   ├── useTheme.ts         # Theme state management
│   └── useLanguage.ts      # Language state management
├── lib/
│   └── i18n.ts             # Translation dictionaries
└── components/
    └── language/
        └── LanguageProvider.tsx  # Language initialization
```

### Adding New Translations

Edit `frontend/src/lib/i18n.ts`:

```typescript
export const translations = {
  en: {
    mySection: {
      myKey: "English Text",
    },
  },
  zh: {
    mySection: {
      myKey: "中文文本",
    },
  },
};
```

### Using Translations in Components

```typescript
import { useLanguage } from "@/store/useLanguage";
import { getTranslation } from "@/lib/i18n";

function MyComponent() {
  const language = useLanguage((s) => s.language);
  const t = getTranslation(language);
  
  return <div>{t.mySection.myKey}</div>;
}
```

### Adding New Languages

1. Add language to type in `useLanguage.ts`:
```typescript
type Language = "en" | "zh" | "ja" | "ko";  // Add more
```

2. Add translations in `i18n.ts`:
```typescript
export const translations = {
  en: { ... },
  zh: { ... },
  ja: { ... },  // Japanese
  ko: { ... },  // Korean
};
```

3. Add language option in Header:
```typescript
<button onClick={() => setLanguage("ja")}>日本語</button>
```

## Best Practices

1. **Always provide both languages** when adding new UI text
2. **Keep translations consistent** across the platform
3. **Use appropriate language** for custom prompts based on the AI model
4. **Test both languages** when making UI changes

## Current Coverage

| Component | EN | ZH | Notes |
|-----------|----|----|-------|
| Header | ✅ | ✅ | Navigation, language toggle |
| Right Side Tabs | ✅ | ✅ | Positions, Trades, Decisions, Prompts |
| Prompt Editor | ✅ | ✅ | All labels, placeholders, buttons |
| Leaderboard Page | ✅ | ✅ | Stats, table headers, tooltips |
| Agent Detail Page | ✅ | ✅ | Statistics, positions, trades, decisions |
| About Page | ✅ | ✅ | All content, comparisons, features |
| Home Page | ✅ | ✅ | Minimal text (data-focused) |

**Translation Coverage**: 100% complete for all user-facing text.

---

**Version**: 2.0  
**Last Updated**: 2025-11-03

