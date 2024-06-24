import * as fs from 'fs'
import * as path from 'path';
import { Magick } from 'magickwand.js'
import processedFormats from '../../logos/processed-formats.json'

(async () => {
    const inputFolder = path.join('..', '..', 'logos')
    const files = fs.readdirSync(inputFolder, {withFileTypes: true})
    console.log(files)
    for (const file of files) {
        const parsed = path.parse(file.name)
        console.log(processedFormats, parsed.ext)
        if (!processedFormats.includes(parsed.ext)) continue
        const filePath = path.join(inputFolder, file.name)
        const magick = new Magick.Image(filePath)
        if (Math.max(magick.size().width(), magick.size().height()) > 200) {
            magick.scale('200x200')
        }
        magick.magick('avif')
        console.log(file)
        magick.write(`../../logos/avif/${parsed.name}.avif`)
    }
})()
