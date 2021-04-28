const axios = require('axios')
const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringASArray')
const { findConnections, sendMessage } = require('../websocket')
module.exports = {
    store: async(request, response) => {
        const { github_username, techs, latitude, longitude } = request.body

        let dev = await Dev.findOne({ github_username })

        if (!dev) {
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`)

            const { name = login, avatar_url, bio } = apiResponse.data

            const techsArray = parseStringAsArray(techs)

            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            })

            // Filtrar as conexoes que estão há no maximo 10km de distancia e que o novo dev tenha pelo menos uma das techs filtradas
            const sendSocketMessageTo = findConnections({ latitude, longitude }, techsArray)
            sendMessage(sendSocketMessageTo, 'new-dev', dev)

        }

        return response.json(dev)
    },
    index: async(request, response) => {
        const devs = await Dev.find()
        return response.json(devs)
    },


}