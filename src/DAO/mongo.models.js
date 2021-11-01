import mongoose from 'mongoose';

const productosCollection = 'productos';
const carritoCollection= 'carritos';

const productoEsquema = mongoose.Schema({
    id:{type: Number, require: true},
    title: {type: String, require: true, minLength: 1, maxLenghth: 50},
    description: {type: String, require: true, minLength: 1, maxLenghth: 500},
    code: {type: String, require: true, minLength: 1, maxLenghth: 20},
    image: {type: String, require: true, minLength: 1, maxLenghth: 20},
    price: {type: Number, require: true},
    stock: {type: Number, require: true},
    cantidad: {type: Number, require: false},
    precio_total:{type: Number, require: false},
});

const carritoEsquema = mongoose.Schema({
    productos:[productoEsquema]
})

const producto = mongoose.model(productosCollection, productoEsquema);
const carrito = mongoose.model(carritoCollection, carritoEsquema);

export {producto, carrito}