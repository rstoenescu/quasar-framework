---
title: File Picker
desc: The QFile Vue component is used as a file picker.
badge: v1.8+
related:
  - /vue-components/uploader
  - /vue-components/input
---

QFile is a component which handles the user interaction for picking file(s).

:::tip
If you also want a component to also handle the upload for you, please consider using [QUploader](/vue-components/uploader) instead.
:::

## QFile API
<doc-api file="QFile" />

## Design

::: warning
For your QFile you can use only one of the main designs (`filled`, `outlined`, `standout`, `borderless`). You cannot use multiple as they are self-exclusive.
:::

<doc-example title="Design Overview" file="QFile/DesignOverview" />

### Decorators

<doc-example title="Decorators" file="QFile/Decorators" />

### Coloring

<doc-example title="Coloring" file="QFile/Coloring" />

### Clearable
As a helper, you can use `clearable` prop so user can reset model to `null` through an appended icon. The second QFile in the example below is the equivalent of using `clearable`.

<doc-example title="Clearable" file="QFile/Clearable" />

### Disable and readonly

<doc-example title="Disable and readonly" file="QFile/DisableReadonly" />

## Usage

::: warning
Under the covers, QFile uses a native input. Due to browser security policy, it is not allowed to programmatically fill such an input with a value. As a result, even if you set v-model from the beginning to a value, the component will show those file(s) but the input tag itself won't be filled in with that value. A user interaction (click/tap/<kbd>ENTER</kbd> key/<kbd>SPACE</kbd> key) is absolutely required in order for the native input to contain them. It's best to always have the initial value of model set to `null` or `undefined/void 0`.
:::

### Basic

<doc-example title="Single file" file="QFile/BasicSingle" />

<doc-example title="Multiple files" file="QFile/BasicMultiple" />

### Appending files <q-badge align="top" color="brand-primary" label="v1.11.3+" />

By default, QFile replaces the model each time the user selects any files through the popup. However, when you are accepting multiple files (`multiple` prop) you can change this behavior and append the new selection to the model rather than replacing its old value.

Below you can pick files multiple times and QFile will keep on appending them to the model:

<doc-example title="Appending files" file="QFile/AppendingFiles" />

### Counters

<doc-example title="Basic counter" file="QFile/CounterBasic" />

<doc-example title="Counter label" file="QFile/CounterLabel" />

### Using chips

<doc-example title="With chips" file="QFile/WithChips" />

### Using file slot

The example below highlights how you can customize the display of each file and even incorporate a possible upload progress indicator:

<doc-example title="With progress indicator" file="QFile/WithProgress" />

### Restricting files

<doc-example title="Basic restrictions" file="QFile/RestrictionBasic" />

You can even combine the restrictions above.

::: tip
In the example above, we're using `accept` property. Its value must be a comma separated list of unique file type specifiers. Maps to 'accept' attribute of native input type=file element. [More info](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers).
:::

::: warning
Recommended format for the `accept` property is `<mediatype>/<extension>`. Examples: "image/png", "image/png". QFile uses an `<input type="file">` under the covers and it relies entirely on the host browser to trigger the file picker. If the `accept` property (that gets applied to the input) is not correct, no file picker will appear on screen or it will appear but it will accept all file types.
:::

You can also apply custom filters (which are executed after user picks files):

<doc-example title="Filter" file="QFile/RestrictionFilter" />


### Native form submit <q-badge align="top" color="brand-primary" label="v1.9+" />

When dealing with a native form which has an `action` and a `method` (eg. when using Quasar with ASP.NET controllers), you need to specify the `name` property on QFile, otherwise formData will not contain it (if it should):

<doc-example title="Native form" file="QFile/NativeForm" />
