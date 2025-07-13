// NocoDB API client with v2 endpoints
export class NocoDBClient {
  private baseURL: string;
  private token: string;
  private projectId: string;
  private tableIds: {
    menu: string;
    extras: string;
    orders: string;
    categories: string;
  };

  constructor() {
    this.baseURL = import.meta.env.VITE_NOCODB_BASE_URL || 'https://app.nocodb.com';
    this.token = import.meta.env.VITE_NOCODB_TOKEN || 'h3BEWAoqurYy1IRvScqBQ1pPGLZrNSmFn0vDXEE8';
    this.projectId = 'pf5ksg4e5zqgn89';
    this.tableIds = {
      menu: 'mmrv37h1hbu2hl6',
      extras: 'mk1ufwpu8salnvx',
      orders: 'mcgorx1a6qxkfsp',
      categories: 'mi2girkxamkni1y'
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'xc-token': this.token,
        'xc-workspace-id': 'w3a29qs2',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`NocoDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMenuItems() {
    try {
      const response = await this.request(`/api/v2/tables/${this.projectId}/${this.tableIds.menu}/records`);
      return response.list || response;
    } catch (error) {
      console.error('Error fetching menu items from NocoDB:', error);
      // Fallback to local storage for development
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await this.request(`/api/v2/tables/${this.projectId}/${this.tableIds.categories}/records`);
      return response.list || response;
    } catch (error) {
      console.error('Error fetching categories from NocoDB:', error);
      // Fallback to local storage for development
      return [];
    }
  }

  async getExtras() {
    try {
      const response = await this.request(`/api/v2/tables/${this.projectId}/${this.tableIds.extras}/records`);
      return response.list || response;
    } catch (error) {
      console.error('Error fetching extras from NocoDB:', error);
      // Fallback to local storage for development
      return [];
    }
  }

  async createOrder(orderData: any) {
    try {
      const response = await this.request(`/api/v2/tables/${this.projectId}/${this.tableIds.orders}/records`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response;
    } catch (error) {
      console.error('Error creating order in NocoDB:', error);
      throw error;
    }
  }

  async updateOrder(orderId: number, updates: any) {
    try {
      const response = await this.request(`/api/v2/tables/${this.projectId}/${this.tableIds.orders}/records/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error('Error updating order in NocoDB:', error);
      throw error;
    }
  }
}

export const nocodbClient = new NocoDBClient();
