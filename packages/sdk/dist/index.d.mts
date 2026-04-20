interface Pool {
    label: string;
    percent: number;
}
interface CreateLinkParams {
    title: string;
    description?: string;
    amount?: number;
    isFlexible?: boolean;
    slug?: string;
    pools?: Pool[];
}
interface LinkResponse {
    id: string;
    url: string;
    status: string;
    pools: number | "default";
}
interface ListLinksResponse {
    links: Array<{
        id: string;
        title: string;
        amount: number | null;
        slug: string;
        isActive: boolean;
        createdAt: string;
    }>;
}

declare class LinksResource {
    private fleeper;
    constructor(fleeper: Fleeper);
    /**
     * Create a new payment link, optionally with custom splits
     */
    create(params: CreateLinkParams): Promise<LinkResponse>;
    /**
     * List all payment links created by the authenticated user
     */
    list(): Promise<ListLinksResponse>;
}

interface FleeperOptions {
    baseUrl?: string;
}
declare class Fleeper {
    links: LinksResource;
    private apiKey;
    private baseUrl;
    constructor(apiKey: string, options?: FleeperOptions);
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
}

export { type CreateLinkParams, Fleeper, type FleeperOptions, type LinkResponse, LinksResource, type ListLinksResponse, type Pool, Fleeper as default };
