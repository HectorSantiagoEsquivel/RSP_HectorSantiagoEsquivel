
const COLUMNAS = ["id", "modelo", "anoFab", "velMax", "altMax", "autonomia", "cantPue", "cantRue", "modificar", "eliminar"];

const $ = (elemento) => {
    return document.getElementById(elemento);
}

const ENDPOINT = 'http://localhost/vehiculoAereoTerrestre.php';

const tabla = $('contenedor-tabla');
const formulario = $('abm-form');
const loader = $('loader');
formulario.style.display = 'none';
const contentCover = $('content-cover');
let listaVehiculos;


const contenedorCheckboxes = $('checkbox-columnas');
COLUMNAS.map(columna => {
    const nombre = document.createElement('label');
    const checkbox = document.createElement('input');
    nombre.textContent = columna;
    nombre.style.marginLeft = '10px';
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('checked', 'true');
    checkbox.setAttribute('id', `checkbox-${columna}`);

    if (columna !== 'modificar' && columna !== 'eliminar') {
        contenedorCheckboxes.appendChild(nombre);
        contenedorCheckboxes.appendChild(checkbox);
    }
});

const cambiarVisibilidadColumnas = () => {
    COLUMNAS.map(columna => {
        const filas = document.querySelectorAll(`#celda-${columna}`);
        const cabeceraColumna = $(`cabecera-${columna}`);
        const checkboxes = document.querySelectorAll(`#checkbox-${columna}`);
        checkboxes.forEach(checkbox => {
            checkbox.onclick = () => {
                const visibilidad = checkbox?.checked ? 'table-cell' : 'none';
                filas?.forEach(col => {
                    col.style.display = visibilidad;
                });
                cabeceraColumna.style.display = visibilidad;
            }
        })
    });
}


const generarStatusPorDefecto = (prop) => {
    const checkbox = document.querySelector(`#checkbox-${prop}`);
    const columna = document.querySelector(`#cabecera-${prop}`);
    if (checkbox && columna) {
        checkbox.checked = true;
        columna.style.display = 'table-cell';
    }
}

//helper
const generarFilas = (lista) => {
    const filasAnteriores = tabla.querySelectorAll('tr');
    const filasTabla = $('filas-tabla');

    for (let i = 1; i < filasAnteriores.length; i++) {
        filasTabla.removeChild(filasAnteriores[i]);
    }

    lista.map((item, index) => {
        const fila = document.createElement("tr");
        fila.setAttribute("id-fila", index);
        fila.setAttribute("class", "fila-generada")

        COLUMNAS.map(columna => {
            const celda = document.createElement("td");
            celda.setAttribute('id', `celda-${columna}`);

            generarStatusPorDefecto(columna);

            if (columna !== 'modificar' && columna !== 'eliminar') {
                
                celda.textContent = item[columna] !== undefined && item[columna] !== null && item[columna] !== '' ? item[columna] : 'N/A';
                fila.appendChild(celda);
            } else {
                const celdaBotones = document.createElement("td");
                const boton = document.createElement('button');
                boton.textContent = columna;

                boton.onclick = (e) => {
                    const fila = e.target.closest('tr');
                    const idFila = fila?.getAttribute('id-fila');

                    if (fila && idFila) {
                        const datosCelda = fila?.querySelectorAll('td');

                        if (columna === 'eliminar') {

                            const idVehiculo = parseInt(datosCelda[0].textContent);

                            manejarLoader();
                            fetch(ENDPOINT, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ id: idVehiculo })
                            })
                                .then(response => {
                                    manejarLoader('none');

                                    if (response.ok) {
                                        return response;
                                    } else {
                                        abrirTabla();
                                        throw new Error('No se pudo realizar la operación');
                                    }
                                })
                                .then(() => {
                                    listaVehiculos = listaVehiculos.filter(vehiculo => vehiculo.id !== parseInt(idVehiculo));
                                    generarFilas(listaVehiculos);
                                    abrirTabla();
                                })
                                .catch(error => {
                                    abrirTabla();
                                    manejarLoader('none');
                                    console.log(error);
                                    alert("Ocurrio un error: ", error + 'dada')
                                });

                        } else {
                            let datos = {};
                            datosCelda.forEach((_, index) => {
                                const columna = COLUMNAS[index];
                                const valor = datosCelda[index].textContent;
                                datos[columna] = valor;
                            });

                            $('id-input').value = datos.id || '';
                            $('modelo-input').value = datos.modelo || '';
                            $('anoFab-input').value = datos.anoFab || '';
                            $('velMax-input').value = datos.velMax || '';

                            $('altMax-input').value = datos.altMax || '';
                            $('autonomia-input').value = datos.autonomia || '';
                            

                            $('cantPue-input').value = datos.cantPue || '';
                            $('cantRue-input').value = datos.cantRue || '';

                            $('tipo-input').value = datos?.autonomia !== 'N/A' ? '1' : '2';

                            abrirFormulario(true, datos?.autonomia);
                        }
                    }
                };

                celdaBotones.appendChild(boton);
                fila.appendChild(celdaBotones);
            }
        });
        filasTabla.appendChild(fila);
    });

    cambiarVisibilidadColumnas();
}


