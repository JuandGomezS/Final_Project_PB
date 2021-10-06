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
    const object = { error: "no hay productos cargados" };
    res.json(productos.length>0 ? { productos, response: "200 OK" } : { object, response: "400 Bad request"});
  })

  .get("/listar/:id", (req, res) => {
    let params = req.params;
    let id = params.id;
    if(!id){
      res.json({ Error: "Incomplete Params", response: "400 Bad request" });
      return;
    }
    const product = productos.find((elemento) => elemento.id == id);
    const object = { error: "producto no encontrado" };
    res.json(product ? { product, response: "200 OK" } : { object, response: "400 Bad request"});
  })

  .post("/agregar", (req, res) => {
    if(!isAdmin){
      res.json({ error : -1, descripcion: "ruta /productos/agregar método POST no autorizada"})
      return;
    }
    let body = req.body;
    if(!body.title||!body.description||!body.code||!body.image||!body.price||!body.stock){
      res.json({ Error: "Incomplete Request", response: "400 Bad request" });
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
    res.json({ Description: "Producto agregado",response: "200 OK" });
  })

  .put("/actualizar/:id", (req, res) => {
    if(!isAdmin){
      res.json({ error : -1, descripcion: "ruta /productos/actualizar/id? método PUT no autorizada"})
      return;
    }
    let params = req.params;
    let body = req.body;
    let id = parseInt(params.id);
    let index = productos.findIndex((x) => x.id == id);
    if(!id||index<0){
      res.json({ Error: "Incomplete Params", response: "400 Bad request" });
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
    const succes = { response: "Producto actualizado" };
    const object = { error: "producto no encontrado" };
    res.json(index >= 0 ? { succes, response: "200 OK" } : { object, response: "400 Bad request" })
  })

  .delete("/borrar/:id", (req, res) => {
    if(!isAdmin){
      res.json({ error : -1, descripcion: "ruta /productos/borrar/id? método DELETE no autorizada"})
      return;
    }
    let params = req.params;
    let id = params.id;
    let index = productos.findIndex((x) => x.id == id);
    console.log(index)
    console.log(id)
    if(!id||index<0){
      res.json({ Error: "Incomplete Params or product doesn't exist", response: "400 Bad request" });
      return;
    }
    productos.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(productos));
    const succes = { response: "Producto eliminado" };
    const object = { error: "producto no encontrado" };
    res.json(index >= 0 ? { succes, response: "200 OK" } : { object, response: "400 Bad request" })
});
//***************************************************************************/



