import { categories, menu, extras, orders, type Category, type Menu, type Extra, type Order, type InsertCategory, type InsertMenu, type InsertExtra, type InsertOrder } from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Menu
  getMenuItems(): Promise<Menu[]>;
  getMenuItemsByCategory(categoryId: number): Promise<Menu[]>;
  createMenuItem(item: InsertMenu): Promise<Menu>;
  updateMenuItem(id: number, updates: Partial<Menu>): Promise<Menu>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Extras
  getExtras(): Promise<Extra[]>;
  createExtra(extra: InsertExtra): Promise<Extra>;
  updateExtra(id: number, updates: Partial<Extra>): Promise<Extra>;
  deleteExtra(id: number): Promise<void>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category> = new Map();
  private menuItems: Map<number, Menu> = new Map();
  private extras: Map<number, Extra> = new Map();
  private orders: Map<number, Order> = new Map();
  private currentCategoryId = 1;
  private currentMenuId = 1;
  private currentExtraId = 1;
  private currentOrderId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoryData: Category[] = [
      { id: 1, name: "Pizza", icon: "🍕" },
      { id: 2, name: "Pasta", icon: "🍝" },
      { id: 3, name: "Dolci", icon: "🍰" },
      { id: 4, name: "Antipasti", icon: "🥗" }
    ];

    categoryData.forEach(cat => {
      this.categories.set(cat.id, cat);
      this.currentCategoryId = Math.max(this.currentCategoryId, cat.id + 1);
    });

    // Seed menu items
    const menuData: Menu[] = [
      // Pizza
      { id: 1, name: "Pizza Margherita", description: "Classic tomato sauce, fresh mozzarella, basil, and olive oil on our signature thin crust", price: "16.99", image_url: "https://images.unsplash.com/photo-1564128442383-9201fcc740eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 1 },
      { id: 2, name: "Pizza Quattro Stagioni", description: "Four seasons pizza with artichokes, mushrooms, ham, and olives, representing the four seasons", price: "21.99", image_url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 1 },
      { id: 3, name: "Pizza Diavola", description: "Spicy pizza with tomato sauce, mozzarella, spicy salami, and fresh chili peppers", price: "19.99", image_url: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 1 },
      { id: 4, name: "Pizza Capricciosa", description: "Rich pizza with ham, mushrooms, artichokes, black olives, and mozzarella", price: "22.99", image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 1 },
      { id: 5, name: "Pizza Marinara", description: "Simple and traditional pizza with tomato sauce, garlic, oregano, and olive oil", price: "14.99", image_url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 1 },
      { id: 6, name: "Pizza Quattro Formaggi", description: "Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta", price: "20.99", image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 1 },
      
      // Pasta
      { id: 7, name: "Spaghetti Carbonara", description: "Classic Roman pasta with pancetta, eggs, pecorino cheese, and black pepper", price: "18.99", image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 2 },
      { id: 8, name: "Penne Arrabbiata", description: "Spicy pasta with tomatoes, garlic, red chili peppers, and fresh basil", price: "15.99", image_url: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 2 },
      { id: 9, name: "Fettuccine Alfredo", description: "Rich and creamy pasta with butter, heavy cream, and freshly grated parmesan", price: "17.99", image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 2 },
      { id: 10, name: "Lasagna Bolognese", description: "Traditional layered pasta with meat sauce, bechamel, and three cheeses", price: "22.99", image_url: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 2 },
      
      // Dolci
      { id: 11, name: "Tiramisu", description: "Classic Italian dessert with espresso-soaked ladyfingers, mascarpone, and cocoa", price: "8.99", image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 3 },
      { id: 12, name: "Cannoli Siciliani", description: "Traditional Sicilian pastry tubes filled with sweet ricotta and pistachios", price: "7.99", image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 3 },
      { id: 13, name: "Gelato Artigianale", description: "Artisanal Italian ice cream available in vanilla, chocolate, and pistachio flavors", price: "6.99", image_url: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 3 },
      
      // Antipasti
      { id: 14, name: "Bruschetta", description: "Toasted bread topped with fresh tomatoes, basil, garlic, and olive oil", price: "9.99", image_url: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 4 },
      { id: 15, name: "Caprese Salad", description: "Fresh mozzarella, ripe tomatoes, and basil drizzled with balsamic glaze", price: "12.99", image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 4 },
      { id: 16, name: "Antipasto Misto", description: "Mixed platter with cured meats, Italian cheeses, olives, and marinated vegetables", price: "16.99", image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600", available: true, category_id: 4 }
    ];

    menuData.forEach(item => {
      this.menuItems.set(item.id, item);
      this.currentMenuId = Math.max(this.currentMenuId, item.id + 1);
    });

    // Seed extras
    const extrasData: Extra[] = [
      { id: 1, name: "Extra Mozzarella", price: "2.99", available: true },
      { id: 2, name: "Fresh Basil", price: "1.99", available: true },
      { id: 3, name: "Prosciutto", price: "4.99", available: true },
      { id: 4, name: "Mushrooms", price: "2.50", available: true },
      { id: 5, name: "Olives", price: "2.00", available: true },
      { id: 6, name: "Artichokes", price: "3.50", available: true },
      { id: 7, name: "Pepperoni", price: "3.99", available: true },
      { id: 8, name: "Extra Cheese", price: "2.99", available: true }
    ];

    extrasData.forEach(extra => {
      this.extras.set(extra.id, extra);
      this.currentExtraId = Math.max(this.currentExtraId, extra.id + 1);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updatedCategory = { ...existingCategory, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    if (!this.categories.has(id)) {
      throw new Error(`Category with id ${id} not found`);
    }
    this.categories.delete(id);
  }

  async getMenuItems(): Promise<Menu[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(categoryId: number): Promise<Menu[]> {
    return Array.from(this.menuItems.values()).filter(item => item.category_id === categoryId);
  }

  async createMenuItem(item: InsertMenu): Promise<Menu> {
    const id = this.currentMenuId++;
    const newItem: Menu = { ...item, id };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  async updateMenuItem(id: number, updates: Partial<Menu>): Promise<Menu> {
    const existingItem = this.menuItems.get(id);
    if (!existingItem) {
      throw new Error(`Menu item with id ${id} not found`);
    }
    const updatedItem = { ...existingItem, ...updates };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    if (!this.menuItems.has(id)) {
      throw new Error(`Menu item with id ${id} not found`);
    }
    this.menuItems.delete(id);
  }

  async getExtras(): Promise<Extra[]> {
    return Array.from(this.extras.values());
  }

  async createExtra(extra: InsertExtra): Promise<Extra> {
    const id = this.currentExtraId++;
    const newExtra: Extra = { ...extra, id };
    this.extras.set(id, newExtra);
    return newExtra;
  }

  async updateExtra(id: number, updates: Partial<Extra>): Promise<Extra> {
    const existingExtra = this.extras.get(id);
    if (!existingExtra) {
      throw new Error(`Extra with id ${id} not found`);
    }
    const updatedExtra = { ...existingExtra, ...updates };
    this.extras.set(id, updatedExtra);
    return updatedExtra;
  }

  async deleteExtra(id: number): Promise<void> {
    if (!this.extras.has(id)) {
      throw new Error(`Extra with id ${id} not found`);
    }
    this.extras.delete(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      created_at: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      throw new Error(`Order with id ${id} not found`);
    }
    const updatedOrder = { ...existingOrder, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
