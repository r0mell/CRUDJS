const inquirer = require('inquirer');
const fs = require('fs');
const rxjs = require('rxjs');
const mergeMap = require('rxjs/operators').mergeMap;
const map = require('rxjs/operators').map;
main();
//Mensaje para llenar la base de datos// opciones, dados a actualizar
const preguntasBdd = [{
        type: 'input',
        name: 'userName',
        message: 'Ingresa tu nombre',
        default: 'User',
    },
    {
        type: 'number',
        name: 'idUser',
        message: 'Ingresa tu id',
    },
    {
        type: 'input',
        name: 'phone',
        message: "Cual es tu cell?",
        validate: function (value) {
            var pass = value.match(/^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i);
            if (pass) {
                return true;
            }
            return 'Please enter a valid phone number';
        }
    },
    {
        type: 'list',
        name: 'personaje',
        message: 'con que personaje te identificas',
        default: 'luffy',
        choices: ['luffy', 'zoro', 'nami']
    }];
const buscarX = [{
        type: 'input',
        name: 'buscarId',
        mensaje: 'ingresa el id que deseas buscar: ',
    }];
const opcionesMenu = [{
        type: 'rawlist',
        name: 'opcionMenu',
        message: 'Que deseas realizar ?',
        default: 'Salir',
        choices: ['Crear', 'Actualizar', 'Borrar', new inquirer.Separator(), 'Salir'],
    }];
//Al usar inquirer de esta manera lo que estamos obteniendo es una promesa 
/*const respuestas = inquirer.prompt(preguntasBdd);
respuestas.then((res) => {
    console.log(res);
    
})*/
// escribir para que sirve le merger map y el map 
//Funcion principal la cual contiene toda la funcionalidad del programa 
function main() {
    console.log("este es un ejercicio para aprender js junto con ts ");
    inicializarBdd()
        .pipe(mergeMap((respuesta) => {
        return rxjs.
            from(inquirer.prompt(opcionesMenu))
            .pipe(map((opcionMenu) => {
            respuesta.opcionMenu = opcionMenu;
            return respuesta;
        }));
    }), mergeMap((respuesta) => {
        switch (respuesta.opcionMenu.opcionMenu) {
            case 'Crear':
                return rxjs.from(inquirer.prompt(preguntasBdd))
                    .pipe(map((newUser) => {
                    respuesta.newUser = newUser;
                    return respuesta;
                }));
                break;
            case 'Actualizar':
                return rxjs.from(inquirer.prompt(buscarX))
                    .pipe(map((buscarId) => {
                    respuesta.buscarId = buscarId;
                    return respuesta;
                }));
                break;
            case 'Borrar':
                return rxjs.from(inquirer.prompt(buscarX))
                    .pipe(map((buscarId) => {
                    respuesta.buscarId = buscarId;
                    return respuesta;
                }));
                break;
            case 'Salir':
                throw "stop execution";
                break;
        }
    }), map((respuesta) => {
        //realizare un swich case para cada caso ya que la opcion menu 
        switch (respuesta.opcionMenu.opcionMenu) {
            case 'Crear':
                respuesta.bdd.usuarios.push(respuesta.newUser);
                return respuesta;
                break;
            case 'Actualizar':
                respuesta.bdd.usuarios.forEach((valor, index) => {
                    if (respuesta.bdd.usuarios[index].idUser == respuesta.buscarId.buscarId) {
                        respuesta.bdd.usuarios[index].userName = 'prueba Modificacion';
                        //console.log('ok111');
                    }
                });
                return respuesta;
                break;
            case 'Borrar':
                respuesta.bdd.usuarios.forEach((valor, index) => {
                    if (respuesta.bdd.usuarios[index].idUser == respuesta.buscarId.buscarId) {
                        respuesta.bdd.usuarios.splice(index, 1);
                        //console.log('ok111');
                    }
                });
                //console.log('id pregunta' + respuesta.buscarId.buscarId)
                //console.log('id arreglo' + typeof (buscarId) + buscarId);
                return respuesta;
                break;
        }
    }), mergeMap((respuesta) => {
        return rxjs.from(gurdarBdd(respuesta.bdd));
    }))
        .subscribe((respuesta) => {
        console.log(respuesta);
        console.log(respuesta.bdd);
    }, (error) => {
        console.log(error);
    }, () => {
        console.log('complete');
        main();
    });
}
//Funciones creadas para controlar las Bdd echa en json
function inicializarBdd() {
    const bddLeida$ = rxjs.from(leerBdd());
    return bddLeida$
        .pipe(mergeMap((respuestaBDD) => {
        if (respuestaBDD.bdd) {
            return rxjs.of(respuestaBDD);
        }
        else {
            return rxjs.from(crearBdd());
        }
    }));
}
function leerBdd() {
    return new Promise((resolve) => {
        fs.readFile('bdd.json', 'utf-8', (error, contenidoBDD) => {
            if (error) {
                resolve({
                    mensaje: 'Base de datos no encontrada',
                    bdd: null
                });
            }
            else {
                resolve({
                    mensaje: 'Base de datos leida',
                    bdd: JSON.parse(contenidoBDD)
                });
            }
        });
    });
}
function gurdarBdd(bdd) {
    return new Promise((resolve, reject) => {
        fs.writeFile('bdd.json', JSON.stringify(bdd), (error) => {
            if (error) {
                reject({
                    mensaje: 'Datos no guardados ',
                    error: 500
                });
            }
            else {
                resolve({
                    mensaje: 'Datos guardados correctamente',
                    bdd: bdd
                });
            }
        });
    });
}
function crearBdd() {
    const contenido = '{"usuarios":[]}';
    return new Promise((resolve, reject) => {
        fs.writeFile('bdd.json', contenido, (error) => {
            if (error) {
                reject({
                    mensaje: 'Error al crear la base de datos',
                    bdd: 500
                });
            }
            else {
                resolve({
                    mensaje: 'Base de datos creada',
                    bdd: JSON.parse(contenido)
                });
            }
        });
    });
}
/*
function eliminarPorName(name){
    jsonVar.hobbies.forEach(function(currentValue, index, arr){
    if(jsonVar.hobbies[index].name==name){
        jsonVar.hobbies.splice(index, index);
     }
    })
  }
*/
