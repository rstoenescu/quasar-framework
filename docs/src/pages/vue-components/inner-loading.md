---
title: Inner Loading
desc: The QInnerLoading Vue component allows you to add a loading indicator within a component in the form of a local overlay.
related:
  - /vue-components/linear-progress
  - /vue-components/circular-progress
  - /vue-components/spinners
  - /vue-components/skeleton
  - /quasar-plugins/loading
  - /quasar-plugins/loading-bar
---

The QInnerLoading component allows you to add a progress animation within a component. Much like the [Loading Plugin](/quasar-plugins/loading), its purpose is to offer visual confirmation to the user that some process is happening in the background, which takes an excessive amount of time. QInnerLoading will add an opaque overlay over the delayed element along with a [Spinner](/vue-components/spinners).

## QInnerLoading API
<doc-api file="QInnerLoading" />

If using a custom [Spinner](/vue-components/spinners), add it to the list of components. Example: `QSpinnerGears`.

## Usage

::: warning
In order for the spinner to be properly placed in the center of the element you want the loading display to show over, that element must have CSS position set to `relative` (or the `relative-position` CSS class declared).
:::

::: warning
QInnerLoading must be the last element inside its parent so it can appear on top of the other content.
:::

<doc-example title="Basic" file="QInnerLoading/Basic" />

<doc-example title="Label" file="QInnerLoading/Label" />

## QInnerLoading API
<doc-api file="QInnerLoading" />
