declare module "quasar-ssr" {
  import { BundleRendererOptions } from "vue-server-renderer";

  type AnyObject = Record<string, unknown>;
  interface SsrComponentCache {
    max: number
    maxAge: boolean
  }

  interface SsrSettings {
    pwa: boolean
    manualHydration: boolean
    componentCache: SsrComponentCache
    debug: boolean
    publicPath: string
  }

  interface RendererOptions extends AnyObject {
    url: string
  }

  interface RenderError extends Error {
    url: string
    code: number
  }

  type RenderCallback = (err: RenderError | null, html: string) => void;
  export interface SsrContext {
    settings: SsrSettings
    resolveUrl: (value: string) => string
    renderToString: (opts: Partial<RendererOptions>, cb: RenderCallback) => void
    resolveWWW: (file: string) => string
    mergeRendererOptions: (opts: Partial<BundleRendererOptions>) => void
  }

  const ctx: SsrContext;
  export default ctx;
}
