import apiClient from "./apiClient";


export async function fetchApplications(params = {}) {
  const response = await apiClient.get(
    "/applications/",
    {
      params,
    }
  );

  return response.data;
}


export async function fetchApplication(id) {
  const response = await apiClient.get(
    `/applications/${id}/`
  );

  return response.data;
}


export async function createApplication(data) {
  const response = await apiClient.post(
    "/applications/",
    data
  );

  return response.data;
}


export async function updateApplication(id, data) {
  const response = await apiClient.patch(
    `/applications/${id}/`,
    data
  );

  return response.data;
}