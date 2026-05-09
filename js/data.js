// js/data.js

export const planetDataConfig = {
    mercury: {
        radius: 5.0,
        distance: 70,
        img: 'mercury',
        orbitSpeed: 4.15,
        rotSpeed: 0.004,
        descriptionTitle: 'MERCURIO',
        inclination: 0.12,
        startAngle: 0.4
    },
    venus: {
        radius: 9.0,
        distance: 100,
        img: 'venus',
        orbitSpeed: 1.62,
        rotSpeed: 0.001,
        descriptionTitle: 'VENUS',
        inclination: -0.06,
        startAngle: 2.1
    },
    earth: {
        radius: 9.5,
        distance: 140,
        img: 'earth',
        orbitSpeed: 1.0,
        rotSpeed: 0.012,
        descriptionTitle: 'TIERRA',
        inclination: 0.0,
        startAngle: 4.7
    },
    mars: {
        radius: 7.0,
        distance: 180,
        img: 'mars',
        orbitSpeed: 0.53,
        rotSpeed: 0.011,
        descriptionTitle: 'MARTE',
        inclination: 0.10,
        startAngle: 1.2
    },
    jupiter: {
        radius: 24.0,
        distance: 260,
        img: 'jupiter',
        orbitSpeed: 0.084,
        rotSpeed: 0.025,
        descriptionTitle: 'JÚPITER',
        inclination: -0.04,
        startAngle: 5.5
    },
    saturn: {
        radius: 21.0,
        distance: 340,
        img: 'saturn',
        orbitSpeed: 0.034,
        rotSpeed: 0.022,
        descriptionTitle: 'SATURNO',
        hasRings: true,
        inclination: 0.08,
        startAngle: 3.3
    },
    uranus: {
        radius: 14.0,
        distance: 410,
        img: 'uranus',
        orbitSpeed: 0.012,
        rotSpeed: 0.014,
        descriptionTitle: 'URANO',
        inclination: -0.10,
        startAngle: 0.9
    },
    neptune: {
        radius: 13.5,
        distance: 470,
        img: 'neptune',
        orbitSpeed: 0.006,
        rotSpeed: 0.014,
        descriptionTitle: 'NEPTUNO',
        inclination: 0.05,
        startAngle: 5.9
    },
    pluto: {
        radius: 3.5,
        distance: 525,
        img: 'pluto',
        orbitSpeed: 0.004,
        rotSpeed: 0.003,
        descriptionTitle: 'PLUTÓN',
        inclination: 0.18,
        startAngle: 2.7
    }
};

