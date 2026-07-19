# Zalopay CRM Loyalty Coin Demo Design

## Source of Truth

- Figma file: `[Zalopay] CRM Design`
- `[Feature] Distribute Coin`: Loyalty Coin list, Create Campaign và Trigger Based Campaign.
- `[Feature] Direct Discount`: canonical Campaign List, filter/table/pagination và Budget Alert.
- `[Feature] Promotion Code`: canonical 1920 app shell và long-form campaign form.

## App Shell

- Reference viewport: 1920 x 912.
- Top header: 48px, white, full width.
- Sidebar: 232px, starts below header.
- Main: left 232px, width 1688px, background `#f5f5f5`.
- Content gutter: 24px. Canonical content width at 1920px is 1640px.
- Zalopay wordmark left aligned in header. User name and 32px avatar right aligned.

## Typography

- Primary family: Poppins.
- Body/input/label: 12-13.3px, Regular/Medium.
- Section heading: 14-16px, Medium/SemiBold.
- Table header: 12px Medium, small uppercase only where Figma uses it.
- Button: 12-13px Medium.

## Color

- Primary action/active navigation: `#0033c9`.
- Link/action blue: `#1447e6`.
- Main text: `#364153`; strong text: `#101828`.
- Muted text: `#717182`; placeholder: `#99a1af`.
- Canvas: `#f5f5f5`; panel: `#ffffff`; section header: `#f9fafb`.
- Border: `#e5e7eb` / `#d1d5dc`.
- Required/error: `#fb2c36`.
- Success: `#016630` on `#dcfce7`.
- Warning: dark orange text on light orange surface.

## Components

### Input and Select

- Height 32px.
- Border 1px neutral gray.
- Radius 2-3px.
- Label sits above field with 6-8px gap.
- Disabled uses gray fill and gray text.

### Button

- Height 32px.
- Primary blue fill, white text.
- Secondary white fill with gray border.
- Radius 3px.

### Filter Panel

- White surface, 24px padding.
- Four equal columns at reference width.
- 24px horizontal gap and 24px vertical separation.
- Action group right aligned on second row.

### Form Section

- White panel with 1px border.
- Section header 56px with `#f9fafb` background.
- Body padding 24px.
- No elevated card shadow.

### Table

- White surface, 12px data text.
- Header uses light gray background.
- Row separator 1px.
- Actions are blue text links, not invented icon buttons.

## Motion

- 150-200ms state transitions only.
- Motion communicates collapse, navigation or validation.
- No decorative entrance animation.
