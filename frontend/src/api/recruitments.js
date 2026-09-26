import apiClient from "./apiClient";

export async function fetchRecruitments(params = {}) {
  const response = await apiClient.get(
    "/recruitments/",
    {
      params,
    }
  );

  return response.data;
}

export async function fetchRecruitment(id) {
  const response = await apiClient.get(
    `/recruitments/${id}/`
  );

  return response.data;
}

export async function createRecruitment(data) {
  const response = await apiClient.post(
    "/recruitments/",
    data
  );

  return response.data;
}

export async function updateRecruitment(id, data) {
  const response = await apiClient.patch(
    `/recruitments/${id}/`,
    data
  );

  return response.data;
}

export async function deleteRecruitment(id) {
  const response = await apiClient.delete(
    `/recruitments/${id}/`
  );

  return response.data;
}