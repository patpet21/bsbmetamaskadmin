import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { nocodbClient } from "./nocodb";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      // Try NocoDB first, fallback to local storage
      let categories;
      try {
        categories = await nocodbClient.getCategories();
        if (!categories || categories.length === 0) {
          throw new Error("No categories from NocoDB");
        }
      } catch (nocoError) {
        console.log("NocoDB categories failed, using local storage:", nocoError.message);
        categories = await storage.getCategories();
      }
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Menu items
  app.get("/api/menu", async (req, res) => {
    try {
      const { category } = req.query;
      let menuItems;
      
      // Try NocoDB first, fallback to local storage
      try {
        menuItems = await nocodbClient.getMenuItems();
        if (!menuItems || menuItems.length === 0) {
          throw new Error("No menu items from NocoDB");
        }
        
        // Filter by category if specified
        if (category && category !== "all") {
          menuItems = menuItems.filter((item: any) => item.category_id === parseInt(category as string));
        }
      } catch (nocoError) {
        console.log("NocoDB menu failed, using local storage:", nocoError.message);
        if (category && category !== "all") {
          menuItems = await storage.getMenuItemsByCategory(parseInt(category as string));
        } else {
          menuItems = await storage.getMenuItems();
        }
      }
      
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Extras
  app.get("/api/extras", async (req, res) => {
    try {
      // Try NocoDB first, fallback to local storage
      let extras;
      try {
        extras = await nocodbClient.getExtras();
        if (!extras || extras.length === 0) {
          throw new Error("No extras from NocoDB");
        }
      } catch (nocoError) {
        console.log("NocoDB extras failed, using local storage:", nocoError.message);
        extras = await storage.getExtras();
      }
      res.json(extras);
    } catch (error) {
      console.error("Error fetching extras:", error);
      res.status(500).json({ error: "Failed to fetch extras" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;
      
      // Try to create order in NocoDB first, fallback to local storage
      let order;
      try {
        order = await nocodbClient.createOrder(orderData);
        console.log("Order created in NocoDB:", order);
      } catch (nocoError) {
        console.log("NocoDB order creation failed, using local storage:", nocoError.message);
        // Validate data for local storage
        const validatedData = insertOrderSchema.parse(orderData);
        order = await storage.createOrder(validatedData);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Try to update order in NocoDB first, fallback to local storage
      let updatedOrder;
      try {
        updatedOrder = await nocodbClient.updateOrder(parseInt(id), updates);
        console.log("Order updated in NocoDB:", updatedOrder);
      } catch (nocoError) {
        console.log("NocoDB order update failed, using local storage:", nocoError.message);
        updatedOrder = await storage.updateOrder(parseInt(id), updates);
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ error: "Failed to update order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
