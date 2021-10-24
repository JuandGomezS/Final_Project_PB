import Knex from "knex";
import fs from "fs";
import mongoose from "mongoose";
import {producto} from "./producto.mongo.js"
import admin from "firebase-admin";
import serviceAccount from "./service.firebase.js";




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
      databaseURL: "https://ecommerce-14b1d-firebaseio.com"
    }
  }

  //**************CONNECTION METHOD********************/

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
              table.integer("stock")
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
      const URI = "'mongodb+srv://juanGomez:Juan.1604*@cluster0.dwkqc.mongodb.net/ecommerce?retryWrites=true&w=majority";
      await mongoose.connect(URI, this.mongoOpt);
      console.log("Conectado a la base de datos de Mongo...");
    } else if (cs == 5) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "https://ecommerce-14b1d-firebaseio.com"
        });
        console.log('Conectado a Firebase');

      } catch (error) {
        console.log(error)
      }
      
    }
  }
  //************************************CRUD METHODS***********************************************/

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
      console.log(product)
      product==undefined?product=[]:product=[productos.find((elemento) => elemento.id == id)]
      return product;
    } else if (ps==4){
      return await producto.find({id:id},{__v: 0})
    } else if (ps ==5){
      const  db = admin.firestore();
      const query = db.collection('productos');
      const doc = query.doc(`${id}`);        
      const item = await doc.get();
      const response = [item.data()];
      if (response[0]==undefined){
        return []
      }
      else{
        return response;
      }
    }
  }

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
    } else if (ps == 4){
      return await producto.find({}, { __v: 0})
    } else if (ps == 5){
      const  db = admin.firestore();
      const query = db.collection('productos');
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;        
      const response = docs.map(doc=>({
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

  async deleteProduct(ps, id) {
    if (!ps) {
      console.log("No ha ingresado el método de persistencia.");
      return;
    }
    if (ps == 1) {
      const knex = Knex(this.MySQLopt);
      let del= await knex("productos").where("id", id).del();
      if (del == 1 ){
        return true
      }
      else{ 
        return false
      }
    } else if (ps == 2) {
      const knex = Knex(this.SQLiteOpt);
      let del= await knex("productos").where("id", id).del();
      if (del == 1 ){
        return true
      }
      else{ 
        return false
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
      if (index>-1){
        return true
      }
      else{
        return false
      }
    } else if (ps ==4) {
      try {
        let del= await producto.deleteOne({id:id})
        return del.deletedCount>0
      } catch (error) {
          return false
      }
    } else if (ps ==5) {
      const db = admin.firestore();
      const query = db.collection('productos');
      const querySnapshot = await query.get();
      let docs = querySnapshot.docs;        
      const response = docs.map(doc=>({
          id: doc.id,
      }));
      let index = response.findIndex((x) => x.id == id);
      const doc = query.doc(`${id}`);        
      await doc.delete();
      if (index>-1){
        return true
      }
      else{
        return false
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
        let newId=0;
        productos.length > 0? (newId = parseInt(productos[productos.length - 1].id + 1)) : (newId = 1);
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
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    } else if (ps == 4) {
      try {
        let last= await producto.find({}).sort({id: -1}).limit(1);
        let newId=last.length==0?1:last.shift().id+1;
        const {title,description,code,image,price,stock} = data
        let prod=new producto({id:newId,title,description,code,image,price,stock})
        prod.save(function (err, prod) {
            if (err) return console.error(err);
            console.log(" Producto guardado.");
        });
        return true
      } catch (error) {
          return false
      }
    } else if (ps == 5) {
      try {
        const db = admin.firestore();
        const query = db.collection('productos');
        const querySnapshot = await query.get();
        let docs = querySnapshot.docs;        
        const response = docs.map(doc=>({
          id: doc.id,
        }));
        let id=1;
        let last= parseInt(response[response.length-1].id)
        if(response.length>0){
          id = last+1;
        }
        else{
          id=id
        }
        let doc = query.doc(`${id}`);
        await doc.create(data);
        return true
      } catch (error) {
        console.log(error);
        return false
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
        console.log(error)
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
        console.log(productos) 
        let index = productos.findIndex((x) => x.id == id);
        if (index >= 0) {
          productos[index] = {
            id,
            timestamp: Date.now(),
            title: data.title ? data.title : productos[index].title,
            description: data.description? data.description: productos[index].description,
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
        let upt=await producto.updateOne({id:id}, data);
        console.log(upt.modifiedCount)
        return upt.modifiedCount>0
      } catch (error) {
        return false
      }
    } else if (ps == 5) {
      try {
        const  db = admin.firestore();
        const query = db.collection('productos');
        const doc = query.doc(`${id}`);
        await doc.update(data);        
        return true
      } catch (error) {
        return false
      }

    }
  }




}
