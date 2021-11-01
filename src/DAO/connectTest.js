import { DAO } from "./dao.js";
import { carrito } from "./mongo.models.js";

const persistence = new DAO();

persistence.connect(4);

let prod = new carrito({
  productos:[]
});
prod.save(function (err, prod) {
  if (err) return console.error(err);
  console.log(" Producto guardado.");
});
