import { Router } from "express";
import fs from 'fs';
import { isAdmin } from "../../server.js";

const {pathname: root} = new URL('../', import.meta.url)
const __dirname=root.substring(1);

//*****************************VARIABLES************************************/
let newId = 0;
let dataPathProductos= __dirname + "data/productos.txt";
let dataPathCarrito= __dirname + "data/carrito.txt";
let productos=[];
let carrito=[];
//**************************************************************************/

//*************************READ DATA FUNCTION*******************************/
const readData= (path)=>{
  /* fs.writeFileSync(path, '[]'); */  //Activar sólo para vaciar el archivo carrito.txt
  if (fs.existsSync(path)) {
    try {
      const data = fs.readFileSync(path, "utf8");
      const json = JSON.parse(data);
      return json;
    } catch (e) {
      console.log(e)
    }
  }
} 
//**************************************************************************/

carrito=readData(dataPathCarrito);
export const carritoRouter = Router();

//********************************ROUTES************************************/
carritoRouter
  .get("/listar", (req, res) => {
    const object = { error: "no hay productos cargados al carrito" };
    res.json(carrito.length>0 ? { carrito, response: "200 OK" } : { object, response: "400 Bad request"});
  })

  .get("/listar/:id", (req, res) => {
    let params = req.params;
    let id = params.id;
    if(!id){
        res.json({ Error: "Incomplete Params", response: "400 Bad request" });
        return;
    }
    const product = carrito.find((elemento) => elemento.id == id);
    const object = { error: "producto no encontrado" };
    res.json(product ? { product, response: "200 OK" } : { object, response: "400 Bad request"});
  })

  .post("/agregar/:id", (req, res) => {
    if(!isAdmin){
      res.json({ error : -1, descripcion: "ruta /carrito/agregar método POST no autorizada"})
      return;
    }
    let params = req.params;
    let idP = params.id;
    if(!idP){
        res.json({ Error: "Incomplete Params or product doesn't exist", response: "400 Bad request" });
        return;
    }
    productos=readData(dataPathProductos);
    carrito.length > 0?newId = parseInt(carrito[carrito.length - 1].id + 1):newId = 1;
    const producto = productos.find((elemento) => elemento.id == idP);
    if(!producto){
        res.json({ Error: "Producto no encontrado", Response: "404"});
        return;
    }
    console.log(producto)
    let object = {
      id: newId,
      timestamp :Date.now(),
      producto: producto
    };
    carrito.push(object);
    fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
    res.json({ response: "200 OK" });
  })

  .delete("/borrar/:id", (req, res) => {
    if(!isAdmin){
      res.json({ error : -1, descripcion: "ruta /carrito/borrar/id? método DELETE no autorizada"})
      return;
    }
    let params = req.params;
    let id = params.id;
    let index = carrito.findIndex((x) => x.id == id);
    if(!id||index<0){
        res.json({ Error: "Incomplete Params or product doesn't exist", response: "400 Bad request" });
        return;
    }
    carrito.splice(index, 1);
    fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
    const succes = { response: "Producto eliminado" };
    const object = { error: "producto no encontrado" };
    res.json(index >= 0 ? { succes, response: "200 OK" } : { object, response: "400 Bad request" })
});
//**************************************************************************/



