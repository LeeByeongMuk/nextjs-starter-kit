interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface PaginationData {
  meta: PaginationMeta;
}

export type { PaginationData, PaginationMeta };
