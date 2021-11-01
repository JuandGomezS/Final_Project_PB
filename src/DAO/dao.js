import Knex from "knex";
import fs from "fs";
import mongoose from "mongoose";
import { producto, carrito } from "./mongo.models.js";
import admin from "firebase-admin";
import serviceAccount from "./service.firebase.js";
import { Carrito } from "../Routers/carrito.model.js";
const carritoF = new Carrito();

const { pathname: root } = new URL("../", import.meta.url);
const __dirname = root.substring(1);
let dataPath = __dirname + "data/ecommerce.sqlite";
let dataPathProductos = __dirname + "data/productos.txt";
let dataPathCarrito = __dirname + "data/carrito.txt";

export class DAO {
  constructor() {
    this.MySQLopt = {
      client: "mysql",
      connection: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "",
        database: "ecommerce",
      },
    };

    this.SQLiteOpt = {
      client: "sqlite3",
      connection: { filename: dataPath },
      useNullAsDefault: true,
    };

    this.mongoOpt = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 1000,
    };

    this.firebaseOpt = {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://ecommerce-14b1d-firebaseio.com",
    };
  }

  //******************CONNECTION METHODS*************************/

  async connect(cs) {
    if (!cs) {
      console.log("No ha ingresado el método de conexión.");
      return;
    }
    if (cs == 1) {
      const knex = Knex(this.MySQLopt);
      console.log("Conexión a MySQL exitosa.");
      knex.schema.hasTable("productos").then(async function (exists) {
        if (!exists) {
          try {
            await knex.schema.createTable("productos", (table) => {
              table.increments("id"),
                table.string("timestamp"),
                table.string("title"),
                table.string("description"),
                table.string("code"),
                table.string("image"),
                table.integer("price"),
                table.integer("stock");
            });
            console.log("tabla creada!");
            knex.destroy();
          } catch (e) {
            console.log("Error en create de tabla:", e);
            knex.destroy();
          }
        }
      });
    } else if (cs == 2) {
      const knex = Knex(this.SQLiteOpt);
      console.log("Conexión a SQLite exitosa.");
      knex.schema.hasTable("productos").then(async function (exists) {
        if (!exists) {
          try {
            await knex.schema.createTable("productos", (table) => {
              table.increments("id"),
                table.string("timestamp"),
                table.string("title"),
                table.string("description"),
                table.string("code"),
                table.string("image"),
                table.integer("price");
              table.integer("stock");
            });
            console.log("tabla creada!");
            knex.destroy();
          } catch (e) {
            console.log("Error en create de tabla:", e);
            knex.destroy();
          }
        }
      });
    } else if (cs == 3) {
      const connectFS = (path) => {
        if (fs.existsSync(path)) {
          try {
            console.log("Conexión a FS exitosa");
          } catch (e) {
            console.log(e);
          }
        }
      };
      return connectFS(dataPathProductos);
    } else if (cs == 4) {
      const URI =
        "'mongodb+srv://juanGomez:Juan.1604*@cluster0.dwkqc.mongodb.net/ecommerce?retryWrites=true&w=majority";
      await mongoose.connect(URI, this.mongoOpt);
      console.log("Conectado a la base de datos de Mongo...");
    } else if (cs == 5) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "https://ecommerce-14b1d-firebaseio.com",
        });
        console.log("Conectado a Firebase");
      } catch (error) {
        console.log(error);
      }
    }
  }
  //*******************CRUD METHODS FOR PRODUCTS*****************/
  async getProducts(ps) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      return await knex.select("*").from("productos");
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      return await knex.select("*").from("productos");
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };
      return readData(dataPathProductos);
    } else if (ps == 4) {
      return await producto.find({}, { __v: 0 });
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("productos");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        code: doc.data().code,
        image: doc.data().image,
        price: doc.data().price,
        stock: doc.data().stock,
      }));
      return response;
    }
  }

  async getProduct(ps, id) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      return await knex.select("*").from("productos").where("id", id);
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      return await knex.select("*").from("productos").where("id", id);
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };
      let productos = readData(dataPathProductos);

      let product = productos.find((elemento) => elemento.id == id);
      console.log(product);
      product == undefined
        ? (product = [])
        : (product = [productos.find((elemento) => elemento.id == id)]);
      return product;
    } else if (ps == 4) {
      return await producto.find({ id: id }, { __v: 0 });
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("productos");
      const doc = query.doc(`${id}`);
      const item = await doc.get();
      const response = [item.data()];
      if (response[0] == undefined) {
        return [];
      } else {
        return response;
      }
    }
  }

  async deleteProduct(ps, id) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      let del = await knex("productos").where("id", id).del();
      if (del == 1) {
        return true;
      } else {
        return false;
      }
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      let del = await knex("productos").where("id", id).del();
      if (del == 1) {
        return true;
      } else {
        return false;
      }
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };

      let productos = readData(dataPathProductos);
      let index = productos.findIndex((x) => x.id == id);
      productos.splice(index, 1);
      fs.writeFileSync(dataPathProductos, JSON.stringify(productos));
      if (index > -1) {
        return true;
      } else {
        return false;
      }
    } else if (ps == 4) {
      try {
        let del = await producto.deleteOne({ id: id });
        return del.deletedCount > 0;
      } catch (error) {
        return false;
      }
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("productos");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        id: doc.id,
      }));
      let index = response.findIndex((x) => x.id == id);
      const doc = query.doc(`${id}`);
      await doc.delete();
      if (index > -1) {
        return true;
      } else {
        return false;
      }
    }
  }

  async insertProduct(ps, data) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      try {
        const knex = Knex(this.MySQLopt);
        await knex("productos").insert({
          timestamp: Date.now(),
          title: data.title,
          description: data.description,
          code: data.code,
          image: data.image,
          price: data.price,
          stock: data.stock,
        });
        return true;
      } catch (error) {
        return false;
      }
    } else if (ps == 2) {
      try {
        const knex = Knex(this.SQLiteOpt);
        await knex("productos").insert({
          timestamp: Date.now(),
          title: data.title,
          description: data.description,
          code: data.code,
          image: data.image,
          price: data.price,
          stock: data.stock,
        });
        return true;
      } catch (error) {
        return false;
      }
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };
      try {
        let productos = readData(dataPathProductos);
        let newId = 0;
        productos.length > 0
          ? (newId = parseInt(productos[productos.length - 1].id + 1))
          : (newId = 1);
        let object = {
          id: newId,
          timestamp: data.timestamp,
          title: data.title,
          description: data.description,
          code: data.code,
          image: data.image,
          price: data.price,
          stock: data.stock,
        };
        productos.push(object);
        fs.writeFileSync(dataPathProductos, JSON.stringify(productos));
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 4) {
      try {
        let last = await producto.find({}).sort({ id: -1 }).limit(1);
        let newId = last.length == 0 ? 1 : last.shift().id + 1;
        const { title, description, code, image, price, stock } = data;
        let prod = new producto({
          id: newId,
          title,
          description,
          code,
          image,
          price,
          stock,
        });
        prod.save(function (err, prod) {
          if (err) return console.error(err);
          console.log(" Producto guardado.");
        });
        return true;
      } catch (error) {
        return false;
      }
    } else if (ps == 5) {
      try {
        const db = admin.firestore();
        const query = db.collection("productos");
        const querySnapshot = await query.get();
        let docs = querySnapshot.docs;
        const response = docs.map((doc) => ({
          id: doc.id,
        }));
        let id = 1;
        if (response.length > 0) {
          let last = parseInt(response[response.length - 1].id);
          id = last + 1;
        } else {
          id = id;
        }
        let doc = query.doc(`${id}`);
        await doc.create(data);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  }

  async updateProduct(ps, data, id) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      try {
        const knex = Knex(this.MySQLopt);
        await knex("productos").where("id", id).update(data);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 2) {
      try {
        const knex = Knex(this.SQLiteOpt);
        await knex("productos").where("id", id).update(data);
        return true;
      } catch (error) {
        return false;
      }
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };
      try {
        let productos = readData(dataPathProductos);
        console.log(productos);
        let index = productos.findIndex((x) => x.id == id);
        if (index >= 0) {
          productos[index] = {
            id,
            timestamp: Date.now(),
            title: data.title ? data.title : productos[index].title,
            description: data.description
              ? data.description
              : productos[index].description,
            code: data.code ? data.code : productos[index].code,
            image: data.image ? data.image : productos[index].image,
            price: data.price ? data.price : productos[index].price,
            stock: data.stock ? data.stock : productos[index].stock,
          };
        }
        fs.writeFileSync(dataPathProductos, JSON.stringify(productos));
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 4) {
      try {
        let upt = await producto.updateOne({ id: id }, data);
        return upt.modifiedCount > 0;
      } catch (error) {
        return false;
      }
    } else if (ps == 5) {
      try {
        const db = admin.firestore();
        const query = db.collection("productos");
        const doc = query.doc(`${id}`);
        await doc.update(data);
        return true;
      } catch (error) {
        return false;
      }
    }
  }
