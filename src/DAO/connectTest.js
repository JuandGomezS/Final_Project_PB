import {DAO} from "./dao.js"

const persistence = new DAO()

persistence.connect(3)


const imprimir = async ()=>{

   console.log(await persistence.getCart(3)) 
}

imprimir()

