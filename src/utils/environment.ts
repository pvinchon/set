export type Environment = "DEV" | "TEST" | "PROD";

function get(): Environment | undefined {
  const env = Deno.env.get("ENV")?.toUpperCase();
  return (env === "DEV" || env === "TEST" || env === "PROD") ? env : undefined;
}

export const environment: Environment = get() || "DEV";

export const isProduction: boolean = environment === "PROD";