//*************************************************************/

//*****************CRUD METHODS FOR SHOPPING CAR***************/
  async getCart(ps) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      let car = await this.getSQL(knex);
      if (Object.keys(car).length === 0) {
        return [];
      }
      return car;
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      let car = await this.getSQL(knex);
      if (Object.keys(car).length === 0) {
        return [];
      }
      return car;
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };

      let carrito = readData(dataPathCarrito);
      if (carrito.length == 0 || carrito.productos.length == 0) {
        return [];
      } else {
        return carrito;
      }
    } else if (ps == 4) {
      let car = await carrito.find({}, { __v: 0 });
      return car;
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("carrito");
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        id: doc.id,
        timestamp: doc.data().timestamp,
        productos: doc.data().productos
      }));
      return response
    }
  }

  async getCartItem(ps, id) {
    if (!ps || !id) {
      console.log("No ha ingresado el método de persistencia o el id.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      let car = await this.getSQL(knex);
      return car.productos.find((elemento) => elemento.id == id);
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      let car = await this.getSQL(knex);
      if (Object.keys(car).length === 0) {
        return false;
      }
      return car.productos.find((elemento) => elemento.id == id);
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };

      try {
        let carrito = readData(dataPathCarrito);
        const product = carrito.productos.find((elemento) => elemento.id == id);
        return product;
      } catch (error) {
        return false;
      }
    } else if (ps == 4) {
      let car = await carrito.find({}, { __v: 0 });
      let product = car[0].productos.find((elemento) => elemento.id == id);
      return product;
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("carrito");
      const doc = query.doc(`${1}`);
      const item = await doc.get();
      let response = [item.data()];
      if (response[0] == undefined) {
        return [];
      } else {
        let array = response[0].productos;
        let prodF= array.find((elemento) => elemento.id == id);
        if (prodF==undefined){
          return[]
        }
        return prodF;
      }
    }
  }

  async insertToCart(ps, id) {
    if (!ps || !id) {
      console.log("No ha ingresado el método de persistencia o id.");
      return;
    }
    if (ps == 1) {
      try {
        const knex = Knex(this.MySQLopt);
        let isC= await knex("carrito").select('*')
        if(isC.length==0){
          await knex("carrito").insert({
            TIMESTAMP: Date.now(),
          });
        }
        let isP = await knex("carrito_detalle as cd")
          .select("cd.*")
          .innerJoin("productos as p", "cd.FK_PRODUCTO", "p.ID")
          .where("p.ID", id);
        if (isP.length == 0) {
          let ptoAdd = await this.getProduct(ps, id);
          if (ptoAdd.length == 0) {
            return false;
          }
          await knex("carrito_detalle").insert({
            FK_PRODUCTO: ptoAdd[0].id,
            FK_CARRITO: 1,
            precio_total: ptoAdd[0].price,
            cantidad: 1,
            precio_unitario: ptoAdd[0].price,
          });
        } else {
          let p = isP[0];
          await knex("carrito_detalle")
            .update({
              cantidad: p.cantidad + 1,
              precio_total: p.precio_unitario * (p.cantidad + 1),
            })
            .where("id", p.id);
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 2) {
      try {
        const knex = Knex(this.SQLiteOpt);
        let isP = await knex("carrito_detalle as cd")
          .select("cd.*")
          .innerJoin("productos as p", "cd.FK_PRODUCTO", "p.ID")
          .where("p.ID", id);
        if (isP.length == 0) {
          let ptoAdd = await this.getProduct(ps, id);
          if (ptoAdd.length == 0) {
            return false;
          }
          await knex("carrito_detalle").insert({
            FK_PRODUCTO: ptoAdd[0].id,
            FK_CARRITO: 1,
            precio_total: ptoAdd[0].price,
            cantidad: 1,
            precio_unitario: ptoAdd[0].price,
          });
        } else {
          let p = isP[0];
          await knex("carrito_detalle")
            .update({
              cantidad: p.cantidad + 1,
              precio_total: p.precio_unitario * (p.cantidad + 1),
            })
            .where("id", p.id);
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };

      let carritot = readData(dataPathCarrito);
      try {
        let prods = [];
        carritot.productos ? (prods = carritot.productos) : (prods = []);
        let isP=[prods.find((elemento) => elemento.id == id)];
        if (isP[0]==undefined){
          let productos = readData(dataPathProductos);
          let producto = productos.find((elemento) => elemento.id == id);
          let cantidad = 1;
          let precio_total=parseInt(producto.price)*cantidad;
          let productof={
            id: producto.id,
            timestamp: producto.timestamp,
            title: producto.title,
            description: producto.description,
            code: producto.code,
            image: producto.image,
            price: producto.price,
            stock: producto.stock,
            cantidad,
            precio_total,
          }
          prods.push(productof);
          carritoF.productos = prods;
          fs.writeFileSync(dataPathCarrito, JSON.stringify(carritoF));
          return true;
        }else{
          let upProd = prods.find((elemento) => elemento.id == id);
          upProd.cantidad=upProd.cantidad+1;
          upProd.precio_total=upProd.cantidad*upProd.price;    
          carritoF.productos = prods;
          fs.writeFileSync(dataPathCarrito, JSON.stringify(carritoF));
          return true
        }
      } catch (error) {
         console.log(error);
        return false; 
      }
    } else if (ps == 4) {      
      try {
        
        let product =await this.getProduct(ps,id)
        if(!product){
          return false;
        }
        let cantidad = 1;
        let precio_total=parseInt(product[0].price)*cantidad;
        let prodtoAdd={
          id: product[0].id,
          title: product[0].title,
          description: product[0].description,
          code: product[0].code,
          image: product[0].image,
          price: product[0].price,
          stock: product[0].stock,
          cantidad,
          precio_total,
        }
        let isPro= await this.getCartItem(ps,id)
        if(!isPro){        
          carrito.updateOne(
            { _id: "617de8f3f113dacf00d025d6" },
            { $push: { productos: prodtoAdd } },
            (err, res) => {
              if (err) return console.error(err);
              console.log(" Producto agregado al carrito.");
            }
          );
          return true;
        }else{
          let currPro= await this.getCartItem(ps,id);
          let newQty= currPro.cantidad +1;
          let newTp= currPro.price*newQty;
          carrito.updateOne(
            { _id: "617de8f3f113dacf00d025d6" , "productos.id":id},
            { "$set": { "productos.$.cantidad": newQty, "productos.$.precio_total": newTp} },
            (err, res) => {
              if (err) return console.error(err);
              console.log("Producto agregado al carrito.");
            }
          );
          return true;
        }
        
      } catch (error) {
        return false;
      }
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("carrito");
      let doc = query.doc(`${1}`);
      let pfp = await this.getProduct(ps,id);
      if(pfp.length==0){
        return false
      }
      let isC= await this.getCart(ps);
      if (isC.length==0){
        let cantidad=1;
        let precio_total=pfp[0].price*cantidad;
        let prodtoAdd = {
          id: parseInt(id),
          title: pfp[0].title,
          description: pfp[0].description,
          code: pfp[0].code,
          image: pfp[0].image,
          price: pfp[0].price,
          stock: pfp[0].stock,
          cantidad,
          precio_total
        }
        let data={
          timestamp: Date.now(),
          productos: [prodtoAdd]
        }
        const db = admin.firestore();
        const query = db.collection("carrito");
        let idP = 1;
        let doc = query.doc(`${idP}`);
        await doc.create(data);
        return true;
      } else {
        let isP= await this.getCartItem(ps,id);
        if (isP.length==0){          
          let cantidad=1;
          let precio_total=pfp[0].price*cantidad;
          let prodtoAdd = {
            id: parseInt(id),
            title: pfp[0].title,
            description: pfp[0].description,
            code: pfp[0].code,
            image: pfp[0].image,
            price: pfp[0].price,
            stock: pfp[0].stock,
            cantidad,
            precio_total
          }
          let newP=isC[0].productos;
          newP.push(prodtoAdd);
          newP.sort(function (a, b) {
            return a.id - b.id;
          });
          doc.update({
            productos: newP
          });
          return true;
        }else{
          let prodsCar=isC[0].productos;
          let prodtoUp=prodsCar.find((elemento) => elemento.id == id);
          let index = prodsCar.findIndex((x) => x.id == id);
          prodsCar.splice(index, 1);
          let cantidad=prodtoUp.cantidad+1;
          let precio_total=prodtoUp.price*cantidad;
          let prodtoAdd = {
            id: prodtoUp.id,
            title: prodtoUp.title,
            description: prodtoUp.description,
            code: prodtoUp.code,
            image: prodtoUp.image,
            price: prodtoUp.price,
            stock: prodtoUp.stock,
            cantidad,
            precio_total
          }
          prodsCar.push(prodtoAdd);
          prodsCar.sort(function (a, b) {
            return a.id - b.id;
          });
          doc.update({
            productos: prodsCar
          });
          return true;
          
        }
      }
      
    }
  }

  async deleteFromCart(ps, id) {
    if (!ps || !id) {
      console.log("No ha ingresado el método de persistencia o id.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      let isP = await knex("carrito_detalle as cd")
        .select("cd.*")
        .innerJoin("productos as p", "cd.FK_PRODUCTO", "p.ID")
        .where("p.ID", id);
      if (isP.length == 0) {
        return false;
      }

      if (isP[0].cantidad > 1) {
        let p = isP[0];
        await knex("carrito_detalle")
          .update({
            cantidad: p.cantidad - 1,
            precio_total: p.precio_unitario * (p.cantidad - 1),
          })
          .where("id", p.id);
        return true;
      } else {
        await knex("carrito_detalle").where("FK_PRODUCTO", id).del();
        return true;
      }
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      let isP = await knex("carrito_detalle as cd")
        .select("cd.*")
        .innerJoin("productos as p", "cd.FK_PRODUCTO", "p.ID")
        .where("p.ID", id);
      if (isP.length == 0) {
        return false;
      }

      if (isP[0].cantidad > 1) {
        let p = isP[0];
        await knex("carrito_detalle")
          .update({
            cantidad: p.cantidad - 1,
            precio_total: p.precio_unitario * (p.cantidad - 1),
          })
          .where("id", p.id);
        return true;
      } else {
        await knex("carrito_detalle").where("FK_PRODUCTO", id).del();
        return true;
      }
    } else if (ps == 3) {
      const readData = (path) => {
        /* fs.writeFileSync(path, '[]');  */ //Activar sólo para vaciar el archivo carrito.txt
        if (fs.existsSync(path)) {
          try {
            const data = fs.readFileSync(path, "utf8");
            const json = JSON.parse(data);
            return json;
          } catch (e) {
            console.log(e);
          }
        }
      };
      try {
        let carrito = readData(dataPathCarrito);
        let index = carrito.productos.findIndex((x) => x.id == id);
        if (index < 0) {
          return false;
        }
        let prodtoDel=carrito.productos[index];
        if (prodtoDel.cantidad>1){
          prodtoDel.cantidad=prodtoDel.cantidad-1;
          prodtoDel.precio_total=prodtoDel.cantidad*parseInt(prodtoDel.price)
          fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
          return true
        }
        else{ 
          carrito.productos.splice(index, 1);
          fs.writeFileSync(dataPathCarrito, JSON.stringify(carrito));
          return true;
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 4) {
      try {
        let isPro= await this.getCartItem(ps,id)
        if(!isPro){
          return false;
        }
        let qty= isPro.cantidad;
        if (qty>1){
          let newQty= isPro.cantidad -1;
          let newTp= isPro.price*newQty;
          carrito.updateOne(
            { _id: "617de8f3f113dacf00d025d6" , "productos.id":id},
            { "$set": { "productos.$.cantidad": newQty, "productos.$.precio_total": newTp} },
            (err, res) => {
              if (err) return console.error(err);
              console.log("Producto agregado al carrito.");
            }
          );
          return true;
        }
        else{
          carrito.findOneAndUpdate(
            { _id: "617de8f3f113dacf00d025d6" },
            { $pull: { productos: { id: id } } },
            function (err, data) {}
          );
          return true;
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (ps == 5) {
      const db = admin.firestore();
      const query = db.collection("carrito");
      let doc = query.doc(`${1}`);
      let carrito= await this.getCart(ps);
      let car = carrito.length;
      if (car==0){
        return false
      }
      let isP= await this.getCartItem(ps,id);
      if(isP==0){
        return false;
      }
      if(isP.cantidad>1){
        let prodsCar=carrito[0].productos;
        let prodtoUp=prodsCar.find((elemento) => elemento.id == id);
        let index = prodsCar.findIndex((x) => x.id == id);
        prodsCar.splice(index, 1);
        let cantidad=prodtoUp.cantidad-1;
        let precio_total=prodtoUp.price*cantidad;
        let prodtoAdd = {
          id: prodtoUp.id,
          title: prodtoUp.title,
          description: prodtoUp.description,
          code: prodtoUp.code,
          image: prodtoUp.image,
          price: prodtoUp.price,
          stock: prodtoUp.stock,
          cantidad,
          precio_total
        }
        prodsCar.push(prodtoAdd);
        prodsCar.sort(function (a, b) {
          return a.id - b.id;
        });
        doc.update({
          productos: prodsCar
        });
        return true;
      }else{
        let prodsCar=carrito[0].productos;
        let index = prodsCar.findIndex((x) => x.id == id);
        prodsCar.splice(index, 1);
        prodsCar.sort(function (a, b) {
          return a.id - b.id;
        });
        doc.update({
          productos: prodsCar
        });
        return true;
      }
    }
  }

  async getSQL(knex) {
    const outputFormatter = (output, carrito) => {
      output.id = carrito.idCarrito;
      output.timestamp = carrito.timestampCar;
      if (!output.productos) {
        output.productos = [];
      }
      const { idCarrito, timestampCar, ...pr } = carrito;
      output.productos.push({ ...pr });
      return output;
    };

    let records = await knex("carrito as c")
      .select(
        "c.ID as idCarrito",
        "c.TIMESTAMP as timestampCar",
        "p.*",
        "cd.cantidad",
        "cd.precio_total"
      )
      .innerJoin("carrito_detalle as cd", "c.ID", "cd.FK_CARRITO")
      .innerJoin("productos as p", "p.ID", "cd.FK_PRODUCTO");
    return records.reduce(outputFormatter, {});
  }
//*************************************************************/
}
