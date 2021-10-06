import express from "express";
import { createServer } from "http";
import { productsRouter} from "./src/Routers/productos.router.js";
import {carritoRouter} from "./src/Routers/carrito.router.js";

//****************SETTINGS*******************
const app = express();
const http = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let PORT = 8080;
export let isAdmin=true;

const server = http.listen(PORT, () => {
  console.log("Servidor HTTP escuchando en el puerto", server.address().port);
});

server.on("error", (error) => console.log("Error en servidor", error));
app.use(express.static("./front"));
//*******************************************


//******************ROUTERS******************
app.use("/productos", productsRouter);
app.use("/carrito", carritoRouter);
//*******************************************


