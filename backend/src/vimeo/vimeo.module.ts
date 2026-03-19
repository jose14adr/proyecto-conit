import { Module } from '@nestjs/common'
import { VimeoService } from './vimeo.service'
import { VimeoController } from './vimeo.controller'

@Module({

controllers:[VimeoController],
providers:[VimeoService],
exports:[VimeoService]

})
export class VimeoModule {}