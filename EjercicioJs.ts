declare var require: any;
const inquirer = require('inquirer');
const fs = require('fs');
const rxjs = require('rxjs');
const mergeMap = require('rxjs/operators').mergeMap;
const map = require('rxjs/operators').map;
const concat = require('rxjs/operators').concat


main()



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
        var pass = value.match(
            /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
        );
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
}]

const buscarX = [{
    type: 'input',
    name: 'buscarId',
    message: 'ingresa el id que deseas buscar: ',
    //default:'1' 

}]

const opcionesMenu = [{
    type: 'rawlist',
    name: 'opcionMenu',
    message: 'Que deseas realizar ?',
    default: 'Salir',
    choices: ['Crear', 'Actualizar', 'Borrar', new inquirer.Separator(), 'Salir'],
}]

const updateName = [{
    type: 'input',
    name: 'updateName',
    message: 'Ingrese su nombre de usuario: ',
    default: 'user'
}]

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
        .pipe(
            mergeMap(
                (respuesta: respuestaBDD) => {
                    return rxjs.
                        from(inquirer.prompt(opcionesMenu))
                        .pipe(
                            map(
                                (opcionMenu: opcionesMenu) => {
                                    respuesta.opcionMenu = opcionMenu
                                    return respuesta
                                }
                            )
                        )
                })
            , mergeMap(
                (respuesta: respuestaBDD) => {
                    switch (respuesta.opcionMenu.opcionMenu) {
                        case 'Crear':
                            return rxjs.from(inquirer.prompt(preguntasBdd))
                                .pipe(
                                    map(
                                        (newUser: newUser) => {
                                            respuesta.newUser = newUser
                                            return respuesta
                                        }
                                    )
                                )

                            break;
                        case 'Actualizar':
                            //const update$ = rxjs.from(inquirer.prompt(updateName))


                            return rxjs.from(inquirer.prompt(buscarX))
                                .pipe(
                                    map(
                                        (buscarId: buscarId) => {
                                            respuesta.buscarId = buscarId
                                            //return rxjs.from(inquirer.prompt(actualizarName))

                                            return respuesta
                                        }
                                    )
                                )
                                .pipe(
                                    mergeMap(
                                        (respuesta: respuestaBDD) => {

                                            return rxjs.from(inquirer.prompt(updateName)).
                                                pipe(
                                                    map(
                                                        (updateName: updateName) => {
                                                            respuesta.updateName = updateName
                                                            //return rxjs.from(inquirer.prompt(actualizarName))

                                                            return respuesta
                                                        }
                                                    )
                                                )
                                        }
                                    )
                                )


                            break;

                        case 'Borrar':
                            return rxjs.from(inquirer.prompt(buscarX))
                                .pipe(
                                    map(
                                        (buscarId: buscarId) => {
                                            respuesta.buscarId = buscarId
                                            return respuesta
                                        }
                                    )
                                )

                            break;

                        case 'Salir':
                            throw "stop execution";
                            break;
                    }

                })
            , map(
                (respuesta: respuestaBDD) => {

                    //realizare un swich case para cada caso ya que la opcion menu 
                    switch (respuesta.opcionMenu.opcionMenu) {
                        case 'Crear':
                            respuesta.bdd.usuarios.push(respuesta.newUser)
                            return respuesta

                            break;
                        case 'Actualizar':

                            respuesta.bdd.usuarios.forEach(
                                (valor, index) => {
                                    if (respuesta.bdd.usuarios[index].idUser == respuesta.buscarId.buscarId) {
                                        respuesta.bdd.usuarios[index].userName = respuesta.updateName.updateName
                                        //console.log('ok111');

                                    }
                                }
                            )
                            return respuesta

                            break;


                        case 'Borrar':

                            respuesta.bdd.usuarios.forEach(
                                (valor, index) => {
                                    if (respuesta.bdd.usuarios[index].idUser == respuesta.buscarId.buscarId) {
                                        respuesta.bdd.usuarios.splice(index, 1)

                                    }
                                }
                            )

                            //console.log('id pregunta' + respuesta.buscarId.buscarId)
                            //console.log('id arreglo' + typeof (buscarId) + buscarId);

                            return respuesta

                            break;
                    }
                })
            , mergeMap(
                (respuesta: respuestaBDD) => {
                    return rxjs.from(gurdarBdd(respuesta.bdd))
                })
        )
        .subscribe(
            (respuesta: respuestaBDD) => {
                console.log(respuesta);
                console.log(respuesta.bdd);

            },
            (error) => {
                console.log(error);
            },
            () => {
                console.log('complete');
                main()
            }
        )
}


//Funciones creadas para controlar las Bdd echa en json
function inicializarBdd() {
    const bddLeida$ = rxjs.from(leerBdd())

    return bddLeida$
        .pipe(
            mergeMap(
                (respuestaBDD: respuestaBDD) => {
                    if (respuestaBDD.bdd) {
                        return rxjs.of(respuestaBDD)
                    } else {
                        return rxjs.from(crearBdd())
                    }
                }
            )
        )
}

function leerBdd() {
    return new Promise(
        (resolve) => {
            fs.readFile(
                'bdd.json',
                'utf-8',
                (error, contenidoBDD) => {
                    if (error) {
                        resolve({
                            mensaje: 'Base de datos no encontrada',
                            bdd: null
                        })

                    } else {
                        resolve({
                            mensaje: 'Base de datos leida',
                            bdd: JSON.parse(contenidoBDD)
                        })

                    }

                }
            )
        }
    )
}

function gurdarBdd(bdd: bdd) {
    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                'bdd.json',
                JSON.stringify(bdd),
                (error) => {
                    if (error) {
                        reject({
                            mensaje: 'Datos no guardados ',
                            error: 500
                        })
                    } else {
                        resolve({
                            mensaje: 'Datos guardados correctamente',
                            bdd: bdd
                        })
                    }
                }
            )

        }
    )

}
function crearBdd() {

    const contenido = '{"usuarios":[]}'
    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                'bdd.json',
                contenido,
                (error) => {
                    if (error) {
                        reject({
                            mensaje: 'Error al crear la base de datos',
                            bdd: 500
                        })
                    } else {
                        resolve({
                            mensaje: 'Base de datos creada',
                            bdd: JSON.parse(contenido)
                        })
                    }
                }
            )
        }
    )
}



//Interfaces del sistema 

interface respuestaBDD {
    mensaje: string;
    bdd?: bdd;
    opcionMenu?: opcionesMenu;
    newUser?: newUser;
    buscarId?: buscarId;
    updateName?: updateName;
}
interface opcionesMenu {
    opcionMenu: 'Crear' | 'Actualizar' | 'Borrar' | 'Salir';

}

interface buscarId {
    buscarId: number
}
interface updateName {
    updateName: string
}

interface bdd {
    usuarios?: newUser[];
}

interface newUser {
    userName?: string;
    idUser?: number;
    phone?: string;
    personaje?: string;
}