const convertirObjetoATipoVehiculo = (datos) => {
    return datos.map(vehiculo => {
        const esAereo = vehiculo?.autonomia;
        const { id, modelo, anoFab, velMax } = vehiculo;
        if (esAereo) {
            const { altMax, autonomia } = vehiculo;
            return new Aereo(id, modelo, anoFab, velMax, altMax, autonomia);
        } else {
            const { cantPue, cantRue} = vehiculo;
            return new Terrestre(id, modelo, anoFab, velMax, cantPue, cantRue);
        }
    });
}

const manejarLoader = (estado = 'block') => {
    loader.style.display = estado;
    contentCover.style.display = estado;
}

/*const cargarDatosDesdeAPI = () => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', ENDPOINT);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            manejarLoader('none');
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                listaVehiculos = convertirObjetoATipoVehiculo(response);
                generarFilas(listaVehiculos);
            } else {
                alert("ERROR");
            }
        }
    };

    manejarLoader();
    xhr.send();
}*/


const generarJerarquiaDesdePhp = () => {
    manejarLoader(); 

    fetch(ENDPOINT)
        .then(response => {
            manejarLoader('none'); 
            if (response.ok) {
                return response.text(); // Obtener la cadena de texto del cuerpo de la respuesta
            } else {
                throw new Error('No se pudo obtener la cadena de PHP');
            }
        })
        .then(data => {
            // Procesar la cadena PHP para construir la jerarquía de clases
            const objetos = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, "")); // Eliminar saltos de línea

            listaVehiculos = objetos.map(obj => {
                if (obj.autonomia !== undefined) {
                    return new Aereo(obj.id, obj.modelo, obj.anoFab, obj.velMax, obj.altMax, obj.autonomia);
                } else {
                    return new Terrestre(obj.id, obj.modelo, obj.anoFab, obj.velMax, obj.cantPue, obj.cantRue);
                }
            });


            generarFilas(listaVehiculos);
        })
        .catch(error => {
            manejarLoader('none'); 
            console.error('Error:', error);
        });
};

generarJerarquiaDesdePhp();


//cargarDatosDesdeAPI();

const abrirFormulario = (estaEditando, tipoAereo) => {
    seleccionarTipoVehiculo(estaEditando, tipoAereo);
    formulario.style.display = 'flex';
    tabla.style.display = 'none';
    $('tipo-input').style.display = estaEditando ? 'none' : 'block';
}

const seleccionarTipoVehiculo = (estaEditando, tipoAereo) => {
    const esAereo = $('tipo-input').value == '1';

    if ((esAereo && !estaEditando || (estaEditando && tipoAereo != 'N/A'))) {
        $('altMax-input').style.display = 'block';
        $('autonomia-input').style.display = 'block';
        
        $('cantPue-input').style.display = 'none';
        $('cantRue-input').style.display = 'none';
        
    } else {
        $('altMax-input').style.display = 'none';
        $('autonomia-input').style.display = 'none';
        
        $('cantPue-input').style.display = 'block';
        $('cantRue-input').style.display = 'block';
        
    }
}


const abrirTabla = () => {
    formulario.style.display = 'none';
    tabla.style.display = 'block';
    $('id-input').value = '';
    $('modelo-input').value = '';
    $('anoFab-input').value = '';
    $('velMax-input').value = '';
    $('altMax-input').value = '';
    $('autonomia-input').value = '';
    $('cantPue-input').value = '';
    $('cantRue-input').value = '';
}


const generarIdVehiculo = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', ENDPOINT);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                const nuevoID = data.id;
                $('id-input').value = nuevoID;
            } else {
                alert('No se pudo obtener el nuevo ID del vehículo');
            }
        }
    };
    xhr.send();
};

const bloquearCampos = (estaEditando, tipoAereo) => {
    $('id-input').readOnly = true;

    const esAereo = $('tipo-input').value === '1';
    if ((esAereo && !estaEditando) || (estaEditando && tipoAereo !== 'N/A')) {
        $('altMax-input').style.display = 'block';
        $('autonomia-input').style.display = 'block';
        $('cantPue-input').style.display = 'none';
        $('cantRue-input').style.display = 'none';
    } else {
        $('altMax-input').style.display = 'none';
        $('autonomia-input').style.display = 'none';
        $('cantPue-input').style.display = 'block';
        $('cantRue-input').style.display = 'block';
    }
};

const mostrarFormularioAlta = (estaEditando, tipoAereo) => {
    bloquearCampos(estaEditando, tipoAereo);
    $('abm-form').style.display = 'flex';
    $('contenedor-tabla').style.display = 'none';
};

const ocultarFormularioAlta = () => {
    $('abm-form').style.display = 'none';
    $('contenedor-tabla').style.display = 'block';
};

