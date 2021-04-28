const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringASArray')

module.exports = {
    // Busacar todos devs num raio 10km
    // Filtrar por tecnologias
    index: async(request, response) => {
        const { latitude, longitude, techs } = request.query

        const techsArray = parseStringAsArray(techs)

        const devs = await Dev.find({
            techs: {
                $in: techsArray
            },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 10000
                },
            },
        })

        return response.json({ devs: devs })
    }
}