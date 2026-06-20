# DevMeet Design System & Instructions

This document summarizes the theme styling, color tokens, typography scales, and UI parameters used across the DevMeet applications, as extracted from the reference design.

---

## 🎨 Color Palette

### Surfaces & Renders
| Variable Name | Hex Code | Description |
| :--- | :--- | :--- |
| `Obsidian Canvas` (Background) | `#101010` | The primary page background color. |
| `Void Surface` | `#080808` | Extremely dark void background surface. |
| `Surface Surface` | `#212121` | Standard card/container background. |
| `Elevated Surface` | `#333333` | Lighter container background for hovered or elevated components. |

### Text Colors
| Variable Name | Hex Code | Description |
| :--- | :--- | :--- |
| `Frost Text` (Primary) | `#f3f3f3` | High-contrast off-white text color. |
| `Silver Text` | `#c1c1c1` | Medium-high contrast greyish text. |
| `Smoke Text` | `#949494` | Medium contrast text for body and labels. |
| `Graphite Text` | `#888888` | Muted descriptions or captions. |
| `Blue Connect` (Brand Accent) | `#3b82f6` | The brand's bright blue used for accents and interactive animated text. |

### Edges & Outlines
| Variable Name | Hex Code | Description |
| :--- | :--- | :--- |
| `Onyx Edge` | `#212121` | Dark borders or separators. |
| `Ash` | `#5a5a5a` | Lighter highlight borders. |

---

## ✍️ Typography

### Font Families
- **Display & Headings**: `'Inter', ui-sans-serif, system-ui, sans-serif` (`--font-aeonik`)
- **Code & Inputs**: `'JetBrains Mono', monospace` (`--font-input`)

### Typographic Hierarchy & Scale
| Level | Font Size | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- |
| **Display** | `63px` | `0.95` | `-0.69px` |
| **Heading Large** | `44px` | `1.05` | `-0.48px` |
| **Heading Medium** | `34px` | `1.11` | `-0.011px` |
| **Heading Small** | `23px` | `1.22` | `-0.011px` |
| **Subheading** | `18px` | `1.34` | `-0.011px` |
| **Body** | `16px` | `1.35` | `-0.011px` |
| **Caption** | `13px` | `1.5` | `-0.037px` |

- **Font Weights**: Regular (`400`), Bold (`700`)

---

## 📐 Spacing & Layout

- **Base Unit**: `4px`
- **Standard Spacers**: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `40px`
- **Section Gaps**: `120px`
- **Max Page Width**: `1200px`
- **Card Padding**: `40px`

---

## 🔲 Border Radii

- **Cards**: `20px` (`--radius-cards`)
- **Pills / Round Badges**: `99px` (`--radius-pills`)
- **Inputs**: `8px` (`--radius-inputs`)
- **Buttons**: `8px` (`--radius-buttons`)
- **Badges**: `8px` (`--radius-badges`)
