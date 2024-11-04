const mongoose = require('mongoose');
const { Planet, Moon, StarSystem } = require('../src/models/Location');
const db = require('../src/config/database');

// Initial data
const initialData = [
    {
        system: {
            name: 'Stanton',
            planets: [
                {
                    name: 'Hurston',
                    moons: ['Hurston Orbit', 'Arial', 'Aberdeen', 'Magda', 'Ita', 'Everus Harbor']
                },
                {
                    name: 'Crusader',
                    moons: ['Crusader Orbit', 'Celin', 'Daymar', 'Yela', 'Seraphim Station']
                },
                {
                    name: 'ArcCorp',
                    moons: ['ArcCorp Orbit', 'Lyria', 'Wala', 'Baijini Point']
                },
                {
                    name: 'microTech',
                    moons: ['microTech Orbit', 'Calliope', 'Clio', 'Euterpe', 'Port Tressler']
                }
            ]
        }
    },
    {
        system: {
            name: 'Pyro',
            planets: [
                {
                    name: 'Pyro I',
                    moons: ['Pyro I Orbit']
                },
                {
                    name: 'Monox (Pyro II)',
                    moons: ['Pyro II Orbit']
                },
                {
                    name: 'Bloom (Pyro III)',
                    moons: ['Pyro III Orbit']
                },
                {
                    name: 'Pyro V',
                    moons: ['Pyro V Orbit', 'Ignis', 'Vatra', 'Adir', 'Fairo', 'Fuego', 'Vuur', 'Pyro IV']
                },
                {
                    name: 'Terminus (Pyro VI)',
                    moons: ['Pyro VI Orbit', 'Ruin Station']
                }
            ]
        }
    }
];

async function seedDatabase() {
    console.log('Starting seedDatabase');
    try {
        // Clear previous data
        await StarSystem.deleteMany({});
        await Planet.deleteMany({});
        await Moon.deleteMany({});

        // Create systems, planets, and moons
        for (const data of initialData) {
            // Create the star system
            const starSystem = await StarSystem.create({ name: data.system.name });

            for (const planetData of data.system.planets) {
                // Create the planet
                const planet = await Planet.create({
                    name: planetData.name,
                    parentSystem: starSystem._id
                });
                starSystem.planets.push(planet._id);
                // Create and link moons to the planet
                const moonIds = [];
                for (const moonName of planetData.moons) {
                    const moon = await Moon.create({
                        name: moonName,
                        parentPlanet: planet._id
                    });
                    moonIds.push(moon._id);
                }
                // Update the planet with its moons
                planet.moons = moonIds;
                await planet.save();
            }
            await starSystem.save();
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

module.exports = seedDatabase;
