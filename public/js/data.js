// js/data.js

// CENTRALIZACIÓN DE DATOS AAA Y CONFIGURACIÓN DEL SISTEMA SOLAR
export const planetDataConfig = {
    // address PROBLEM 1: RADIOS Y DISTANCIAS AUMENTADOS
    mercury: {
        radius: 3.8,   // Aumentado (~50%)
        distance: 55, // Aumentado (~20%)
        img: 'mercury',
        orbitSpeed: 4,
        rotSpeed: 0.005,
        descriptionTitle: 'MERCURIO'
    },
    venus: {
        radius: 6.8,   // Aumentado
        distance: 75, // Aumentado
        img: 'venus',
        orbitSpeed: 3,
        rotSpeed: 0.002,
        descriptionTitle: 'VENUS'
    },
    earth: {
        radius: 8.3,   // Aumentado
        distance: 105, // Aumentado
        img: 'earth',
        orbitSpeed: 2.5,
        rotSpeed: 0.01,
        descriptionTitle: 'LA TIERRA'
    },
    mars: {
        radius: 5.3,   // Aumentado
        distance: 135, // Aumentado
        img: 'mars',
        orbitSpeed: 2,
        rotSpeed: 0.01,
        descriptionTitle: 'MARTE'
    },
    jupiter: {
        radius: 21.0,  // Aumentado
        distance: 195, // Aumentado
        img: 'jupiter',
        orbitSpeed: 1.2,
        rotSpeed: 0.02,
        descriptionTitle: 'JÚPITER'
    },
    saturn: {
        radius: 18.0,  // Aumentado
        distance: 260, // Aumentado
        img: 'saturn',
        orbitSpeed: 0.8,
        rotSpeed: 0.015,
        descriptionTitle: 'SATURNO',
        hasRings: true // Realismo Senior
    },
    uranus: {
        radius: 12.0,  // Aumentado
        distance: 320, // Aumentado
        img: 'uranus',
        orbitSpeed: 0.5,
        rotSpeed: 0.008,
        descriptionTitle: 'URANO'
    },
    neptune: {
        radius: 12.0,  // Aumentado
        distance: 370, // Aumentado
        img: 'neptune',
        orbitSpeed: 0.3,
        rotSpeed: 0.008,
        descriptionTitle: 'NEPTUNO'
    },
    pluto: {
        radius: 2.3,   // Aumentado
        distance: 410, // Aumentado
        img: 'pluto',
        orbitSpeed: 0.1,
        rotSpeed: 0.002,
        descriptionTitle: 'PLUTÓN' // address PROBLEM 2: PLUTÓN A COLOR
    }
};

// address PROBLEM 2: DATOS DEL HUD EN ESPAÑOL
export const hudInfoData = {
    // ... datos de descripción para enciclopedia/estructura (puedes expandir esto luego) ...
};