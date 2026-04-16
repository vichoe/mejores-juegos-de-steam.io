let miGrafico;
let datosJuegos = [];

async function cargarDatos() {
    try {
        const respuesta = await fetch('datos_radar.json');
        datosJuegos = await respuesta.json();
        inicializarGrafico();
        configurarBoton(); 
        configurarBuscador(); 
        configurarAutocompletado();
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
            labels: ['Precio', 'Tiempo Jugado', 'Positivas', 'Negativas', 'Dueños'],
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
        juego1["Average playtime forever"] || 0,
        juego1.Positive || 0,
        juego1.Negative || 0,
        juego1.Owners_Numeric || 0
    ] : [0, 0, 0, 0, 0];

    const v2 = juego2 ? [
        juego2.Price || 0,
        juego2["Average playtime forever"] || 0,
        juego2.Positive || 0,
        juego2.Negative || 0,
        juego2.Owners_Numeric || 0
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

    // 5. Inyectamos los datos al gráfico
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

function configurarBoton() {
    document.getElementById('btnComparar').addEventListener('click', actualizarComparacion);
}

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

cargarDatos();

// Seleccionamos los elementos de la página
const botonToggle = document.getElementById('toggleMenu');
const sidebar = document.getElementById('miSidebar');
const body = document.body;

// Le decimos que escuche cada vez que hacemos click en el botón
botonToggle.addEventListener('click', function() {
    // La función toggle pone la clase si no está, y la quita si ya está
    sidebar.classList.toggle('cerrado');
    body.classList.toggle('expandido');
});

