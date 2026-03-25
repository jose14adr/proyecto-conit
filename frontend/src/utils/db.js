import { openDB } from "idb"

export const dbPromise = openDB("uploadDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("files")) {
      db.createObjectStore("files")
    }
  }
})

export async function guardarArchivo(key, file){
  const db = await dbPromise
  await db.put("files", file, key)
}

export async function obtenerArchivo(key){
  const db = await dbPromise
  return await db.get("files", key)
}

export async function eliminarArchivo(key){
  const db = await dbPromise
  await db.delete("files", key)
}