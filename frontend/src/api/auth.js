import apiClient from "./apiClient";


export async function registerUser(
  name,
  email,
  password
) {
  const response = await apiClient.post(
    "/users/register/",
    {
      name,
      email,
      password,
    }
  );

  return response.data;
}


export async function loginUser(
  email,
  password
) {
  const response = await apiClient.post(
    "/users/login/",
    {
      email,
      password,
    }
  );

  return response.data;
}


/*
  These functions are used by the
  Central Admin Users page.

  They will connect to the admin
  user-management endpoints that
  we'll add to the backend.
*/

export async function fetchUsers(
  params = {}
) {
  const response = await apiClient.get(
    "/users/",
    {
      params,
    }
  );

  return response.data;
}


export async function createUser(data) {
  const response = await apiClient.post(
    "/users/",
    data
  );

  return response.data;
}


export async function updateUser(
  id,
  data
) {
  const response = await apiClient.patch(
    `/users/${id}/`,
    data
  );

  return response.data;
}


export async function deleteUser(id) {
  const response = await apiClient.delete(
    `/users/${id}/`
  );

  return response.data;
}