import type { Camper } from '@/types/camper';
import api from './api';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function getOrganization(id: string): Promise<Organization> {
  const { data } = await api.get<Organization>(`/organizations/${id}`);
  return data;
}

export async function getMyOrganizations(): Promise<Organization[]> {
  const { data } = await api.get<Organization[]>('/organizations/me');
  return data;
}

export async function getCampers(orgId: string): Promise<Camper[]> {
  const { data } = await api.get<Camper[]>(`/organizations/${orgId}/campers`);
  return data;
}

export async function createCamper(
  orgId: string,
  camper: Omit<Camper, 'id' | 'status'>,
): Promise<Camper> {
  const { data } = await api.post<Camper>(`/organizations/${orgId}/campers`, camper);
  return data;
}
