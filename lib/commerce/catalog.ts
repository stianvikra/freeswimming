export type CatalogProductId = "guide_0_1000m" | "guide_poolside" | "analysis_video";

type CatalogDefinition = {
  id: CatalogProductId;
  slug: string;
  title: string;
  kind: "course_addon" | "analysis";
  envVar: string;
};

export type CatalogProduct = {
  id: CatalogProductId;
  slug: string;
  title: string;
  kind: "course_addon" | "analysis";
  stripePriceId: string;
};

const CATALOG_DEFINITIONS: CatalogDefinition[] = [
  {
    id: "guide_0_1000m",
    slug: "0-1000m-guide",
    title: "0-1000m guide",
    kind: "course_addon",
    envVar: "STRIPE_PRICE_ID_0_1000M_GUIDE",
  },
  {
    id: "guide_poolside",
    slug: "poolside-guide",
    title: "Poolside guide",
    kind: "course_addon",
    envVar: "STRIPE_PRICE_ID_POOLSIDE_GUIDE",
  },
  {
    id: "analysis_video",
    slug: "video-analysis",
    title: "Video analysis",
    kind: "analysis",
    envVar: "STRIPE_PRICE_ID_ANALYSIS",
  },
];

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toCatalogProduct(definition: CatalogDefinition, env: NodeJS.ProcessEnv): CatalogProduct {
  return {
    id: definition.id,
    slug: definition.slug,
    title: definition.title,
    kind: definition.kind,
    stripePriceId: requireEnv(env, definition.envVar),
  };
}

export function getCatalogProducts(env: NodeJS.ProcessEnv = process.env): CatalogProduct[] {
  return CATALOG_DEFINITIONS.map((definition) => toCatalogProduct(definition, env));
}

export function getCatalogProductById(
  productId: string,
  env: NodeJS.ProcessEnv = process.env
): CatalogProduct | null {
  const definition = CATALOG_DEFINITIONS.find((product) => product.id === productId);
  return definition ? toCatalogProduct(definition, env) : null;
}

export function getCatalogProductByStripePriceId(
  stripePriceId: string,
  env: NodeJS.ProcessEnv = process.env
): CatalogProduct | null {
  for (const definition of CATALOG_DEFINITIONS) {
    if (requireEnv(env, definition.envVar) === stripePriceId) {
      return toCatalogProduct(definition, env);
    }
  }

  return null;
}
