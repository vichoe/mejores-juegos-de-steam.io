let miGrafico;
let datosJuegos = [];

async function cargarDatos() {
    try {
        const respuesta = await fetch('datos/datos_radar.json');
        datosJuegos = await respuesta.json();
        inicializarGrafico();
        // configurarBoton(); 
        configurarBuscador(); 
        configurarAutocompletado();
        generarRanking();
        console.log("¡Datos cargados y listos para Cara a Cara!");
    } catch (e) {
        console.error("No se pudo cargar el JSON:", e);
    }
}

function inicializarGrafico() {
    const ctx = document.getElementById('graficoRadar').getContext('2d');
    miGrafico = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Precio', 'Horas Jugadas (2 semanas)', 'Reseñas Positivas', 'Reseñas Negativas', 'Dueños Aproximados'],
            datasets: [
                {
                    label: 'Juego 1',
                    data: [0, 0, 0, 0, 0],
                    valoresReales: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(245, 197, 24, 0.15)',
                    borderColor: '#f5c518',
                    pointBackgroundColor: '#f5c518',
                    pointBorderColor: '#f5c518',
                    pointRadius: 6,
                    borderWidth: 2
                },
                {
                    label: 'Juego 2',
                    data: [0, 0, 0, 0, 0],
                    valoresReales: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 210, 200, 0.15)',
                    borderColor: '#00d2c8',
                    pointBackgroundColor: '#00d2c8',
                    pointBorderColor: '#00d2c8',
                    pointRadius: 6,
                    borderWidth: 2
                }
            ]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: 'rgba(255,255,255,0.5)',
                        backdropColor: 'transparent',
                        font: { size: 10 },
                        stepSize: 20
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.12)'
                    },
                    angleLines: {
                        color: 'rgba(255,255,255,0.2)'
                    },
                    pointLabels: {
                        color: '#d4c8f0',
                        font: { size: 13, weight: '600' }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e8e0f5',
                        font: { size: 13 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const valorReal = context.dataset.valoresReales[index];
                            
                            if (index === 0) return ` $${valorReal}`; 
                            if (index === 1) return ` ${valorReal.toLocaleString()} horas`;
                            if (index === 4) return ` ${valorReal.toLocaleString()} dueños`;
                            
                            return ` ${valorReal.toLocaleString()}`; 
                        }
                    }
                }
            }
        }
    });
}

function obtenerJuego(nombre) {
    if (!nombre) return null;
    let juego = datosJuegos.find(j => 
        typeof j.Name === 'string' && j.Name.toLowerCase() === nombre.toLowerCase()
    );
    if (!juego) {
        juego = datosJuegos.find(j => 
            typeof j.Name === 'string' && j.Name.toLowerCase().includes(nombre.toLowerCase())
        );
    }
    return juego;
}

function actualizarComparacion() {
    const nom1 = document.getElementById('juego1').value.trim();
    const nom2 = document.getElementById('juego2').value.trim();

    const juego1 = obtenerJuego(nom1);
    const juego2 = obtenerJuego(nom2);

    const v1 = juego1 ? [
        juego1.Price || 0,
        juego1["Average playtime two weeks"] || 0, 
        juego1.Positive || 0,
        juego1.Negative || 0,
        juego1["Estimated owners"] || 0 
    ] : [0, 0, 0, 0, 0];

    const v2 = juego2 ? [
        juego2.Price || 0,
        juego2["Average playtime two weeks"] || 0, 
        juego2.Positive || 0,
        juego2.Negative || 0,
        juego2["Estimated owners"] || 0 
    ] : [0, 0, 0, 0, 0];

    const maxPrice = Math.max(v1[0], v2[0], 1); 
    const maxPlaytime = Math.max(v1[1], v2[1], 1);
    const maxReviews = Math.max(v1[2], v1[3], v2[2], v2[3], 1); 
    const maxOwners = Math.max(v1[4], v2[4], 1);

    const dibujo1 = [
        (v1[0] / maxPrice) * 100,
        (v1[1] / maxPlaytime) * 100,
        (v1[2] / maxReviews) * 100,
        (v1[3] / maxReviews) * 100,
        (v1[4] / maxOwners) * 100
    ];

    const dibujo2 = [
        (v2[0] / maxPrice) * 100,
        (v2[1] / maxPlaytime) * 100,
        (v2[2] / maxReviews) * 100,
        (v2[3] / maxReviews) * 100,
        (v2[4] / maxOwners) * 100
    ];

    miGrafico.data.datasets[0].data = dibujo1;
    miGrafico.data.datasets[0].valoresReales = v1;
    miGrafico.data.datasets[0].label = juego1 ? juego1.Name : 'Juego 1';

    miGrafico.data.datasets[1].data = dibujo2;
    miGrafico.data.datasets[1].valoresReales = v2;
    miGrafico.data.datasets[1].label = juego2 ? juego2.Name : 'Juego 2';

    miGrafico.update();
}

