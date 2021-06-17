---
title: QDate
desc: The QDate Vue component provides a method to input dates from Gregorian or Persian calendars.
related:
  - /vue-components/time
  - /quasar-utils/date-utils
  - /vue-components/field
---

The QDate component provides a method to input date. Currently it supports Gregorian (default) and Persian calendars.

::: tip
For handling date and/or time, also check out [Quasar Date Utils](/quasar-utils/date-utils).
:::

## QDate API
<doc-api file="QDate" />

## Usage

::: warning
Notice that the actual date(s) of the model are all in String format.
:::

### Basic

<doc-example title="Basic" file="QDate/Basic" overflow />

::: tip
For landscape mode, you can use it along with `$q.screen` to make QDate responsive. Example: `:landscape="$q.screen.gt.xs"`. More info: [Quasar Screen Plugin](/options/screen-plugin).
:::

<doc-example title="Landscape" file="QDate/Landscape" overflow />

### Multiple selection <q-badge align="top" color="brand-primary" label="v1.13+" />

Notice below that the model is an Array and we specify the "multiple" prop.

Clicking on an already selected day will deselect it.

<doc-example title="Multiple days" file="QDate/SelectionMultiple" overflow />

### Range selection <q-badge align="top" color="brand-primary" label="v1.13+" />

Notice in the examples below that the model is an Object (single selection) or an Array of Objects (multiple selection).

::: tip TIPS
* Clicking on an already selected day will deselect it.
* The user's current editing range can also be set programmatic through the `setEditingRange` method (check the API card).
* There are three useful events in regards to the current editing range: `range-start`, `range-change` and `range-end` (check the API card).
:::

::: warning
The `range` property is only partially compatible with the `options` prop: selected ranges might also include "unselectable" days.
:::

<doc-example title="Single Range" file="QDate/SelectionRange" overflow />

<doc-example title="Multiple ranges" file="QDate/SelectionRangeMultiple" overflow />

### Custom title and subtitle

When not in 'minimal' mode, QDate has a computed header title and subtitle. You can override it, like in the example below.

When clicking on title then the QDate's view is changed to the calendar and when clicking on subtitle, the view will switch to year picking.

<doc-example title="Custom title and subtitle" file="QDate/CustomTitleSubtitle" overflow />

### Functionality

When model is unfilled (like `null`, `void 0`/`undefined`) QDate still has to show the calendar for a month of a year. You can use `default-year-month` prop for this, otherwise the current month of the year will be shown:

<doc-example title="Default year month" file="QDate/DefaultYearMonth" overflow />

The default view can be changed.

<doc-example title="Default view" file="QDate/DefaultView" overflow />

The first day of the week is applied depending on the [Quasar Language Pack](/options/quasar-language-packs) that you've set, but you can also force it, like in the example below.

<doc-example title="First day of week" file="QDate/FirstDayOfWeek" overflow />

Clicking on the "Today" button sets date to current user date. Requires the header, so you can't use it along with "minimal" mode:

<doc-example title="Today button" file="QDate/TodayBtn" overflow />

<doc-example title="Disable and readonly" file="QDate/DisableReadonly" overflow />

### Model mask

The default model mask is `YYYY/MM/DD`, however you can use custom ones too.

