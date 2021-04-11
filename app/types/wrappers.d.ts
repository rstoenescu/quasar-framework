// These wrappers are into `app`, instead of `ui`, because they are only relevant to people
//  using a Quasar CLI project: TS devs using `quasar` package via Vue CLI plugin doesn't have
//  boot files or `quasar.conf.js` where to use them.
// They are placed in a standalone file into `ui` because they must be reachable as `quasar/wrappers`.
// Not being exposed from `quasar`, they won't trigger the package side-effects when required into
//  a file evaluated by Node (in `quasar.conf.js`, `configure` would be imported as
//  `const { configure } = require('quasar')`).
// This is a precautional measure to avoid future hard-to-backtrack bugs.

declare module "quasar/wrappers" {
  import { BootCallback } from "@quasar/app";
  import { ConfigureCallback } from "@quasar/app";
  import { PrefetchCallback } from "@quasar/app";
  import { RouteCallback } from "@quasar/app";
  import { StoreCallback } from "@quasar/app";
  import { ExtendAppCallback } from "@quasar/app";

  function boot<TStore = any>(
    callback: BootCallback<TStore>
  ): BootCallback<TStore>;

  function configure(callback: ConfigureCallback): ConfigureCallback;

  function preFetch<TStore = any>(
    callback: PrefetchCallback<TStore>
  ): PrefetchCallback<TStore>;

  function route<TStore = any>(
    callback: RouteCallback<TStore>
  ): RouteCallback<TStore>;

  function store(callback: StoreCallback): StoreCallback;

  function extendApp(callback: ExtendAppCallback): ExtendAppCallback;
}