// =========================================================
// ENCICLOPEDIA + ESTRUCTURA POR PLANETA
// =========================================================
export const planetEncyclopedia = {
    sun: {
        type: 'ESTRELLA',
        stats: {
            'DIÁMETRO ECUATORIAL': '1 392 700 km',
            'MASA': '1.989 × 10³⁰ kg',
            'PERIODO DE ROTACIÓN': '25.4 días (ecuador)',
            'EDAD': '4 600 millones de años',
            'GRAVEDAD EN SUPERFICIE': '274 m/s²',
            'TEMPERATURA EN SUPERFICIE': '5 500 °C',
            'TEMPERATURA EN EL NÚCLEO': '15 millones °C'
        },
        intro: 'El Sol es la estrella central del Sistema Solar. Concentra el 99.86% de toda la masa del sistema y es la fuente de toda la luz, calor y energía que reciben los planetas.',
        sections: [
            {
                title: 'COMPOSICIÓN',
                text: 'El Sol está compuesto principalmente por hidrógeno (74%) y helio (24%). En su núcleo se producen reacciones de fusión nuclear que convierten hidrógeno en helio liberando enormes cantidades de energía.'
            },
            {
                title: 'CICLO SOLAR',
                text: 'La actividad solar varía en ciclos de aproximadamente 11 años durante los cuales aumentan o disminuyen las manchas solares, las erupciones y las eyecciones de masa coronal.'
            }
        ],
        structure: {
            intro: 'El Sol es una esfera de plasma estructurada en capas. La energía generada por fusión nuclear en el núcleo viaja por radiación y convección hasta la superficie visible.',
            sections: [
                {
                    title: 'NÚCLEO',
                    text: 'Región central donde la fusión nuclear convierte hidrógeno en helio a 15 millones de grados.'
                },
                {
                    title: 'ZONA RADIATIVA',
                    text: 'La energía viaja por radiación a través de plasma denso. Un fotón puede tardar miles de años en atravesarla.'
                },
                {
                    title: 'ZONA CONVECTIVA',
                    text: 'Movimientos convectivos de plasma transportan la energía hasta la superficie.'
                },
                {
                    title: 'FOTOSFERA',
                    text: 'La "superficie" visible del Sol, donde se forman las manchas solares.'
                }
            ],
            layers: [
                { name: 'FOTOSFERA',       detail: 'PLASMA VISIBLE',          color: '#ffd060', size: 8 },
                { name: 'ZONA CONVECTIVA', detail: 'PLASMA EN CONVECCIÓN',    color: '#ffae3b', size: 25 },
                { name: 'ZONA RADIATIVA',  detail: 'PLASMA DENSO RADIATIVO',  color: '#ff7a1a', size: 42 },
                { name: 'NÚCLEO',          detail: 'FUSIÓN NUCLEAR DE HIDRÓGENO', color: '#fff5b0', size: 25 }
            ]
        }
    },
    mercury: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '4 879 km',
            'MASA': '3.30 × 10²³ kg',
            'DISTANCIA MEDIA AL SOL': '57.9 M km',
            'PERIODO DE ROTACIÓN': '58d 15h',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '88 días',
            'GRAVEDAD EN SUPERFICIE': '3.7 m/s²',
            'TEMPERATURA EN SUPERFICIE': '-173 a 427 °C'
        },
        intro: 'Mercurio es el planeta más pequeño del Sistema Solar y el más cercano al Sol. Carece de atmósfera apreciable, por lo que su superficie sufre variaciones extremas de temperatura.',
        sections: [
            {
                title: 'SUPERFICIE',
                text: 'Su superficie está cubierta de cráteres de impacto similares a los de la Luna. La cuenca Caloris, de unos 1 550 km de diámetro, es una de las estructuras de impacto más grandes del Sistema Solar.'
            },
            {
                title: 'ATMÓSFERA',
                text: 'Mercurio posee una exósfera muy tenue compuesta por átomos arrancados de su superficie por el viento solar (oxígeno, sodio, hidrógeno, helio y potasio).'
            }
        ],
        structure: {
            intro: 'Mercurio es el segundo planeta más denso del Sistema Solar después de la Tierra. Posee un núcleo metálico desproporcionadamente grande que ocupa cerca del 60% de su volumen.',
            sections: [
                {
                    title: 'CORTEZA',
                    text: 'Capa exterior delgada compuesta principalmente de silicatos. Su espesor se estima entre 100 y 300 km.'
                },
                {
                    title: 'MANTO',
                    text: 'Capa de silicatos sólidos que rodea al núcleo. Es relativamente fina comparada con otros planetas terrestres.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo metálico enorme de hierro y níquel, parcialmente fundido. Genera el débil campo magnético del planeta.'
                }
            ],
            // Capas para el diagrama (fuera a dentro), color y porcentaje radial
            layers: [
                { name: 'CORTEZA',  detail: 'SILICATOS SÓLIDOS',                    color: '#9c8470', size: 12 },
                { name: 'MANTO',    detail: 'SILICATOS SÓLIDOS',                    color: '#7a5f4b', size: 28 },
                { name: 'NÚCLEO',   detail: 'HIERRO Y NÍQUEL (PARCIALMENTE FUNDIDO)', color: '#d97a3c', size: 60 }
            ]
        }
    },
    venus: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '12 104 km',
            'MASA': '4.87 × 10²⁴ kg',
            'DISTANCIA MEDIA AL SOL': '108.2 M km',
            'PERIODO DE ROTACIÓN': '243 días (retrógrado)',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '225 días',
            'GRAVEDAD EN SUPERFICIE': '8.87 m/s²',
            'TEMPERATURA EN SUPERFICIE': '462 °C'
        },
        intro: 'Venus es el segundo planeta del Sistema Solar y el más caliente. Su densa atmósfera de dióxido de carbono provoca un efecto invernadero descontrolado.',
        sections: [
            {
                title: 'SUPERFICIE',
                text: 'La superficie de Venus está dominada por extensas llanuras volcánicas, montañas y miles de volcanes. Está oculta a la observación visual por una capa permanente de nubes.'
            },
            {
                title: 'ATMÓSFERA',
                text: 'Compuesta en un 96% por CO₂ con nubes de ácido sulfúrico. La presión en superficie es 92 veces la de la Tierra.'
            }
        ],
        structure: {
            intro: 'La estructura interna de Venus es similar a la de la Tierra, con corteza, manto y núcleo metálico, aunque con diferencias por la falta de tectónica de placas activa.',
            sections: [
                {
                    title: 'CORTEZA',
                    text: 'Corteza de silicatos relativamente joven (~500 millones de años) cubierta de basalto y formaciones volcánicas.'
                },
                {
                    title: 'MANTO',
                    text: 'Manto rocoso de silicatos con convección activa que alimenta el vulcanismo en la superficie.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo de hierro y níquel, probablemente parcialmente líquido. No genera un campo magnético significativo.'
                }
            ],
            layers: [
                { name: 'CORTEZA', detail: 'SILICATOS / BASALTO',  color: '#d4a36a', size: 10 },
                { name: 'MANTO',   detail: 'SILICATOS SÓLIDOS',     color: '#a87445', size: 45 },
                { name: 'NÚCLEO',  detail: 'HIERRO Y NÍQUEL',       color: '#e07b3a', size: 45 }
            ]
        }
    },
    earth: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '12 756 km',
            'MASA': '6 × 10²⁴ kg',
            'DISTANCIA MEDIA AL SOL': '150 M km',
            'PERIODO DE ROTACIÓN': '23h 56m',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '1 año',
            'GRAVEDAD EN SUPERFICIE': '9.8 m/s²',
            'TEMPERATURA EN SUPERFICIE': '15 °C'
        },
        intro: 'Nuestro planeta natal es el más denso de los ocho planetas del Sistema Solar. Es también el más grande de los cuatro planetas telúricos.',
        sections: [
            {
                title: 'SUPERFICIE',
                text: 'Alrededor del 70% de la superficie de la Tierra está cubierta por océanos de agua salada y el 30% restante corresponde a continentes e islas.'
            },
            {
                title: 'ATMÓSFERA',
                text: 'Compuesta principalmente por nitrógeno (78%) y oxígeno (21%). Protege la superficie de la radiación solar y permite la existencia de agua líquida.'
            }
        ],
        structure: {
            intro: 'La corteza terrestre, junto con las partes superiores del manto, componen la Litosfera. La Litosfera está dividida en una serie de placas tectónicas que "flotan" sobre una zona más elástica del manto superior. El movimiento de estas placas da lugar a numerosos terremotos y a procesos de vulcanismo.',
            sections: [
                {
                    title: 'MANTO',
                    text: 'El manto terrestre es un armazón de roca que comprende el 84% del volumen total del planeta. Las regiones más superiores del manto son las más sólidas y son relativamente rígidas.'
                },
                {
                    title: 'NÚCLEO EXTERNO',
                    text: 'Capa líquida de hierro y níquel cuya convección genera el campo magnético terrestre.'
                },
                {
                    title: 'NÚCLEO INTERNO',
                    text: 'Esfera sólida de hierro y níquel a temperaturas similares a la superficie del Sol, mantenida sólida por la enorme presión.'
                }
            ],
            layers: [
                { name: 'CORTEZA',        detail: 'SILICATOS EN ESTADO SÓLIDO EN SU MAYORÍA BASALTO', color: '#3a7bd5', size: 6 },
                { name: 'MANTO',          detail: 'SILICATOS SÓLIDOS',                                 color: '#c9803a', size: 40 },
                { name: 'NÚCLEO EXTERNO', detail: 'HIERRO LÍQUIDO Y NÍQUEL',                           color: '#e89a3d', size: 30 },
                { name: 'NÚCLEO INTERNO', detail: 'HIERRO DENSO EN ESTADO SÓLIDO Y NÍQUEL',            color: '#fbd45a', size: 24 }
            ]
        }
    },
    mars: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '6 792 km',
            'MASA': '6.42 × 10²³ kg',
            'DISTANCIA MEDIA AL SOL': '227.9 M km',
            'PERIODO DE ROTACIÓN': '24h 37m',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '687 días',
            'GRAVEDAD EN SUPERFICIE': '3.71 m/s²',
            'TEMPERATURA EN SUPERFICIE': '-63 °C (media)'
        },
        intro: 'Marte es el cuarto planeta del Sistema Solar y el segundo más pequeño después de Mercurio. Se le conoce como el "Planeta Rojo" por el óxido de hierro que cubre su superficie.',
        sections: [
            {
                title: 'SUPERFICIE',
                text: 'Marte alberga el Monte Olimpo, el volcán más alto conocido del Sistema Solar (~22 km), y los Valles Marineris, un sistema de cañones de más de 4 000 km de longitud.'
            },
            {
                title: 'ATMÓSFERA',
                text: 'Atmósfera muy delgada compuesta principalmente por CO₂ (95%). La presión es menos del 1% de la de la Tierra.'
            }
        ],
        structure: {
            intro: 'Marte tiene una estructura interna diferenciada: una corteza fina, un manto rocoso y un núcleo metálico relativamente grande, parcialmente fundido.',
            sections: [
                {
                    title: 'CORTEZA',
                    text: 'Corteza basáltica de espesor variable (10-50 km), más gruesa en el hemisferio sur.'
                },
                {
                    title: 'MANTO',
                    text: 'Manto rocoso rico en silicatos y hierro. Su actividad volcánica cesó hace cientos de millones de años.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo de hierro, níquel y azufre, parcialmente líquido. Es relativamente grande comparado con el tamaño del planeta.'
                }
            ],
            layers: [
                { name: 'CORTEZA', detail: 'BASALTO Y ÓXIDO DE HIERRO', color: '#c45d3a', size: 10 },
                { name: 'MANTO',   detail: 'SILICATOS SÓLIDOS',          color: '#8a3c20', size: 50 },
                { name: 'NÚCLEO',  detail: 'HIERRO, NÍQUEL Y AZUFRE',    color: '#e87a3c', size: 40 }
            ]
        }
    },
    jupiter: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '142 984 km',
            'MASA': '1.90 × 10²⁷ kg',
            'DISTANCIA MEDIA AL SOL': '778.6 M km',
            'PERIODO DE ROTACIÓN': '9h 56m',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '11.9 años',
            'GRAVEDAD EN SUPERFICIE': '24.79 m/s²',
            'TEMPERATURA EN LAS NUBES': '-145 °C'
        },
        intro: 'Júpiter es el planeta más grande del Sistema Solar, un gigante gaseoso con más del doble de la masa de todos los demás planetas combinados.',
        sections: [
            {
                title: 'ATMÓSFERA',
                text: 'Compuesta principalmente por hidrógeno (90%) y helio (10%). Presenta bandas de nubes características y la Gran Mancha Roja, una tormenta gigante de más de 350 años.'
            },
            {
                title: 'LUNAS',
                text: 'Júpiter tiene 95 lunas conocidas, incluyendo las cuatro grandes lunas galileanas: Ío, Europa, Ganímedes y Calisto.'
            }
        ],
        structure: {
            intro: 'Júpiter no tiene una superficie sólida definida. Su composición es principalmente hidrógeno y helio, con presión y temperatura crecientes hacia el interior.',
            sections: [
                {
                    title: 'ATMÓSFERA',
                    text: 'Capa externa de hidrógeno y helio molecular con nubes de amoníaco e hidrosulfuro de amonio.'
                },
                {
                    title: 'HIDRÓGENO METÁLICO',
                    text: 'A grandes presiones el hidrógeno se comporta como un metal líquido conductor que genera el potente campo magnético de Júpiter.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo denso de roca, metales y compuestos de hielo, posiblemente "diluido" en la capa de hidrógeno metálico.'
                }
            ],
            layers: [
                { name: 'ATMÓSFERA',          detail: 'HIDRÓGENO Y HELIO',           color: '#d4a574', size: 20 },
                { name: 'HIDRÓGENO LÍQUIDO',  detail: 'HIDRÓGENO MOLECULAR',         color: '#b87a3c', size: 35 },
                { name: 'HIDRÓGENO METÁLICO', detail: 'HIDRÓGENO METÁLICO LÍQUIDO',  color: '#8d4a1e', size: 30 },
                { name: 'NÚCLEO',             detail: 'ROCA Y HIELO',                color: '#f0c060', size: 15 }
            ]
        }
    },
    saturn: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '120 536 km',
            'MASA': '5.68 × 10²⁶ kg',
            'DISTANCIA MEDIA AL SOL': '1 433.5 M km',
            'PERIODO DE ROTACIÓN': '10h 42m',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '29.5 años',
            'GRAVEDAD EN SUPERFICIE': '10.44 m/s²',
            'TEMPERATURA EN LAS NUBES': '-178 °C'
        },
        intro: 'Saturno es el sexto planeta y el segundo más grande. Es famoso por su espectacular sistema de anillos, el más extenso del Sistema Solar.',
        sections: [
            {
                title: 'ANILLOS',
                text: 'Los anillos de Saturno se extienden hasta 282 000 km del planeta y están compuestos por miles de millones de fragmentos de hielo y roca, desde partículas microscópicas hasta bloques del tamaño de una montaña.'
            },
            {
                title: 'LUNAS',
                text: 'Tiene 146 lunas conocidas. Titán, la mayor, es la única luna del Sistema Solar con una atmósfera densa.'
            }
        ],
        structure: {
            intro: 'Saturno es un gigante gaseoso de composición similar a Júpiter, pero con menor densidad: es el único planeta del Sistema Solar menos denso que el agua.',
            sections: [
                {
                    title: 'ATMÓSFERA',
                    text: 'Hidrógeno (96%) y helio (3%) con trazas de metano y amoníaco. Presenta vientos de hasta 1 800 km/h.'
                },
                {
                    title: 'HIDRÓGENO METÁLICO',
                    text: 'Capa profunda donde el hidrógeno alcanza un estado metálico líquido conductor.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo denso de roca y hielo de aproximadamente 9 a 22 veces la masa de la Tierra.'
                }
            ],
            layers: [
                { name: 'ATMÓSFERA',          detail: 'HIDRÓGENO Y HELIO',           color: '#e8d090', size: 22 },
                { name: 'HIDRÓGENO LÍQUIDO',  detail: 'HIDRÓGENO MOLECULAR',         color: '#c9a060', size: 38 },
                { name: 'HIDRÓGENO METÁLICO', detail: 'HIDRÓGENO METÁLICO LÍQUIDO',  color: '#a07030', size: 25 },
                { name: 'NÚCLEO',             detail: 'ROCA Y HIELO',                color: '#fbd560', size: 15 }
            ]
        }
    },
    uranus: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '51 118 km',
            'MASA': '8.68 × 10²⁵ kg',
            'DISTANCIA MEDIA AL SOL': '2 872.5 M km',
            'PERIODO DE ROTACIÓN': '17h 14m (retrógrado)',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '84 años',
            'GRAVEDAD EN SUPERFICIE': '8.69 m/s²',
            'TEMPERATURA EN LAS NUBES': '-216 °C'
        },
        intro: 'Urano es un gigante de hielo, el séptimo planeta desde el Sol. Su eje de rotación está inclinado casi 98°, por lo que rota prácticamente "tumbado" respecto a su órbita.',
        sections: [
            {
                title: 'ATMÓSFERA',
                text: 'Compuesta por hidrógeno, helio y metano. Este último absorbe la luz roja y le da al planeta su característico color azul-verdoso.'
            },
            {
                title: 'ANILLOS Y LUNAS',
                text: 'Posee un sistema tenue de 13 anillos y 27 lunas conocidas, nombradas en honor a personajes de Shakespeare y Pope.'
            }
        ],
        structure: {
            intro: 'Urano es uno de los dos "gigantes de hielo" del Sistema Solar. Su interior está dominado por hielos de agua, amoníaco y metano sobre un pequeño núcleo rocoso.',
            sections: [
                {
                    title: 'ATMÓSFERA',
                    text: 'Capa externa de hidrógeno, helio y metano. El metano produce el color cian característico.'
                },
                {
                    title: 'MANTO DE HIELO',
                    text: 'Capa de hielos calientes y comprimidos de agua, amoníaco y metano en estado supercrítico.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo rocoso pequeño de silicatos y hierro-níquel.'
                }
            ],
            layers: [
                { name: 'ATMÓSFERA',     detail: 'HIDRÓGENO, HELIO Y METANO', color: '#a8e0e0', size: 25 },
                { name: 'MANTO DE HIELO', detail: 'AGUA, AMONÍACO Y METANO',  color: '#5d99b3', size: 55 },
                { name: 'NÚCLEO',        detail: 'ROCA Y HIERRO',             color: '#c8a26a', size: 20 }
            ]
        }
    },
    neptune: {
        type: 'PLANETA',
        stats: {
            'DIÁMETRO ECUATORIAL': '49 528 km',
            'MASA': '1.02 × 10²⁶ kg',
            'DISTANCIA MEDIA AL SOL': '4 495.1 M km',
            'PERIODO DE ROTACIÓN': '16h 6m',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '165 años',
            'GRAVEDAD EN SUPERFICIE': '11.15 m/s²',
            'TEMPERATURA EN LAS NUBES': '-214 °C'
        },
        intro: 'Neptuno es el octavo y más lejano planeta del Sistema Solar. Es un gigante de hielo de un intenso color azul, con los vientos más rápidos del Sistema Solar (>2 000 km/h).',
        sections: [
            {
                title: 'ATMÓSFERA',
                text: 'Hidrógeno, helio y metano. Presenta sistemas de tormentas activas como la "Gran Mancha Oscura" observada por la Voyager 2.'
            },
            {
                title: 'LUNAS',
                text: 'Tiene 14 lunas conocidas. Tritón, la mayor, orbita en sentido retrógrado y es geológicamente activa con géiseres de nitrógeno.'
            }
        ],
        structure: {
            intro: 'Estructuralmente similar a Urano, Neptuno es un gigante de hielo con manto fluido de agua, amoníaco y metano sobre un núcleo rocoso.',
            sections: [
                {
                    title: 'ATMÓSFERA',
                    text: 'Hidrógeno (80%), helio (19%) y metano (1.5%). El metano da el color azul intenso.'
                },
                {
                    title: 'MANTO DE HIELO',
                    text: 'Fluido caliente y denso de agua, amoníaco y metano. Genera el campo magnético inclinado del planeta.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo rocoso de aproximadamente la masa de la Tierra, compuesto por silicatos y hierro-níquel.'
                }
            ],
            layers: [
                { name: 'ATMÓSFERA',     detail: 'HIDRÓGENO, HELIO Y METANO', color: '#5677d4', size: 22 },
                { name: 'MANTO DE HIELO', detail: 'AGUA, AMONÍACO Y METANO',  color: '#2f4a8a', size: 55 },
                { name: 'NÚCLEO',        detail: 'ROCA Y HIERRO',             color: '#c8a26a', size: 23 }
            ]
        }
    },
    pluto: {
        type: 'PLANETA ENANO',
        stats: {
            'DIÁMETRO ECUATORIAL': '2 376 km',
            'MASA': '1.30 × 10²² kg',
            'DISTANCIA MEDIA AL SOL': '5 906.4 M km',
            'PERIODO DE ROTACIÓN': '6.4 días (retrógrado)',
            'PERIODO DE ÓRBITA ALREDEDOR DEL SOL': '248 años',
            'GRAVEDAD EN SUPERFICIE': '0.62 m/s²',
            'TEMPERATURA EN SUPERFICIE': '-229 °C'
        },
        intro: 'Plutón es un planeta enano del cinturón de Kuiper. Fue considerado el noveno planeta hasta 2006. Junto a su luna Caronte forma un sistema binario.',
        sections: [
            {
                title: 'SUPERFICIE',
                text: 'Compuesta por hielos de nitrógeno, metano y monóxido de carbono. La región Tombaugh Regio, en forma de corazón, fue revelada por la sonda New Horizons en 2015.'
            },
            {
                title: 'ATMÓSFERA',
                text: 'Atmósfera tenue y estacional de nitrógeno, metano y monóxido de carbono que se congela cuando el planeta se aleja del Sol.'
            }
        ],
        structure: {
            intro: 'Plutón es aproximadamente dos terceras partes roca y un tercio hielo. Posiblemente alberga un océano de agua líquida bajo su corteza helada.',
            sections: [
                {
                    title: 'CORTEZA DE HIELO',
                    text: 'Corteza compuesta por hielos de nitrógeno, metano y agua congelada.'
                },
                {
                    title: 'MANTO',
                    text: 'Posible océano de agua líquida o capa de hielo de agua bajo la corteza.'
                },
                {
                    title: 'NÚCLEO',
                    text: 'Núcleo rocoso grande de silicatos que ocupa la mayor parte del interior.'
                }
            ],
            layers: [
                { name: 'CORTEZA DE HIELO', detail: 'NITRÓGENO, METANO Y AGUA', color: '#e0c8a8', size: 20 },
                { name: 'MANTO',            detail: 'HIELO DE AGUA',             color: '#86a8c4', size: 25 },
                { name: 'NÚCLEO',           detail: 'ROCA Y SILICATOS',          color: '#9c6a4a', size: 55 }
            ]
        }
    }
};
