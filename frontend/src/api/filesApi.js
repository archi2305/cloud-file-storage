import apiClient from "./client";

const normalizeEmail = (value) => {
  if (!value) return "";
  const trimmed = value.trim();

  // Handle pasted values like "/files?email=user@example.com"
  if (trimmed.includes("email=")) {
    const extracted = trimmed.split("email=")[1];
    return decodeURIComponent(extracted.split("&")[0]).trim();
  }

  return trimmed;
};

const normalizeFilename = (value) => {
  if (!value) return "";
  const trimmed = value.trim();

  // Handle pasted values like "/download/myfile.pdf"
  if (trimmed.startsWith("/download/")) {
    return decodeURIComponent(trimmed.replace("/download/", ""));
  }

  return trimmed.replace(/^\/+/, "");
};

export const signup = async (payload) => {
  const response = await apiClient.post("/signup", {
    ...payload,
    email: normalizeEmail(payload.email),
  });
  return response.data;
};

export const login = async (payload) => {
  const response = await apiClient.post("/login", {
    ...payload,
    email: normalizeEmail(payload.email),
  });
  return response.data;
};

export const uploadFile = async (email, file) => {
  const formData = new FormData();
  formData.append("email", normalizeEmail(email));
  formData.append("file", file);

  const response = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const fetchFiles = async (email) => {
  const response = await apiClient.get("/files", {
    params: { email: normalizeEmail(email) },
  });
  return response.data;
};

export const getDownloadUrl = (filename) =>
  `${apiClient.defaults.baseURL}/download/${encodeURIComponent(
    normalizeFilename(filename)
  )}`;
