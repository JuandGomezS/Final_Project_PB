import { Router } from "express";
import { isAdmin , ps } from "../../server.js";
import {DAO} from "../DAO/dao.js"

const persistence = new DAO()

export const productsRouter = Router();

//********************************ROUTES************************************/
productsRouter
  .get("/listar", async (req, res) => {
    let productos= await persistence.getProducts(ps);
    const object = { Error: "No hay productos cargados", Response:"400 Bad Request"};
    productos.length>0 ? res.json({ productos, Response: "200 OK" }):res.status(400).send(object);
  })

  .get("/listar/:id", async (req, res) => {
    let params = req.params;
    let id = params.id;
    let product = await persistence.getProduct(ps, id);
    const object = { Error: "Producto no encontrado", Response:"400 Bad Request"};
    product.length>0 ? res.json({ product, Response: "200 OK" }):res.status(400).send(object);
  })

  .post("/agregar", async(req, res) => {
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", Response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let body = req.body;
    if(!body.title||!body.description||!body.code||!body.image||!body.price||!body.stock){
      const object={ Error: "Incomplete Request", Response: "406 NotAcceptable" }
      res.status(406).send(object)
      return;
    }
    let object = {
      timestamp :Date.now(),
  		title : body.title,
      description : body.description,
      code : body.code,
      image : body.image,
      price : body.price,
      stock : body.stock
    };
    let insert = await persistence.insertProduct(ps,object);
    const succes = { Description: "Producto agregado.", Response: "200 OK" };
    const obj = { Error: "Producto no almacenado", Response: "400 Bad request"};
    insert ? res.json(succes):res.status(400).send(obj);
  })

  .put("/actualizar/:id", async(req, res) => {
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", Response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let params = req.params;
    let body = req.body;
    let id = parseInt(params.id);
    let currentProd= await persistence.getProduct(ps,id);
    if(!currentProd.length>0 && !currentProd){
      const respuesta = { error: "Producto no encontradooo" };
      res.status(404).send(respuesta)
      return;
    }
    let object ={};
    if (currentProd.title!=body.title){
      object.title=body.title;
    }
    if (currentProd.description!=body.description){
      object.description=body.description;
    }
    if (currentProd.code!=body.code){
      object.code=body.code;
    }
    if (currentProd.image!=body.image){
      object.image=body.image;
    }
    if (currentProd.price!=body.price){
      object.price=body.price;
    }
    if (currentProd.stock!=body.stock){
      object.stock=body.stock;
    }
    
    let upt = await persistence.updateProduct(ps,object,id);
    const succes = { Description: "Producto actualizado", Response: "200 OK" };
    const obj = { Error: "Producto no encontrado", Response: "400 Bad request"};
    upt ? res.json(succes):res.status(400).send(obj);
  })

  .delete("/borrar/:id", async (req, res) => {
    if(!isAdmin){
      const object={Error : -1, Descripcion: "Ruta /productos/agregar método POST no autorizada", Response: "401 Unauthorized"}
      res.status(401).send(object)
      return;
    }
    let params = req.params;
    let id = params.id;
    let del = await persistence.deleteProduct(ps,id)
    const succes = { Description: "Producto eliminado", Response: "200 OK"};
    const object = { Error: "Producto no encontrado", Response: "400 Bad request"};
    del ? res.json(succes):res.status(400).send(object);
});
//***************************************************************************/



