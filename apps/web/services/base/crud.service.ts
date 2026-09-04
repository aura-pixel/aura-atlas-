import { del, get, post, put } from "@/lib/api";

export function createCrudService<
  TEntity,
  TCreate,
  TUpdate,
>(endpoint: string) {
  return {
    getAll() {
      return get<TEntity[]>(endpoint);
    },

    getById(id: string) {
      return get<TEntity>(`${endpoint}/${id}`);
    },

    create(data: TCreate) {
      return post<TEntity>(endpoint, data);
    },

    update(
      id: string,
      data: TUpdate,
    ) {
      return put<TEntity>(
        `${endpoint}/${id}`,
        data,
      );
    },

    delete(id: string) {
      return del<void>(
        `${endpoint}/${id}`,
      );
    },
  };
}