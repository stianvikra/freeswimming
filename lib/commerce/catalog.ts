export const CATALOG_PRODUCT_IDS = ["guide_0_1000m", "guide_poolside", "analysis_video"] as const;
export type CatalogProductId = (typeof CATALOG_PRODUCT_IDS)[number];

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
  active: boolean;
};

export type CatalogProductAvailability = {
  id: CatalogProductId;
  slug: string;
  title: string;
  kind: "course_addon" | "analysis";
  active: boolean;
  available: boolean;
  stripePriceId: string | null;
  missingEnvVar: string | null;
};

export type CatalogProductOverride = {
  slug?: string;
  title?: string;
  kind?: CatalogProduct["kind"];
  active?: boolean;
};

export type CatalogProductOverridesById = Partial<Record<CatalogProductId, CatalogProductOverride>>;

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

function normalizeText(value: string | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeKind(
  value: CatalogProduct["kind"] | undefined,
  fallback: CatalogDefinition["kind"]
): CatalogDefinition["kind"] {
  if (value === "course_addon" || value === "analysis") {
    return value;
  }
  return fallback;
}

function resolveDefinitionValue(
  definition: CatalogDefinition,
  overrides?: CatalogProductOverridesById
): Pick<CatalogProduct, "slug" | "title" | "kind" | "active"> {
  const override = overrides?.[definition.id];
  return {
    slug: normalizeText(override?.slug) ?? definition.slug,
    title: normalizeText(override?.title) ?? definition.title,
    kind: normalizeKind(override?.kind, definition.kind),
    active: override?.active ?? true,
  };
}

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toCatalogProduct(
  definition: CatalogDefinition,
  env: NodeJS.ProcessEnv,
  overrides?: CatalogProductOverridesById
): CatalogProduct {
  const values = resolveDefinitionValue(definition, overrides);
  return {
    id: definition.id,
    slug: values.slug,
    title: values.title,
    kind: values.kind,
    stripePriceId: requireEnv(env, definition.envVar),
    active: values.active,
  };
}

export function isCatalogProductId(value: string): value is CatalogProductId {
  return CATALOG_PRODUCT_IDS.includes(value as CatalogProductId);
}

export function getCatalogProducts(
  env: NodeJS.ProcessEnv = process.env,
  overrides?: CatalogProductOverridesById
): CatalogProduct[] {
  return CATALOG_DEFINITIONS.map((definition) => toCatalogProduct(definition, env, overrides));
}

export function getCatalogProductById(
  productId: string,
  env: NodeJS.ProcessEnv = process.env,
  overrides?: CatalogProductOverridesById
): CatalogProduct | null {
  const definition = CATALOG_DEFINITIONS.find((product) => product.id === productId);
  return definition ? toCatalogProduct(definition, env, overrides) : null;
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

export function getCatalogProductBySlug(
  slug: string,
  env: NodeJS.ProcessEnv = process.env,
  overrides?: CatalogProductOverridesById
): CatalogProduct | null {
  const normalizedSlug = normalizeText(slug) ?? slug;
  const definition = CATALOG_DEFINITIONS.find((product) => {
    const values = resolveDefinitionValue(product, overrides);
    return values.slug === normalizedSlug;
  });
  return definition ? toCatalogProduct(definition, env, overrides) : null;
}

export function getCatalogProductsSafe(
  env: NodeJS.ProcessEnv = process.env,
  overrides?: CatalogProductOverridesById
): CatalogProduct[] {
  try {
    return getCatalogProducts(env, overrides);
  } catch (error) {
    console.error("[Catalog] Could not load product catalog", error);
    return [];
  }
}

export function getCatalogProductsWithAvailability(
  env: NodeJS.ProcessEnv = process.env,
  overrides?: CatalogProductOverridesById
): CatalogProductAvailability[] {
  return CATALOG_DEFINITIONS.map((definition) => {
    const values = resolveDefinitionValue(definition, overrides);
    const stripePriceId = env[definition.envVar] ?? null;
    const available = Boolean(stripePriceId) && values.active;

    return {
      id: definition.id,
      slug: values.slug,
      title: values.title,
      kind: values.kind,
      active: values.active,
      available,
      stripePriceId,
      missingEnvVar: stripePriceId ? null : definition.envVar,
    };
  });
}
