import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfigSchema, type Config, config } from "@stremio-addon/config";
import { useState } from "react";
import { cn } from "@/lib/utils";

function generateInstallLinks(userConfig: Config):
  | {
      /** encoded config */
      config: string;
      /** manifest url, used for desktop. */
      url: string;
      /** install link for web */
      web: string;
    }
  | undefined {
  try {
    const encodedConfig = config.encode(userConfig);
    // attempt to decode, if we can't then no bueno
    if (!config.decode(encodedConfig)) {
      throw new Error("Invalid config");
    }

    const path = `/${encodedConfig}/manifest.json`;

    // if running locally in dev, use http, otherwise use stremio protocol
    const protocol = window.location.origin.startsWith("http://localhost:4321")
      ? "http"
      : "stremio";
    const url = `${protocol}://${window.location.host}${path}`;
    const web = `https://web.stremio.com/#/addons?addon=${encodeURIComponent(url)}`;

    return {
      config: encodedConfig,
      url,
      web,
    };
  } catch (error) {
    console.error(error);
  }

  return undefined;
}

export default function ConfigureForm() {
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm<Config>({
    resolver: zodResolver(ConfigSchema),
    defaultValues: {
      omdbApiKey: "",
    },
    mode: "onChange",
  });

  const [configString, setConfigString] =
    useState<ReturnType<typeof generateInstallLinks>>();

  // handle form submission
  const onSubmit = handleSubmit((data) => {
    const generated = generateInstallLinks(data);
    setConfigString(generated);
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-2">
          <label htmlFor="omdbApiKey">
            OMDB API Key
            <span className="text-red-500">{errors.omdbApiKey?.message}</span>
          </label>

          <input
            type="password"
            {...register("omdbApiKey")}
            className="border-2 border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <button
            type="submit"
            className={cn([
              "bg-slate-500",
              "hover:bg-slate-700",
              "text-white",
              "py-2",
              "px-4",
              "rounded",
              "focus:outline-none",
              "focus:shadow-outline",
              "cursor-pointer",
            ])}
          >
            Submit
          </button>
        </div>
      </div>
      <div
        className={`${configString && !formState.isDirty ? "" : "hidden"} flex flex-row gap-6`}
      >
        <a
          href={configString?.url ?? ""}
          className="bg-slate-500 text-white p-2 rounded"
        >
          Install
        </a>
        <a href={configString?.web ?? ""} className="p-2">
          Install (web)
        </a>
        <a
          href="#"
          className="p-2"
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(configString?.url ?? "");
          }}
        >
          Copy
        </a>
      </div>
    </form>
  );
}
