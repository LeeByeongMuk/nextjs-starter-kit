interface PaginationLinks {
  first: string;
  last: string;
  next: string | null;
  prev: string | null;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface PaginationData {
  links: PaginationLinks;
  meta: PaginationMeta;
}

export type { PaginationData, PaginationLinks, PaginationMeta };
