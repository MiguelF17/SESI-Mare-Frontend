import { apiRequest } from "../api";

export async function alternarCurtidaAPI(
  postId: number,
  curtido: boolean
): Promise<void> {
  await apiRequest<void>(`/posts/${postId}/curtir`, {
    method: curtido ? "DELETE" : "POST",
  });
}