import express from "express"

import {
    crearVideo,
    obtenerVideo,
    eliminarVideo
} from "./videoController.js"

const router = express.Router()

router.post("/video/create",crearVideo)

router.get("/video/:videoId",obtenerVideo)

router.delete("/video/:videoId",eliminarVideo)

export default router