function configurarBuscador() {
    document.getElementById('juego1').addEventListener('input', actualizarComparacion);
    document.getElementById('juego2').addEventListener('input', actualizarComparacion);
}

//function configurarBoton() {
//    document.getElementById('btnComparar').addEventListener('click', actualizarComparacion);
//}

function crearDropdown(idInput, idLista) {
    const input = document.getElementById(idInput);
    const lista = document.getElementById(idLista);

    input.addEventListener('input', function() {
        const textoBuscado = this.value.toLowerCase().trim();
        lista.innerHTML = ''; 

        if (textoBuscado === '') {
            lista.style.display = 'none';
            return;
        }

        const sugerencias = datosJuegos.filter(juego => 
            typeof juego.Name === 'string' && juego.Name.toLowerCase().includes(textoBuscado)
        ).slice(0, 10);

        if (sugerencias.length > 0) {
            lista.style.display = 'block';
            
            sugerencias.forEach(juego => {
                const itemLi = document.createElement('li');
                itemLi.textContent = juego.Name;
                
                itemLi.addEventListener('click', () => {
                    input.value = juego.Name; 
                    lista.style.display = 'none'; 
                    actualizarComparacion(); 
                });

                lista.appendChild(itemLi);
            });
        } else {
            lista.style.display = 'none';
        }
    });

    document.addEventListener('click', function(evento) {
        if (evento.target !== input && evento.target !== lista) {
            lista.style.display = 'none';
        }
    });
}

function configurarAutocompletado() {
    crearDropdown('juego1', 'listaJuego1');
    crearDropdown('juego2', 'listaJuego2');
}


function mostrarSeccion(idSeccion, boton) {
    const paginas = document.querySelectorAll('.pagina');

    paginas.forEach(pagina => {
        pagina.classList.remove('activa');
    });

    const seccion = document.getElementById(idSeccion);
    if (seccion) {
        seccion.classList.add('activa');
    }

    const botones = document.querySelectorAll('.nav-btn');
    botones.forEach(btn => {
        btn.classList.remove('activo');
    });

    if (boton && boton.classList.contains('nav-btn')) {
        boton.classList.add('activo');
    }
}

// FUNCIÓN DEL RANKING
function generarRanking() {
    const cuerpoTabla = document.getElementById('cuerpo-ranking');
    if (!cuerpoTabla) return;

    const rankingProcesado = datosJuegos.map(juego => {
        let ratingNum = juego.rating || 0;

        const dueños = juego["Estimated owners"] || 1; 
        
        // FÓRMULA: Rating * log10(Dueños)
        const puntaje = (ratingNum * Math.log10(Math.max(dueños, 1))).toFixed(2);

        return {
            name: juego.Name,
            rating: ratingNum,
            owners: dueños,
            score: parseFloat(puntaje)
        };
    });

    // Ordenamos de mayor a menor puntaje y tomamos los mejores 20
    rankingProcesado.sort((a, b) => b.score - a.score);
    const top20 = rankingProcesado.slice(0, 20);

    // Limpiamos la tabla y generamos el HTML
    cuerpoTabla.innerHTML = '';
    top20.forEach((juego, indice) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td class="nombre-juego">${juego.name}</td>
            <td>${juego.rating}%</td>
            <td>${juego.owners.toLocaleString()}</td>
            <td class="puntaje-resaltado">${juego.score}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

cargarDatos();