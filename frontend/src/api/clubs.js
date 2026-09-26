import apiClient from "./apiClient";

export async function fetchClubs(params = {}) {
  const response = await apiClient.get("/clubs/", {
    params,
  });

  return response.data;
}

export async function fetchClub(id) {
  const response = await apiClient.get(
    `/clubs/${id}/`
  );

  return response.data;
}

export async function createClub(data) {
  const response = await apiClient.post(
    "/clubs/",
    data
  );

  return response.data;
}

export async function updateClub(id, data) {
  const response = await apiClient.patch(
    `/clubs/${id}/`,
    data
  );

  return response.data;
}

export async function deleteClub(id) {
  const response = await apiClient.delete(
    `/clubs/${id}/`
  );

  return response.data;
}