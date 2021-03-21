---
title: Handling Keyboard Navigation in Groups of Controls
desc: How to improve keyboard accessibility when using groups of controls in a Quasar app.
---
Quasar offers a simple way to improve keyboard accessibility when using a large number of controls that can be grouped.

## Installation
<doc-installation directives="KeyGroupNavigation" />

## Usage
Attach the directive on a group wrapping component or DOM element (like QList, QBar, QToolbar).
Keyboard navigation using `TAB` or `SHIFT` + `TAB` keys will only select one tabbable element inside the group:
- the first / last tabbable element depending on navigation direction when first entering the group
- the last selected tabbable element when the group was visited before
- pressing the `TAB` or `SHIFT` + `TAB` keys when an element is focused inside the group will focus the next tabbable element after the group or the previous une before the group
Keyboard navigation inside the group can be performed using:
- `HOME`, `ARROW_LEFT`, `ARROW_RIGHT` and `END` keys when `horizontal` modifier is used
- `PG_UP`, `ARROW_UP`, `ARROW_DOWN` and `PG_DOWN` keys when `vertical` modifier is used
- any of the above keys when neither `horizontal` nor `vertical` modifiers are used (default)
The navigation wraps at the start / end, moving to the last / first tabbable element.

::: tip
To skip processing key events for some elements set a `q-key-group-navigation--ignore-key` class on them or on a parent of them.
:::

::: warning
Try not to mix keyboard controlled components (like QKnob, QRange, QSlider, QRating, QDate, QTime) in key navigation groups as it might get confusing to the user.
:::

<doc-example title="List navigation" file="KeyGroupNavigation/List" />

<doc-example title="Bar navigation" file="KeyGroupNavigation/Bar" />

<doc-example title="Toolbar navigation" file="KeyGroupNavigation/Toolbar" />

<doc-example title="Form controls navigation" file="KeyGroupNavigation/FormControls" />

## KeyGroupNavigation API
<doc-api file="KeyGroupNavigation" />
