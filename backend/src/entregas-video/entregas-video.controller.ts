import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { EntregasVideoService } from './entregas-video.service'

@Controller('entregas_video')
export class EntregasVideoController {

  constructor(private service: EntregasVideoService){}

  @Post()
  crear(@Body() body:any){
    return this.service.crear(body)
  }

  @Get(':curso_id')
  obtener(@Param('curso_id') curso_id:number){
    return this.service.obtener(curso_id)
  }

  @Put(':id')
  actualizar(@Param('id') id:number, @Body() body:any){
    return this.service.actualizar(id, body)
  }

  @Delete(':id')
  eliminar(@Param('id') id:number){
    return this.service.eliminar(id)
  }

}