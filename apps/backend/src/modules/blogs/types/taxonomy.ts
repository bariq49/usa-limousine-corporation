export type CategoryCreate = {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CategoryUpdate = {
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type TagCreate = {
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type TagUpdate = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
};
