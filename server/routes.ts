import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { supabaseService } from "./supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      // Try Supabase first, fallback to local storage
      let categories;
      try {
        categories = await supabaseService.getCategories();
      } catch (supabaseError) {
        console.log("Supabase categories failed, using local storage:", supabaseError.message);
        categories = await storage.getCategories();
      }
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      let newCategory;
      try {
        newCategory = await supabaseService.createCategory(req.body);
      } catch (supabaseError) {
        console.log("Supabase create category failed, using local storage:", supabaseError.message);
        newCategory = await storage.createCategory(req.body);
      }
      res.json(newCategory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      let updatedCategory;
      try {
        updatedCategory = await supabaseService.updateCategory(id, updates);
      } catch (supabaseError) {
        console.log("Supabase update category failed, using local storage:", supabaseError.message);
        updatedCategory = await storage.updateCategory(id, updates);
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      try {
        await supabaseService.deleteCategory(id);
      } catch (supabaseError) {
        console.log("Supabase delete category failed, using local storage:", supabaseError.message);
        await storage.deleteCategory(id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Menu items
  app.get("/api/menu", async (req, res) => {
    try {
      const { category } = req.query;
      let menuItems;
      
      try {
        if (category && category !== "all") {
          menuItems = await supabaseService.getMenuItemsByCategory(parseInt(category as string));
        } else {
          menuItems = await supabaseService.getMenuItems();
        }
      } catch (supabaseError) {
        console.log("Supabase menu failed, using local storage:", supabaseError.message);
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

  // Menu item admin routes
  app.post("/api/menu", async (req, res) => {
    try {
      const menuData = req.body;
      // Convert category_id to number if it's a string
      if (menuData.category_id) {
        menuData.category_id = parseInt(menuData.category_id);
      }
      let newMenuItem;
      try {
        newMenuItem = await supabaseService.createMenuItem(menuData);
      } catch (supabaseError) {
        console.log("Supabase create menu item failed, using local storage:", supabaseError.message);
        newMenuItem = await storage.createMenuItem(menuData);
      }
      res.json(newMenuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      // Convert category_id to number if it's a string
      if (updates.category_id) {
        updates.category_id = parseInt(updates.category_id);
      }
      const updatedMenuItem = await storage.updateMenuItem(id, updates);
      res.json(updatedMenuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Extras
  app.get("/api/extras", async (req, res) => {
    try {
      let extras;
      try {
        extras = await supabaseService.getExtras();
      } catch (supabaseError) {
        console.log("Supabase extras failed, using local storage:", supabaseError.message);
        extras = await storage.getExtras();
      }
      res.json(extras);
    } catch (error) {
      console.error("Error fetching extras:", error);
      res.status(500).json({ error: "Failed to fetch extras" });
    }
  });

  // Extras admin routes
  app.post("/api/extras", async (req, res) => {
    try {
      const newExtra = await storage.createExtra(req.body);
      res.json(newExtra);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/extras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedExtra = await storage.updateExtra(id, updates);
      res.json(updatedExtra);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/extras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExtra(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      let orders;
      try {
        orders = await supabaseService.getOrders();
      } catch (supabaseError) {
        console.log("Supabase get orders failed, using local storage:", supabaseError.message);
        orders = await storage.getOrders();
      }
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
      
      let order;
      try {
        order = await supabaseService.createOrder(orderData);
        console.log("Order created in Supabase:", order);
      } catch (supabaseError) {
        console.log("Supabase order creation failed, using local storage:", supabaseError.message);
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
