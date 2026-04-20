import { Fleeper } from "../client";
import { CreateLinkParams, LinkResponse, ListLinksResponse } from "../types";

export class LinksResource {
  private fleeper: Fleeper;

  constructor(fleeper: Fleeper) {
    this.fleeper = fleeper;
  }

  /**
   * Create a new payment link, optionally with custom splits
   */
  public async create(params: CreateLinkParams): Promise<LinkResponse> {
    // The V1 API requires a slug, so if the user omits it in the SDK, we'll auto-generate a clean one
    if (!params.slug) {
      const baseSlug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      params.slug = `${baseSlug}-${randomSuffix}`;
    }

    return this.fleeper.request<LinkResponse>("/links", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * List all payment links created by the authenticated user
   */
  public async list(): Promise<ListLinksResponse> {
    return this.fleeper.request<ListLinksResponse>("/links", {
      method: "GET",
    });
  }
}
