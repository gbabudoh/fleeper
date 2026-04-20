export interface Pool {
  label: string;
  percent: number;
}

export interface CreateLinkParams {
  title: string;
  description?: string;
  amount?: number; // In cents
  isFlexible?: boolean;
  slug?: string; // If omitted, the SDK will automatically generate one
  pools?: Pool[];
}

export interface LinkResponse {
  id: string;
  url: string;
  status: string;
  pools: number | "default";
}

export interface ListLinksResponse {
  links: Array<{
    id: string;
    title: string;
    amount: number | null;
    slug: string;
    isActive: boolean;
    createdAt: string;
  }>;
}
