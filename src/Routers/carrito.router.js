import { Router } from "express";
import fs from 'fs';
import { isAdmin } from "../../server.js";
import { Carrito } from "./carrito.model.js";


const {pathname: root} = new URL('../', import.meta.url)
const __dirname=root.substring(1);

//*****************************VARIABLES************************************/

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
const carritoF = new Carrito();
let carrito=readData(dataPathCarrito);
export const carritoRouter = Router();

//********************************ROUTES************************************/
carritoRouter
  //******************************LISTAR************************************/
  .get("/listar", (req, res) => {
    carrito=readData(dataPathCarrito);
    if(carrito.length == 0 || carrito.productos.length == 0){
      const object = { 
        Error: "No hay productos cargados al carrito", 
        Response: "400 Bad Request"
      };
      res.status(400).send(object)
    }
    else{
      res.json( { carrito, Response: "200 OK" } );
    }
  })

  //******************************LISTAR ID*********************************/
  .get("/listar/:id", (req, res) => {
    carrito=readData(dataPathCarrito);
    let params = req.params;
    let id = params.id;
    const product = carrito.productos.find((elemento) => elemento.id == id);
    const object = { Error: "Producto no encontrado", Response: "400 Bad request"};
    product? res.json({ product, Response: "200 OK" }):res.status(400).send(object);
  })

  //****************************AGREGAR************************************/
  .post("/agregar/:id", (req, res) => {
   
    let carritot=readData(dataPathCarrito);
    let prods=[];
    carritot.productos?prods=carritot.productos:prods=[];
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let params = req.params;
    let idP = params.id;

    productos=readData(dataPathProductos);
  
    const producto = productos.find((elemento) => elemento.id == idP);
    if(!producto){
      const object = { Error: "Producto no encontrado", Response: "400 Bad Request"};
        res.status(400).send(object)
        return;
    }
    prods.push(producto);
    carritoF.productos=prods;
    fs.writeFileSync(dataPathCarrito, JSON.stringify(carritoF));
    res.json({ Description: "Producto agregado", Response: "200 OK" });
  })

  //******************************BORRAR************************************/
  .delete("/borrar/:id", (req, res) => {
    carrito=readData(dataPathCarrito);
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let params = req.params;
    let id = params.id;
    let index = carrito.productos.findIndex((x) => x.id == id);
    if(index<0){
      const object = { Error: "Producto no encontrado", response: "400 Bad request" };
      res.status(400).send(object);
      return;
    }
    carrito.productos.splice(index, 1);
    fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
    const succes = { description: "Producto eliminado", response: "200 OK" };
    const object = { error: "Producto no encontrado", response: "400 Bad request"};
    index >= 0 ? res.json(succes):res.status(400).send(object);
});
//**************************************************************************/



