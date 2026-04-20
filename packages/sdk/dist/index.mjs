// src/resources/links.ts
var LinksResource = class {
  fleeper;
  constructor(fleeper) {
    this.fleeper = fleeper;
  }
  /**
   * Create a new payment link, optionally with custom splits
   */
  async create(params) {
    if (!params.slug) {
      const baseSlug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      params.slug = `${baseSlug}-${randomSuffix}`;
    }
    return this.fleeper.request("/links", {
      method: "POST",
      body: JSON.stringify(params)
    });
  }
  /**
   * List all payment links created by the authenticated user
   */
  async list() {
    return this.fleeper.request("/links", {
      method: "GET"
    });
  }
};

// src/client.ts
var Fleeper = class {
  links;
  apiKey;
  baseUrl;
  constructor(apiKey, options) {
    if (!apiKey) {
      throw new Error("Fleeper API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? "https://fleeper.com/api/v1";
    this.links = new LinksResource(this);
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      ...options.headers
    };
    const response = await fetch(url, {
      ...options,
      headers
    });
    if (!response.ok) {
      let errorMsg = "Fleeper API Error";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
      }
      throw new Error(`[${response.status}] ${errorMsg}`);
    }
    return response.json();
  }
};

// src/index.ts
var index_default = Fleeper;
export {
  Fleeper,
  LinksResource,
  index_default as default
};
