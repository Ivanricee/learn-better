import { execFile } from 'child_process'
import { promisify } from 'util'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'

const exec = promisify(execFile)

export async function POST(req: Request) {
  const { url } = await req.json()

  if (!url) {
    return Response.json({ error: 'URL requerida' }, { status: 400 })
  }

  const id = randomUUID()
  const outputPath = `/tmp/${id}.ogg`

  try {
    await exec('yt-dlp', [
      url,
      '--extract-audio',
      '--audio-format', 'opus',
      '--audio-quality', '0',
      '--postprocessor-args', 'ffmpeg:-ar 16000 -ac 1',
      '-o', outputPath,
    ])

    const stats = await fs.stat(outputPath)

    return Response.json({
      success: true,
      file: outputPath,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2),
    })

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}