const { pathname: root } = new URL("../", import.meta.url);
const __dirname = root.substring(1);
let dataPath = __dirname + "/db/mensajes.sqlite";
import Knex from 'knex';


export class DAO {
  constructor() {
    

    this.MySQLopt = {
      client: "mysql",
      connection: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "",
        database: "productos",
      },
    };

    this.SQLiteOpt = {
      client: "sqlite3",
      connection: {filename: dataPath},
      useNullAsDefault: true,
    };

    this.mongoOpt={
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 1000,
    }
  }

  //**************CONNECTION METHODS********************/

  connectDB(cs){
      if(!cs){
          console.log("No ha ingresado el método de persistencia.")
        return;
      }
      if(cs==1){
        const knex = Knex(this.MySQLopt);
        knex.schema.hasTable('productos').then(async function(exists) {
            if (!exists) {
                try {
                  await knex.schema.createTable('productos', table => {
                    table.increments('id'),
                    table.string('title'),
                    table.integer('price');
                    table.string('thumbnail');
                  });
                  console.log('tabla creada!');
                  knex.destroy();
                } 
                catch (e) {
                  console.log('Error en create de tabla:', e);
                  knex.destroy();
                }
              }
            }
        );


      }
      else if(cs==2){

      }

  }
}