The `mask` prop tokens can be found at [Quasar Utils > Date utils](/quasar-utils/date-utils#format-for-display).

::: warning Note on SSR
Using `x` or `X` (timestamps) in the mask may cause hydration errors on the client, because decoding the model String must be done with `new Date()` which takes into account the local timezone. As a result, if the server is in a different timezone than the client, then the rendered output of the server will differ than the one on the client so hydration will fail.
:::

::: danger Note on persian calendar
When using the persian calendar, the mask for QDate is forced to `YYYY/MM/DD`.
:::

<doc-example title="Simple mask" file="QDate/MaskSimple" overflow />

If you want to insert strings into your mask, make sure you escape them by surrounding them with `[` and `]`, otherwise the characters might be interpreted as format tokens.

<doc-example title="Mask with escaped characters" file="QDate/MaskEscape" overflow />

Using the mask to connect a QDate and [QTime](/vue-components/time) to the same model:

<doc-example title="QDate and QTime on same model" file="QDate/MaskDateTime" overflow />

::: tip
If you want to programmatically set the value of QDate, you can do so by just re-assigning the value that you pass. However, the updated value needs to be a string in the same format as your mask. Eg. in the case your mask is `'dddd, MMM D, YYYY'`, passing `'2019/04/28'` as value won't work, you would need to pass `'Sunday, Apr 28, 2019'` instead.
:::

### Custom ad-hoc locale

If, for some reason, you need to use a custom ad-hoc locale rather than the current Quasar Language Pack that has been set, you can use the `locale` prop:

<doc-example title="Custom ad-hoc locale" file="QDate/CustomLocale" overflow />

### Coloring

<doc-example title="Coloring" file="QDate/Color" overflow />

<doc-example title="Dark" file="QDate/Dark" overflow dark />

### Highlighting events

The first example is using an array and the second example is using a function.

<doc-example title="Events" file="QDate/Events" overflow />

<doc-example title="Event color" file="QDate/EventColor" overflow />

### Day scoped slot

You can use the `day` scoped slot to render custom event markers or tooltips specific to each day.

<doc-example title="Day slot" file="QDate/DaySlot" overflow />

### Limiting options

* You can use the `options` prop to limit user selection to certain times.
* Alternatively, for a more in-depth way of limiting options, you can also supply a function (second and third example below) to `options-fn` prop.

::: warning
The `options` property is only partially compatible with the `range` prop. Ranges might contain "unselectable" days.
:::

<doc-example title="Options" file="QDate/Options" overflow />

### Applying navigation boundaries <q-badge align="top" color="brand-primary" label="v1.13+" />

In the example below the navigation is restricted between 2020/07 and 2020/09.

<doc-example title="Navigation boundaries" file="QDate/NavigationBoundaries" overflow />

### With additional buttons <q-badge align="top" color="brand-primary" label="v1.2.8+" />

You can use the default slot for adding buttons:

<doc-example title="With additional buttons" file="QDate/AdditionalButtons" overflow />

* Use 2 components to allow easy interval selection

<doc-example title="Interval selection" file="QDate/IntervalSelection" overflow />

* Adjust the selection to match a fixed interval

<doc-example title="Week selection" file="QDate/WeekSelection" overflow />

* Limit the minimum and maximum selection length

<doc-example title="Constrained interval selection" file="QDate/IntervalSelectionConstrained" overflow />

### With QSplitter and QTabPanels

<doc-example title="With QSplitter and QTabPanels" file="QDate/Splitter" />

More info: [QSplitter](/vue-components/splitter), [QTabPanels](/vue-components/tab-panels).

### With QInput

<doc-example title="With QInput" file="QDate/Input" />

Connecting a QDate and QTime with same model on a QInput:

<doc-example title="QDate and QTime with QInput" file="QDate/InputFull" overflow />

The following are **helpers** for QInput `mask` and `rules` props. You can use these for convenience or write the string specifying your [custom needs](/vue-components/input#mask).

* Property `mask` helpers: [full list](https://github.com/quasarframework/quasar/blob/dev/ui/src/mixins/mask.js#L2).
* Property `rules` helpers: [full list](https://github.com/quasarframework/quasar/blob/dev/ui/src/utils/patterns.js).

Examples: "date", "time", "fulltime".

More info: [QInput](/vue-components/input).

### Persian calendar
::: tip
You can couple this with a Quasar [language pack](/options/quasar-language-packs) such as Persian (Farsi, `fa-ir`) to have the QDate strings translated too, for the full experience.
:::

::: warning
When using the persian calendar, the mask for QDate is forced to `YYYY/MM/DD`.
:::

<q-btn type="a" href="https://codepen.io/rstoenescu/pen/MWKpbNa" target="_blank" label="See example" icon-right="launch" color="brand-primary" />

### Native form submit <q-badge align="top" color="brand-primary" label="v1.9+" />

When dealing with a native form which has an `action` and a `method` (eg. when using Quasar with ASP.NET controllers), you need to specify the `name` property on QDate, otherwise formData will not contain it (if it should):

<doc-example title="Native form" file="QDate/NativeForm" />
