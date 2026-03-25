import { Controller, Post, UploadedFile, Body, Get, Param, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { VimeoService } from './vimeo.service'

@Controller('videos')
export class VimeoController {

constructor(private readonly vimeoService: VimeoService){}

@Post('create')
  crear(@Body() body: any){
    return this.vimeoService.crearVideo(body.size)
  }

  @Get('status/:id')
  estado(@Param('id') id: string){
    return this.vimeoService.verificarEstado(id)
  }


@Post('upload')
@UseInterceptors(FileInterceptor('video',{
storage: diskStorage({
destination: './uploads',
filename: (req,file,cb)=>{

const nombre = Date.now() + extname(file.originalname)
cb(null,nombre)

}
})
}))
async subirVideo(@UploadedFile() file: Express.Multer.File){

console.log("Archivo recibido:", file)

const resultado = await this.vimeoService.subirVideo(file.path)

return resultado

}

}