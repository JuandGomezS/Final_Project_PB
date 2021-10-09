import { Router } from "express";
import fs from 'fs';
import { isAdmin } from "../../server.js";
import { Carrito } from "./carrito.model.js";

const {pathname: root} = new URL('../', import.meta.url)
const __dirname=root.substring(1);

//*****************************VARIABLES************************************/
let newId = 0;
let dataPathProductos= __dirname + "data/productos.txt";
let dataPathCarrito= __dirname + "data/carrito.txt";
let productos=[];


//**************************************************************************/

//*************************READ DATA FUNCTION*******************************/
const readData= (path)=>{
  /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
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

let carrito=readData(dataPathCarrito);
export const carritoRouter = Router();

//********************************ROUTES************************************/
carritoRouter
  //******************************LISTAR************************************/
  .get("/listar", (req, res) => {
    carrito=readData(dataPathCarrito);
    const object = { error: "No hay productos cargados al carrito" };
    if(carrito.length == 0 || carrito.productos.length == 0){
      res.json({ object, response: "400 Bad request"})
    }
    else{
      res.json( { carrito, response: "200 OK" } );
    }
  })

  //******************************LISTAR ID*********************************/
  .get("/listar/:id", (req, res) => {
    carrito=readData(dataPathCarrito);
    let params = req.params;
    let id = params.id;
    if(!id){
        res.json({ Error: "Incomplete Params", response: "400 Bad request" });
        return;
    }
    const product = carrito.productos.find((elemento) => elemento.id == id);
    const object = { error: "Producto no encontrado" };
    res.json(product ? { product, response: "200 OK" } : { object, response: "400 Bad request"});
  })

  //****************************AGREGAR************************************/
  .post("/agregar/:id", (req, res) => {
    const carrito = new Carrito();
    let carritot=readData(dataPathCarrito);
    let prods=[];
    carritot.productos?prods=carritot.productos:prods=[];
    if(!isAdmin){
      res.json({ error : -1, descripcion: "Ruta /carrito/agregar método POST no autorizada"})
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
    prods.push(producto);
    carrito.id=newId;
    carrito.productos=prods;
    fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
    res.json({ response: "200 OK" });
  })

  //******************************BORRAR************************************/
  .delete("/borrar/:id", (req, res) => {
    carrito=readData(dataPathCarrito);
    if(!isAdmin){
      res.json({ error : -1, descripcion: "Ruta /carrito/borrar/id? método DELETE no autorizada"})
      return;
    }
    let params = req.params;
    let id = params.id;
    let index = carrito.productos.findIndex((x) => x.id == id);
    if(!id||index<0){
        res.json({ Error: "Incomplete Params or product doesn't exist", response: "400 Bad request" });
        return;
    }
    carrito.productos.splice(index, 1);
    fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
    const succes = { response: "Producto eliminado" };
    const object = { error: "Producto no encontrado" };
    res.json(index >= 0 ? { succes, response: "200 OK" } : { object, response: "400 Bad request" })
});
//**************************************************************************/



