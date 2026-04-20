import { LinksResource } from "./resources/links";

export interface FleeperOptions {
  baseUrl?: string;
}

export class Fleeper {
  public links: LinksResource;

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, options?: FleeperOptions) {
    if (!apiKey) {
      throw new Error("Fleeper API key is required");
    }
    
    this.apiKey = apiKey;
    // Default to the production URL, but allow overrides for local testing
    this.baseUrl = options?.baseUrl ?? "https://fleeper.com/api/v1";
    
    this.links = new LinksResource(this);
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = "Fleeper API Error";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(`[${response.status}] ${errorMsg}`);
    }

    return response.json() as Promise<T>;
  }
}