const aceptarAccion = () => {
    const idVehiculo = $('id-input').value;
    const modelo = $('modelo-input').value.trim();
    const anoFab = $('anoFab-input').value.trim();
    const velMax = parseInt($('velMax-input').value);
    const altMax = $('altMax-input').value;
    const autonomia = $('autonomia-input').value;
    const cantPue = $('cantPue-input').value;
    const cantRue = $('cantRue-input').value;

    const esAereo = $('tipo-input').value === '1';
    const idVehiculoGenerado = idVehiculo ? parseInt(idVehiculo) : 0;
    let nuevoVehiculo;

    if (esAereo) {
        nuevoVehiculo = new Aereo(
            idVehiculoGenerado,
            modelo,
            anoFab,
            velMax,
            altMax,
            autonomia
        );
    } else {
        nuevoVehiculo = new Terrestre(
            idVehiculoGenerado,
            modelo,
            anoFab,
            velMax,
            cantPue,
            cantRue
        );
    }

    if (
        modelo.length > 0 &&
        anoFab > 1885 &&
        velMax > 0 &&
        ((nuevoVehiculo instanceof Aereo && altMax > 0 && autonomia > 0) ||
            (nuevoVehiculo instanceof Terrestre && cantPue > -1 && cantRue > 0))
    ) {
        manejarLoader();

        if (!idVehiculoGenerado) {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', ENDPOINT);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    manejarLoader('none');
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        const nuevoID = data.id;
                        nuevoVehiculo = {
                            ...nuevoVehiculo,
                            id: nuevoID
                        };
                        listaVehiculos = [...listaVehiculos, nuevoVehiculo];
                        generarFilas(listaVehiculos);
                        ocultarFormularioAlta();
                    } else {
                        ocultarFormularioAlta();
                        alert('No se pudo realizar la operación');
                    }
                }
            };
            xhr.send(JSON.stringify(nuevoVehiculo));
        }
    } else {
        alert('Uno de los valores no es válido');
    }
};

const mostrarFormularioModificacion = (datos) => {
    $('id-input').value = datos.id || '';
    $('modelo-input').value = datos.modelo || '';
    $('anoFab-input').value = datos.anoFab || '';
    $('velMax-input').value = datos.velMax || '';
    $('altMax-input').value = datos.altMax || '';
    $('autonomia-input').value = datos.autonomia || '';
    $('cantPue-input').value = datos.cantPue || '';
    $('cantRue-input').value = datos.cantRue || '';

    // Determinar tipo de vehículo y mostrar los campos correspondientes
    $('tipo-input').value = datos?.autonomia !== 'N/A' ? '1' : '2';
    seleccionarTipoVehiculo(true, datos?.autonomia);

    $('abm-form').style.display = 'flex';
    $('contenedor-tabla').style.display = 'none';
};

const modificarVehiculo = (nuevoVehiculo, idVehiculoGenerado) => {
    return fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoVehiculo)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo realizar la operación');
            }
            return response.json();
        })
        .then(data => {
            const vehiculoActualizado = {
                ...nuevoVehiculo,
                id: data.id
            };
            listaVehiculos = listaVehiculos.map(vehiculo => {
                if (vehiculo.id === idVehiculoGenerado) {
                    return vehiculoActualizado;
                }
                return vehiculo;
            });
            generarFilas(listaVehiculos);
            manejarLoader('none');
            return vehiculoActualizado;
        })
        .catch(error => {
            manejarLoader('none');
            throw new Error(error);
        });
};

const aceptarModificacion = () => {
    const idVehiculo = $('id-input').value;
    const modelo = $('modelo-input').value.trim();
    const anoFab = $('anoFab-input').value.trim();
    const velMax = parseInt($('velMax-input').value);
    const altMax = $('altMax-input').value;
    const autonomia = $('autonomia-input').value;
    const cantPue = $('cantPue-input').value;
    const cantRue = $('cantRue-input').value;

    const esAereo = $('tipo-input').value === '1';
    const idVehiculoGenerado = parseInt(idVehiculo) || 0;
    let nuevoVehiculo;

    if (esAereo) {
        nuevoVehiculo = new Aereo(
            idVehiculoGenerado,
            modelo,
            anoFab,
            velMax,
            altMax,
            autonomia
        );
    } else {
        nuevoVehiculo = new Terrestre(
            idVehiculoGenerado,
            modelo,
            anoFab,
            velMax,
            cantPue,
            cantRue
        );
    }

    if (
        modelo.length > 0 &&
        anoFab > 1885 &&
        velMax > 0 &&
        ((nuevoVehiculo instanceof Aereo && altMax > 0 && autonomia > 0) ||
            (nuevoVehiculo instanceof Terrestre && cantPue > -1 && cantRue > 0))
    ) {
        manejarLoader();

        modificarVehiculo(nuevoVehiculo, idVehiculoGenerado)
            .then(() => {
                ocultarFormularioAlta();
            })
            .catch(error => {
                manejarLoader('none');
                alert('No se pudo realizar la operación');
            });
    } else {
        alert('Uno de los valores no es válido');
    }
};
