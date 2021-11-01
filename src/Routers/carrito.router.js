import { Router } from "express";
import {  ps } from "../../server.js";

import {DAO} from "../DAO/dao.js"

//*****************************VARIABLES************************************/
const persistence = new DAO()
//**************************************************************************/

export const carritoRouter = Router();
//********************************ROUTES************************************/
carritoRouter
  //******************************READ ALL*********************************/
  .get("/listar", async (req, res) => {
    let carrito = await persistence.getCart(ps)
    if(ps == 1){
      if(carrito.length  == 0 ||carrito.productos.length == 0){
        const object = { 
          Error: "No hay productos cargados al carrito", 
          Response: "400 Bad Request"
        };
        res.status(400).send(object)
      }
      else{
        res.json( { carrito, Response: "200 OK" } );
      }

    }else if(ps==2){
      if(carrito.length  == 0 ||carrito.productos.length == 0){
        const object = { 
          Error: "No hay productos cargados al carrito", 
          Response: "400 Bad Request"
        };
        res.status(400).send(object)
      }
      else{
        res.json( { carrito, Response: "200 OK" } );
      }
      

    }else if(ps == 3){
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
    }else if(ps == 4){
      let succes= carrito[0].productos.length;
      const object = { Error: "No hay productos en el carrito.", Response: "400 Bad request"};
      succes>0? res.json({ carrito, Response: "200 OK" }):res.status(400).send(object);
    }else if(ps==5){
      let succes= carrito[0].productos.length;
      const object = { Error: "No hay productos en el carrito.", Response: "400 Bad request"};
      succes>0? res.json({ carrito, Response: "200 OK" }):res.status(400).send(object);
    }

    
  })

  //******************************READ*********************************/
  .get("/listar/:id", async (req, res) => {
    let params = req.params;
    let id = params.id;
    if(ps==5){
      let product = await persistence.getCartItem(ps,id);
      const object = { Error: "Producto no encontrado", Response: "400 Bad request"};
      product.length>0? res.json({ product, Response: "200 OK" }):res.status(400).send(object);
    }else{
      let product = await persistence.getCartItem(ps,id);
      const object = { Error: "Producto no encontrado", Response: "400 Bad request"};
      product? res.json({ product, Response: "200 OK" }):res.status(400).send(object);
    }
  })

  //****************************CREATE************************************/
  .post("/agregar/:id", async(req, res) => {
    let params = req.params;
    let id = params.id;
    let prodAdd= await persistence.insertToCart(ps,id);
    const object = { Error: "Producto no encontrado.", Response: "400 Bad request"};
    prodAdd? res.json({Description: "Producto agregado", Response: "200 OK" }):res.status(400).send(object);
  })

  //******************************DELETE************************************/
  .delete("/borrar/:id", async (req, res) => { 
    let params = req.params;
    let id = params.id;
    let del=await persistence.deleteFromCart(ps,id)
    const succes = { Description: "Producto eliminado.", Response: "200 OK" };
    const object = { Error: "Producto no encontrado.", Response: "400 Bad request"};
    del? res.json(succes):res.status(400).send(object);
});
//**************************************************************************/



