export interface Client {
  client_id: string;
  name: string;
}

export interface ClientListResponse {
  success: boolean;
  clients: Client[];
  error?: string;
} 