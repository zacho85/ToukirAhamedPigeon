import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24-preview" as any,
});

// Initialize Database
async function initDb() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      date TEXT,
      location TEXT,
      city TEXT,
      category TEXT,
      imageUrl TEXT,
      price REAL,
      organizerId TEXT,
      ticketsAvailable INTEGER
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      eventId TEXT,
      userId TEXT,
      purchaseDate TEXT,
      status TEXT,
      FOREIGN KEY(eventId) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      userId TEXT PRIMARY KEY,
      status TEXT,
      planId TEXT,
      stripeCustomerId TEXT
    );
  `);

  // Seed with some data if empty
  const count = await db.get("SELECT COUNT(*) as count FROM events");
  if (count.count === 0) {
    const mockEvents = [
      ['1', 'Techno Warehouse Night', 'Une nuit intense au coeur de Paris.', '2026-04-15T22:00:00', 'Warehouse A', 'Paris', 'music', 'https://picsum.photos/seed/techno/800/600', 25.0, 'org1', 500],
      ['2', 'Art Exhibition: Modern Soul', 'Découvrez les nouveaux talents de Berlin.', '2026-04-20T10:00:00', 'Gallery B', 'Berlin', 'art', 'https://picsum.photos/seed/art/800/600', 15.0, 'org2', 200],
    ];
    for (const event of mockEvents) {
      await db.run("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", event);
    }
  }

  return db;
}

async function startServer() {
  const db = await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const events = await db.all("SELECT * FROM events");
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await db.get("SELECT * FROM events WHERE id = ?", [req.params.id]);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const { title, description, date, location, city, category, imageUrl, price, ticketsAvailable } = req.body;
      const id = Math.random().toString(36).substring(7);
      await db.run(
        "INSERT INTO events (id, title, description, date, location, city, category, imageUrl, price, organizerId, ticketsAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, title, description, date, location, city, category, imageUrl, price, 'current-user', ticketsAvailable]
      );
      res.json({ id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { priceId, successUrl, cancelUrl, mode = "payment", metadata = {} } = req.body;
      
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        line_items: [
          {
            price_data: mode === "payment" ? {
              currency: "eur",
              product_data: {
                name: metadata.eventTitle || "Billet Kongossa",
              },
              unit_amount: Math.round(parseFloat(metadata.price) * 100),
            } : undefined,
            price: mode === "subscription" ? priceId : undefined,
            quantity: 1,
          },
        ],
        mode: mode as any, // Fix type error for Session.Mode
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: metadata,
      };

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

