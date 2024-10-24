const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

let products = [];

async function loadProducts() {
  try {
    const data = await fs.readFile("./products.json", "utf8");
    products = JSON.parse(data);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

async function saveProducts() {
  try {
    await fs.writeFile("./products.json", JSON.stringify(products));
  } catch (err) {
    console.error("Error saving products:", err);
  }
}

app.get("/api/products", async (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
  } else {
    res.json(product);
  }
});

app.post("/api/products", async (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  await saveProducts();
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found" });
  } else {
    products[index] = { id, ...req.body };
    await saveProducts();
    res.json(products[index]);
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found" });
  } else {
    products.splice(index, 1);
    await saveProducts();
    res.status(204).json({});
  }
});

loadProducts().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
