import { Router } from "express";
import { MetaDetail } from "stremio-addon-sdk";
import type { Request, TypedJsonResponse } from "@/util/typedJsonResponse";
import { z } from "zod";
import { Config } from "@stremio-addon/config";

const OMDBAPIError = z.object({
  Response: z.literal("False"),
  Error: z.string()
});

const OMDBResponse = z.object({
  Title: z.string(),
  Year: z.string(),
  Rated: z.string(),
  Released: z.string(),
  Runtime: z.string(),
  Genre: z.string(),
  Director: z.string(),
  Writer: z.string(),
  Actors: z.string(),
  Plot: z.string(),
  Language: z.string(),
  Country: z.string(),
  Awards: z.string(),
  Poster: z.string(),
  Ratings: z.array(z.object({
    Source: z.string(),
    Value: z.string()
  })),
  Metascore: z.string(),
  imdbRating: z.string(),
  imdbVotes: z.string(),
  imdbID: z.string(),
  Type: z.string(),
  Response: z.string(),
});

const getData = async (imdbId: string, apiKey: string) => {
  try {
    const res = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}`);
    if(!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();
    const result = OMDBResponse.safeParse(data);

    if (!result.success) {
      const errorResult = OMDBAPIError.safeParse(data);
      if (errorResult.success) {
        throw new Error(errorResult.data.Error);
      }
      throw new Error("Invalid API response format");
    }

    return result.data;
  } catch (error) {

  }
}

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter: Router = Router({ mergeParams: true }).get(
  "/:type/:id.json",
  async (req: Request, res: TypedJsonResponse<{ meta: MetaDetail | {} }>) => {
    const {type } = req.params;

    try {
      const config = res.locals.config as Config | undefined;

      if(!config) {
        res.status(500).json({meta: {}})
        return;
      }

      const data = await getData(req.params.id, config.omdbApiKey);

      if(!data) {
        res.status(500).json({meta: {}});
        return;
      }

      const meta: MetaDetail = {
        id: data.imdbID,
        name: data.Title,
        // @ts-expect-error
        type: type,
        year: data.Year,
        poster: data.Poster,
        imdbRating: data.imdbRating,
        imdbVotes: data.imdbVotes,
        plot: data.Plot,
        genre: data.Genre,
        director: [data.Director],
        writer: [data.Writer],
        actors: [data.Actors],
        ratings: data.Ratings,
        awards: data.Awards,
        language: data.Language,
        country: data.Country,
        rated: data.Rated,
        released: data.Released,
        runtime: data.Runtime,
        metascore: data.Metascore
      }

       res.json({ meta });
       return
    } catch (error) {
      console.error(error);
    }


    res.status(500).json({ meta: {} });
  }
);
