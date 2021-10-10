import { Router } from "express";
import fs from 'fs';
import { isAdmin } from "../../server.js";


const {pathname: root} = new URL('../', import.meta.url)
const __dirname=root.substring(1);

//*****************************VARIABLES************************************/
let newId = 0;
let productos=[];
let dataPath= __dirname + "data/productos.txt";
//**************************************************************************/

//*************************READ DATA FUNCTION*******************************/
const readData= ()=>{
  /* fs.writeFileSync(dataPath, '[]'); */  //Activar sólo para vaciar el archivo productos.txt
  if (fs.existsSync(dataPath)) {
    try {
      const data = fs.readFileSync(dataPath, "utf8");
      const json = JSON.parse(data);
      return json;
    } catch (e) {
      console.log(e)
    }
  }
} 
//**************************************************************************/

productos=readData();
export const productsRouter = Router();

//********************************ROUTES************************************/
productsRouter
  .get("/listar", (req, res) => {
    const object = { Error: "No hay productos cargados", Response:"400 Bad Request"};
    productos.length>0 ? res.json({ productos, Response: "200 OK" }):res.status(400).send(object);
  })

  .get("/listar/:id", (req, res) => {
    let params = req.params;
    let id = params.id;
    const product = productos.find((elemento) => elemento.id == id);
    const object = { Error: "Producto no encontrado", Response:"400 Bad Request"};
    product ? res.json({ product, Response: "200 OK" }):res.status(400).send(object);
  })

  .post("/agregar", (req, res) => {
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let body = req.body;
    if(!body.title||!body.description||!body.code||!body.image||!body.price||!body.stock){
      const object={ Error: "Incomplete Request", Response: "406 NotAcceptable" }
      res.status(406).send(object)
      return;
    }
    productos.length > 0?newId = parseInt(productos[productos.length - 1].id + 1):newId = 1;
    let object = {
      id: newId,
      timestamp :Date.now(),
  		title : body.title,
      description : body.description,
      code : body.code,
      image : body.image,
      price : body.price,
      stock : body.stock
    };
    productos.push(object);
    fs.writeFileSync(dataPath, JSON.stringify(productos));
    res.json({ Description: "Producto agregado", Response: "200 OK" });
  })

  .put("/actualizar/:id", (req, res) => {
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let params = req.params;
    let body = req.body;
    let id = parseInt(params.id);
    let index = productos.findIndex((x) => x.id == id);
    if(index<0){
      const object={ Error: "Producto no encontrado", Response: "400 Bad Request" };
      res.status(400).send(object)
      return;
    }
    if (index >= 0) {
      productos[index] = {
        id,
        timestamp: Date.now(),
        title: body.title ? body.title : productos[index].title,
        description: body.description ? body.description : productos[index].description,
        code: body.code ? body.code : productos[index].code,
        image: body.image ? body.image : productos[index].image,
        price: body.price ? body.price : productos[index].price,
        stock: body.stock ? body.stock : productos[index].stock
      };
    }
    fs.writeFileSync(dataPath, JSON.stringify(productos));
    const succes = { Description: "Producto actualizado", Response: "200 OK" };
    const object = { Error: "Producto no encontrado", Response: "400 Bad request"};
    index >= 0 ? res.json(succes):res.status(400).send(object);
  })

  .delete("/borrar/:id", (req, res) => {
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let params = req.params;
    let id = params.id;
    let index = productos.findIndex((x) => x.id == id);
    if(index<0){
      const object = { Error: "Producto no encontrado", Response: "400 Bad request" };
      res.status(400).send(object);
      return;
    }
    productos.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(productos));
    const succes = { Description: "Producto eliminado", Response: "200 OK"};
    const object = { Error: "Producto no encontrado", Response: "400 Bad request"};
    index >= 0 ? res.json(succes):res.status(400).send(object);
});
//***************************************************************************/



