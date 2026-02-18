export type Environment = "DEV" | "TEST" | "PROD";

function detect(): Environment {
  const env = Deno.env.get("ENV")?.toUpperCase();
  if (env === "DEV" || env === "TEST" || env === "PROD") return env;

  return "DEV";
}

export const environment: Environment = detect();

export const isProduction: boolean = environment === "PROD";
