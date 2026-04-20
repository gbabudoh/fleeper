"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Fleeper: () => Fleeper,
  LinksResource: () => LinksResource,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Fleeper,
  LinksResource
});
