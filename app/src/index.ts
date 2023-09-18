// DB Condig
import { DB } from "./db"
// Libs
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// Routes
import routes from './routes'

const cors_config = {
    origin: process.env['ORIGIN'],
    credentials: true,
}

class App {
    server: express.Application
    constructor() {
        this.server = express()
        this.middlewares()
    }
    middlewares() {
        this.server.use(express.json())
        this.server.use(cookieParser())
        this.server.use(cors(cors_config))
        this.server.use(routes)
    }
}

DB.initialize().then(async () => {

    const app = new App()

    app.server.listen(
        process.env["PORT"],
        () => console.log("Server on.")
    )

}).catch(error => console.log(error))