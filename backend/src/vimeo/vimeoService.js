import { Vimeo } from "@vimeo/vimeo"

export const vimeoClient = new Vimeo(
process.env.VIMEO_CLIENT_ID,
process.env.VIMEO_CLIENT_SECRET,
process.env.VIMEO_ACCESS_TOKEN
)