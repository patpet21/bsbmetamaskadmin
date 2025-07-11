// NocoDB API client (placeholder - would integrate with actual NocoDB API)
export class NocoDBClient {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_NOCODB_BASE_URL || 'http://localhost:8080';
    this.token = import.meta.env.VITE_NOCODB_TOKEN || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'xc-token': this.token,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`NocoDB API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMenuItems() {
    return this.request('/api/v1/db/data/noco/menu');
  }

  async getCategories() {
    return this.request('/api/v1/db/data/noco/categories');
  }

  async getExtras() {
    return this.request('/api/v1/db/data/noco/extras');
  }

  async createOrder(orderData: any) {
    return this.request('/api/v1/db/data/noco/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(orderId: number, updates: any) {
    return this.request(`/api/v1/db/data/noco/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}

export const nocodbClient = new NocoDBClient();
