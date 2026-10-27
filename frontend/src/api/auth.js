
import apiClient from "./apiClient";

export async function registerUser(name, email, password) {
  const response = await apiClient.post("/users/register/", {
    name,
    email,
    password,
  });

  return response.data;
}

export async function loginUser(email, password) {
  const response = await apiClient.post("/users/login/", {
    email,
    password,
  });

  return response.data;
}

// Central Admin user management

export async function fetchUsers(params = {}) {
  const response = await apiClient.get("/users/admin/", {
    params,
  });

  return response.data;
}


export async function createUser(data) {
  const response = await apiClient.post(
    "/users/admin/create-club-admin/",
    data
  );

  return response.data;
}


export async function updateUser(id, data) {
  const response = await apiClient.patch(
    `/users/admin/${id}/status/`,
    data
  );

  return response.data;
}


export async function assignClubAdmin(userId, clubId) {
  const response = await apiClient.patch(
    `/users/admin/${userId}/assign-club/`,
    {
      club_id: clubId,
    }
  );

  return response.data;
}

export async function deleteUser(id) {
  const response = await apiClient.delete(`/users/admin/${id}/`);
  return response.data;
}
