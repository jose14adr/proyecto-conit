import express from "express"
import { pool } from "../db.js"

const router = express.Router()

/* CREAR */
router.post("/", async (req, res) => {

  const { alumno_id, tarea_id, curso_id, video_url } = req.body

  const result = await pool.query(
    `INSERT INTO entregas_video (alumno_id, tarea_id, curso_id, video_url)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [alumno_id, tarea_id, curso_id, video_url]
  )

  res.json(result.rows[0])
})

/* OBTENER */
router.get("/:curso_id", async (req, res) => {

  const result = await pool.query(
    `SELECT * FROM entregas_video WHERE curso_id=$1 LIMIT 1`,
    [req.params.curso_id]
  )

  res.json(result.rows[0] || null)
})

/* UPDATE */
router.put("/:id", async (req, res) => {

  const { video_url } = req.body

  const result = await pool.query(
    `UPDATE entregas_video
     SET video_url=$1
     WHERE id=$2
     RETURNING *`,
    [video_url, req.params.id]
  )

  res.json(result.rows[0])
})

/* DELETE */
router.delete("/:id", async (req, res) => {

  await pool.query(
    `DELETE FROM entregas_video WHERE id=$1`,
    [req.params.id]
  )

  res.json({ ok: true })
})

export default router