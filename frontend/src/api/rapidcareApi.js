import axios from "axios";
import { apiBaseUrl } from "../lib/runtimeConfig";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

export async function searchHospitals(payload) {
  const response = await apiClient.post("/search-hospitals", payload);
  return response.data;
}

export async function reserveBed(payload) {
  const response = await apiClient.post("/reserve-bed", payload);
  return response.data;
}

export async function assignAmbulance(payload) {
  const response = await apiClient.post("/assign-ambulance", payload);
  return response.data;
}

export async function confirmReservation(payload) {
  const response = await apiClient.post("/confirm-reservation", payload);
  return response.data;
}
