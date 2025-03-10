import { Router } from "express";
import { MetaDetail } from "stremio-addon-sdk";
import type { Request, TypedJsonResponse } from "@/util/typedJsonResponse";
import { parseExtras } from "@/util/parseExtras";

export const catalogRouter: Router = Router();

catalogRouter.get(
  "/:type/:id/:extras?.json",
  async (req: Request, res: TypedJsonResponse<{ metas: MetaDetail[] }>) => {
    const { type, id, extras } = req.params;

    const parsedExtras = parseExtras(extras);
    console.info(
      `[${type}] ${id} with extras: ${JSON.stringify(parsedExtras)}`
    );

    const catalogExample: MetaDetail[] = [
      {
        id: "addonIdPrefix:123456",
        name: "Stremio Addon Example",
        type: "movie",
        description: "This is an example meta response.",
      },
      {
        id: "addonIdPrefix:78901",
        name: "Stremio Addon Example 2",
        type: "movie",
        description: "This is another example meta response.",
      },
    ];

    res.json({ metas: catalogExample });
  }
);
