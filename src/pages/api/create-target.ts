import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const form = new formidable.IncomingForm()
    form.uploadDir = path.join(process.cwd(), 'public', 'uploads')
    form.keepExtensions = true

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const markerFile = files.marker as formidable.File
    const targetFile = files.target as formidable.File
    const targetId = uuidv4()

    const markerFilename = `marker-${targetId}${path.extname(markerFile.originalFilename || '')}`
    const targetFilename = `target-${targetId}${path.extname(targetFile.originalFilename || '')}`

    const markerPath = path.join(form.uploadDir, markerFilename)
    const targetPath = path.join(form.uploadDir, targetFilename)

    await fs.promises.rename(markerFile.filepath, markerPath)
    await fs.promises.rename(targetFile.filepath, targetPath)

    const testUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ar-viewer?targetId=${targetId}`
    const qrCodeDataUrl = await QRCode.toDataURL(testUrl)

    res.status(200).json({
      targetId,
      markerUrl: `/uploads/${markerFilename}`,
      targetUrl: `/uploads/${targetFilename}`,
      qrCode: qrCodeDataUrl,
      testUrl,
    })
  } catch (error) {
    console.error('Error processing files:', error)
    res.status(500).json({ message: 'Error processing files' })
  }
}