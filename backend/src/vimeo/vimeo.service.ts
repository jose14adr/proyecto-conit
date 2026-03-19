import { Injectable } from '@nestjs/common'
import { Vimeo } from '@vimeo/vimeo'

@Injectable()
export class VimeoService {

  private vimeo: Vimeo

  constructor(){

    this.vimeo = new Vimeo(
      process.env.VIMEO_CLIENT_ID,
      process.env.VIMEO_CLIENT_SECRET,
      process.env.VIMEO_ACCESS_TOKEN
    )

  }

  /* SUBIR VIDEO */

  async subirVideo(filePath: string): Promise<any> {

  return new Promise((resolve, reject) => {

    this.vimeo.upload(

      filePath,

      {
        name: "Video del estudiante",
        description: "Video subido desde el aula virtual"
      },

      async (uri: string) => {

        const videoId = uri.replace("/videos/", "").split("?")[0]

        console.log("VIDEO ID:", videoId)

        // 🔥 ESPERAR HASTA QUE ESTÉ LISTO
        const esperarVideo = async () => {

          try {

            const estado: any = await this.verificarEstado(videoId)

            console.log("Estado actual:", estado.status)

            if (estado.status === "available") {

              console.log("✅ VIDEO LISTO")

              resolve({
                videoId: videoId,
                embed: `https://player.vimeo.com/video/${videoId}`,
                status: "available"
              })

            } else {

              console.log("⏳ Esperando procesamiento...")
              setTimeout(esperarVideo, 3000) // cada 3 segundos

            }

          } catch (error) {
            reject(error)
          }

        }

        esperarVideo()

      },

      (bytesUploaded: number, bytesTotal: number) => {

        const porcentaje = (bytesUploaded / bytesTotal * 100).toFixed(2)
        console.log(`Subiendo ${porcentaje}%`)

      },

      (error: any) => {
        reject(error)
      }

    )

  })

}


  /* OBTENER VIDEO */

  obtenerVideo(videoId: string) {

    return new Promise((resolve, reject) => {

      this.vimeo.request(
        {
        method: "GET",
        path: `/videos/${videoId}`
        },
        (error, body) => {

        if(error){
          console.log("❌ VIDEO NO EXISTE AÚN")
        }else{
          console.log("✅ VIDEO EXISTE")
        }

        }
        )

    })

  }


  /* ELIMINAR VIDEO */

  eliminarVideo(videoId: string) {

    return new Promise((resolve, reject) => {

      this.vimeo.request(
        {
          method: "DELETE",
          path: `/videos/${videoId}`
        },
        (error, body) => {

          if(error) reject(error)
          else resolve(body)

        }
      )

    })

  }

  async verificarEstado(videoId: string): Promise<any> {

  return new Promise((resolve, reject) => {

    this.vimeo.request(
      {
        method: "GET",
        path: `/videos/${videoId}`
      },
      (error, body) => {

        if (error) reject(error)
        else resolve(body)

      }
    )

  })

}

}