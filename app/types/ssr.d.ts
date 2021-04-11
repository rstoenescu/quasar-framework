import { Request, Response } from "express";
import { HasSsr } from "quasar";
import { Express } from "express";
import { SsrContext } from "quasar-ssr";

interface QSsrContext {
  req: Request;
  res: Response;
  url: Request["url"];
}

interface ExtendAppOptions {
  app: Express
  ssr: SsrContext
}

export type ExtendAppCallback = (ctx: ExtendAppOptions) => void;

export type HasSsrParam = HasSsr<{ ssrContext?: QSsrContext | null }>;
