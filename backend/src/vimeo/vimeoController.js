import { vimeoClient } from "./vimeoService.js"

/* CREAR VIDEO */

export const crearVideo = (req,res)=>{

    const {size} = req.body

    vimeoClient.request({

    method:"POST",
    path:"/me/videos",
    query:{
        upload:{
        approach:"tus",
        size:size
        }
    }

    },function(error,body){

    if(error){

        return res.status(500).json(error)

    }

    res.json(body)

    })

}



/* OBTENER VIDEO */

export const obtenerVideo = (req,res)=>{

    const {videoId} = req.params

    vimeoClient.request({

    method:"GET",
    path:`/videos/${videoId}`

    },function(error,body){

        if(error){

        return res.status(500).json(error)

        }

        res.json(body)

    })

}



/* ELIMINAR VIDEO */

export const eliminarVideo = (req,res)=>{

    const {videoId} = req.params

    vimeoClient.request({

        method:"DELETE",
        path:`/videos/${videoId}`

    },function(error){

        if(error){

        return res.status(500).json(error)

        }

        res.json({
        message:"Video eliminado"
        })

    })

}