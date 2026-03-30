import express from "express"
import cors from "cors"
import entregasRoutes from "./routes/entregas_video.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/entregas_video", entregasRoutes)

app.listen(3000, () => {
  console.log("Servidor corriendo")
})

app.get("/", (req,res)=>{
  res.send("API funcionando")
})