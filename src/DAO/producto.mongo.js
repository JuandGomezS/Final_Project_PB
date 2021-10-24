import mongoose from 'mongoose';

const productosCollection = 'productos';

const productoEsquema = mongoose.Schema({
    id:{type: Number, require: true},
    title: {type: String, require: true, minLength: 1, maxLenghth: 50},
    description: {type: String, require: true, minLength: 1, maxLenghth: 500},
    code: {type: String, require: true, minLength: 1, maxLenghth: 20},
    image: {type: String, require: true, minLength: 1, maxLenghth: 20},
    price: {type: Number, require: true},
    stock: {type: Number, require: true},
});

export const producto = mongoose.model(productosCollection, productoEsquema);