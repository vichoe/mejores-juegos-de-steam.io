let miGrafico;
let datosJuegos = [];

async function cargarDatos() {

        const respuesta = await fetch('datos/datos_radar.json');
        datosJuegos = await respuesta.json();
        inicializarGrafico();
        configurarBuscador(); 
        configurarAutocompletado();
        generarRanking();
        generarGraficosExtras();
                document.getElementById('btnAzar').addEventListener('click', compararAlAzar);

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
    if (juego1) {
        reproducirSonido(juego1.Positive || 0, juego1.Negative || 0);
    }
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

// FUNCIÓN PARA GENERAR LOS GRÁFICOS DE LA PESTAÑA "GRÁFICOS"
function generarGraficosExtras() {
    const opcionesComunes = {
        indexAxis: 'y', // Hace que las barras sean horizontales
        responsive: true,
        plugins: {
            legend: { display: false } 
        },
        scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { ticks: { color: 'rgba(255,255,255,0.9)' }, grid: { display: false } }
        }
    };

    // GRÁFICO 1: Reseñas Positivas 
    const topResenas = [...datosJuegos].sort((a, b) => (b.Positive || 0) - (a.Positive || 0)).slice(0, 10);
    
    new Chart(document.getElementById('graficoResenas').getContext('2d'), {
        type: 'bar',
        data: {
            labels: topResenas.map(j => j.Name),
            datasets: [{
                label: 'Reseñas Positivas',
                data: topResenas.map(j => j.Positive),
                backgroundColor: 'rgba(0, 210, 200, 0.6)', 
                borderColor: '#00d2c8',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: opcionesComunes
    });

    // GRÁFICO 2: Juegos con más dueños 
    const topDuenos = [...datosJuegos].sort((a, b) => (b["Estimated owners"] || 0) - (a["Estimated owners"] || 0)).slice(0, 10);
    
    new Chart(document.getElementById('graficoDuenos').getContext('2d'), {
        type: 'bar',
        data: {
            labels: topDuenos.map(j => j.Name),
            datasets: [{
                label: 'Dueños Estimados',
                data: topDuenos.map(j => j["Estimated owners"]),
                backgroundColor: 'rgba(245, 197, 24, 0.6)', 
                borderColor: '#f5c518',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: opcionesComunes
    });

    // GRÁFICO 3: Horas Jugadas 
    const topHoras = [...datosJuegos].sort((a, b) => (b["Average playtime two weeks"] || 0) - (a["Average playtime two weeks"] || 0)).slice(0, 10);
    
    new Chart(document.getElementById('graficoHoras').getContext('2d'), {
        type: 'bar',
        data: {
            labels: topHoras.map(j => j.Name),
            datasets: [{
                label: 'Horas Promedio',
                data: topHoras.map(j => j["Average playtime two weeks"]),
                backgroundColor: 'rgba(155, 89, 182, 0.6)', 
                borderColor: '#9b59b6',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: opcionesComunes
    });
}

// Variables globales para guardar los gráficos y poder actualizarlos al hacer clic
let graficosInstancias = {};
let topDatos = {};

function generarGraficosExtras() {
    // 1. Guardamos los datos ordenados en memoria
    topDatos.resenas = [...datosJuegos].sort((a, b) => (b.Positive || 0) - (a.Positive || 0));
    topDatos.duenos = [...datosJuegos].sort((a, b) => (b["Estimated owners"] || 0) - (a["Estimated owners"] || 0));
    topDatos.horas = [...datosJuegos].sort((a, b) => (b["Average playtime two weeks"] || 0) - (a["Average playtime two weeks"] || 0));

    // Configuración base de Chart.js
    const opcionesComunes = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    footer: () => 'Clicp ara ver 20 juegos'
                }
            }
        },
        scales: {
            x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: {
                ticks: {
                    color: 'rgba(255,255,255,0.9)',
                    autoSkip: false 
                },
                grid: { display: false }
            }
        }
    };

    // Función maestra para crear o actualizar un gráfico interactivo
    function dibujarGraficoFiltro(id, tipo, colorBase, borde, label) {
        const canvas = document.getElementById(id);
        const tarjeta = canvas.parentElement; 
        
        const cantidad = canvas.dataset.cantidad ? parseInt(canvas.dataset.cantidad) : 10;
        const datosSlice = topDatos[tipo].slice(0, cantidad);

        // Ajustamos la altura visual de la tarjeta
        tarjeta.style.height = cantidad === 10 ? '350px' : '650px';
        tarjeta.style.transition = 'height 0.4s ease'; 
        canvas.style.cursor = 'pointer'; 

        if (graficosInstancias[id]) {
            graficosInstancias[id].data.labels = datosSlice.map(j => j.Name);
            graficosInstancias[id].data.datasets[0].data = datosSlice.map(j => 
                tipo === 'resenas' ? j.Positive : 
                (tipo === 'duenos' ? j["Estimated owners"] : j["Average playtime two weeks"])
            );
            graficosInstancias[id].update();
        } else {
            canvas.dataset.cantidad = 10;
            graficosInstancias[id] = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: datosSlice.map(j => j.Name),
                    datasets: [{
                        label: label,
                        data: datosSlice.map(j => 
                            tipo === 'resenas' ? j.Positive : 
                            (tipo === 'duenos' ? j["Estimated owners"] : j["Average playtime two weeks"])
                        ),
                        backgroundColor: colorBase,
                        borderColor: borde,
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: opcionesComunes
            });

            canvas.addEventListener('click', () => {
                const cantActual = parseInt(canvas.dataset.cantidad);
                canvas.dataset.cantidad = cantActual === 10 ? 20 : 10;
                dibujarGraficoFiltro(id, tipo, colorBase, borde, label); 
            });
        }
    }

    // 3. Inicializamos los 3 gráficos
    dibujarGraficoFiltro('graficoResenas', 'resenas', 'rgba(0, 210, 200, 0.6)', '#00d2c8', 'Reseñas Positivas');
    dibujarGraficoFiltro('graficoDuenos', 'duenos', 'rgba(245, 197, 24, 0.6)', '#f5c518', 'Dueños Estimados');
    dibujarGraficoFiltro('graficoHoras', 'horas', 'rgba(155, 89, 182, 0.6)', '#9b59b6', 'Horas Promedio');

    // GRÁFICO 4: SCATTER COMPARATIVO (GRANDE) 
    
    // filtramos solo juegos que tengan "hartos jugadores" 
    const juegosMasivos = datosJuegos.filter(j => (j["Estimated owners"] || 0) >= 500000);

    // Grupo A: Baratos (<= 15 dólares) y Bien valorados (>= 80%)
    const joyasBaratas = juegosMasivos
        .filter(j => j.Price <= 15 && j.rating >= 80)
        .map(j => ({ x: j.Price, y: j.rating, name: j.Name, owners: j["Estimated owners"] }));

    // Grupo B: Mal valorados (< 60%), sin importar el precio
    const decepciones = juegosMasivos
        .filter(j => j.rating < 60)
        .map(j => ({ x: j.Price, y: j.rating, name: j.Name, owners: j["Estimated owners"] }));

    new Chart(document.getElementById('graficoComparacion').getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Joyas Baratas y Buenas',
                    data: joyasBaratas,
                    backgroundColor: 'rgba(0, 210, 200, 0.7)', 
                    borderColor: '#00d2c8',
                    pointRadius: 6, 
                    pointHoverRadius: 9
                },
                {
                    label: 'Decepciones Populares',
                    data: decepciones,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)', 
                    borderColor: '#ff6384',
                    pointRadius: 6,
                    pointHoverRadius: 9
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    labels: { color: '#e8e0f5', font: { size: 14 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const p = context.raw;
                            return `${p.name} | $${p.x} | Rating: ${p.y}% | Dueños: ${(p.owners / 1000000).toFixed(1)}M`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Precio (USD)', color: '#f5c518', font: { size: 14 } },
                    ticks: { color: 'rgba(255,255,255,0.7)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    title: { display: true, text: 'Rating de Calidad (%)', color: '#f5c518', font: { size: 14 } },
                    ticks: { color: 'rgba(255,255,255,0.7)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function compararAlAzar() {
    if (datosJuegos.length < 2) return;

    let indice1 = Math.floor(Math.random() * datosJuegos.length);
    let indice2 = Math.floor(Math.random() * datosJuegos.length);

    while (indice1 === indice2) {
        indice2 = Math.floor(Math.random() * datosJuegos.length);
    }

    const juegoAzar1 = datosJuegos[indice1];
    const juegoAzar2 = datosJuegos[indice2];

    document.getElementById('juego1').value = juegoAzar1.Name;
    document.getElementById('juego2').value = juegoAzar2.Name;

    actualizarComparacion();
}

function reproducirSonido(positivas, negativas) {
    let audio;
    if (positivas > negativas) {
        audio = new Audio('sonidos/bueno.mp3');
    } else {
        audio = new Audio('sonidos/malo.mp3');
    }

    audio.volume = 0.3; 
    audio.play();
}


cargarDatos();