const mongoose = require('mongoose');
const { PlanetModel, MoonModel, SystemModel } = require('../src/models/Location');
const db = require('../src/config/database');

// Initial data
const initialData = [
    {
        system: {
            name: 'Stanton',
            planets: [
                {
                    name: 'Hurston',
                    moons: ['Arial', 'Aberdeen', 'Magda', 'Ita', 'Everus Harbor']
                },
                {
                    name: 'Crusader',
                    moons: ['Celin', 'Daymar', 'Yela', 'Seraphim Station']
                },
                {
                    name: 'ArcCorp',
                    moons: ['Lyria', 'Wala', 'Baijini Point']
                },
                {
                    name: 'microTech',
                    moons: ['Calliope', 'Clio', 'Euterpe', 'Port Tressler']
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
                    moons: []
                },
                {
                    name: 'Monox (Pyro II)',
                    moons: []
                },
                {
                    name: 'Bloom (Pyro III)',
                    moons: []
                },
                {
                    name: 'Pyro V',
                    moons: ['Ignis', 'Vatra', 'Adir', 'Fairo', 'Fuego', 'Vuur', 'Pyro IV']
                },
                {
                    name: 'Terminus (Pyro VI)',
                    moons: ['Ruin Station']
                }
            ]
        }
    }
];

async function seedDatabase() {
    console.log('Starting seedDatabase');
    try {
        // Clear previous data
        await SystemModel.deleteMany({});
        await PlanetModel.deleteMany({});
        await MoonModel.deleteMany({});

        // Create systems, planets, and moons
        for (const data of initialData) {
            // Create the star system
            const starSystem = await SystemModel.create({ name: data.system.name });

            for (const planetData of data.system.planets) {
                // Create the planet
                const planet = await PlanetModel.create({
                    name: planetData.name,
                    parentSystem: starSystem._id
                });
                starSystem.planets.push(planet._id);
                // Create and link moons to the planet
                const moonIds = [];
                for (const moonName of planetData.moons) {
                    const moon = await MoonModel.create({
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
