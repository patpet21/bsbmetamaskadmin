// Server-side NocoDB API client
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
    this.baseURL = 'https://app.nocodb.com';
    this.token = process.env.NOCODB_TOKEN || 'zmmPNUaA7kWsxmOa6PHMAPM7aRqmft5rfEWrceir';
    this.projectId = 'pf5ksg4e5zqgn89';
    this.tableIds = {
      menu: 'mmrv37h1hbu2hl6',
      extras: 'mk1ufwpu8salnvx',
      orders: 'mcgorx1a6qxkfsp',
      categories: 'mhzfcqmgq9kbj3c'
    };
    
    console.log('NocoDB Configuration:', {
      baseURL: this.baseURL,
      tokenPrefix: this.token.substring(0, 10) + '...',
      projectId: this.projectId,
      workspaceId: 'w3a29qs2'
    });
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'xc-token': this.token,
        'xc-workspace-id': 'w3a29qs2',
        'workspace-id': 'w3a29qs2',
        'x-workspace-id': 'w3a29qs2',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NocoDB API error: ${response.status} - ${errorText}`);
      throw new Error(`NocoDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMenuItems() {
    try {
      const endpoint = `/api/v2/tables/${this.tableIds.menu}/records?workspaceId=w3a29qs2`;
      console.log('NocoDB Menu endpoint:', `${this.baseURL}${endpoint}`);
      const response = await this.request(endpoint);
      return response.list || response;
    } catch (error) {
      console.error('Error fetching menu items from NocoDB:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const endpoint = `/api/v2/tables/${this.tableIds.categories}/records?workspaceId=w3a29qs2`;
      console.log('NocoDB Categories endpoint:', `${this.baseURL}${endpoint}`);
      const response = await this.request(endpoint);
      return response.list || response;
    } catch (error) {
      console.error('Error fetching categories from NocoDB:', error);
      throw error;
    }
  }

  async getExtras() {
    try {
      const endpoint = `/api/v2/tables/${this.tableIds.extras}/records?workspaceId=w3a29qs2`;
      console.log('NocoDB Extras endpoint:', `${this.baseURL}${endpoint}`);
      const response = await this.request(endpoint);
      return response.list || response;
    } catch (error) {
      console.error('Error fetching extras from NocoDB:', error);
      throw error;
    }
  }

  async createOrder(orderData: any) {
    try {
      const response = await this.request(`/api/v2/tables/${this.tableIds.orders}/records`, {
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
      const response = await this.request(`/api/v2/tables/${this.tableIds.orders}/records/${orderId}`, {
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