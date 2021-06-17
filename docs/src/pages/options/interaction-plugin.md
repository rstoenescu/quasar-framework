---
title: Interaction Plugin
desc: Quasar plugin that helps in detecting human interactions through Javascript code.
---
The Quasar Interaction plugin detects interactions with the browser and provides useful details about the last event.

## Installation
You don't need to do anything. The Interaction plugin gets installed automatically.

## Usage
Notice `$q.interaction` below. This is just a simple usage example.

```html
<div v-if="$q.interaction.isKeyboard === true">
  You pressed {{$q.interaction.event.code}}
  <span v-show="$q.interaction.isPending === true">
    and it is still pressed
  </span>
</div>
```

```js
// script part of a Vue component
export default {
  method: {
    onMousedown (evt) {
      this.$q.interaction.preventClick(evt.target, true)
    }
  }
}
```

We can also use the Interaction plugin outside of a Vue component:
```js
import { Interaction } from 'quasar'

// Interaction.isPointer
// Interaction.event !== null && Interaction.event.target
```

## API
<doc-api file="Interaction" />
