import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    res.json({ user: data.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Donations Routes
app.get("/api/donations", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/donations", async (req, res) => {
  try {
    const { title, description, kind, location, images } = req.body;
    const userId = req.user.id; // You'll need to implement auth middleware

    const { data, error } = await supabase
      .from("donations")
      .insert([
        {
          title,
          description,
          kind,
          location,
          images,
          user_id: userId,
        },
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Messages Routes
app.get("/api/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id; // You'll need to implement auth middleware

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          content,
          user_id: userId,
        },
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
