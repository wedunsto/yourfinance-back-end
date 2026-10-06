export interface CategoryDto {
  id: string;
  user_id: string;
  name: string;
  severity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequestDto {
  user_id: string;
  name: string;
  severity: number;
}

export interface UpdateCategoryRequestDto {
  name?: string;
  severity?: number;
}

export interface DeleteCategoryResponseDto {
  category_id: string;
}

export interface CategoryItemDto {
  name: string;
  severity: number;
}

export interface CreateCategoriesRequestDto {
  user_id: string;
  categories: CategoryItemDto[];
}
