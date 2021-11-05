#! /usr/bin/env node
import minimist from 'minimist'
import {execSync} from 'child_process'
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import {Iconv} from 'iconv'

const time_to_second = (time) => {
    const ms = time.split(',').pop()
    return time.split(',').shift().split(':').reduce((acc,time) => (60 * acc)+Number(time)) + ms / 1000
}

const main = () => {
    const {h, v, s, split} = minimist(process.argv.slice(2))
    if (h) return console.log('v-s-split -v ${videoPath} -s ${srtPath} --split ${splitJsonPath}')
    const v_name = v.split('/').pop().split('.').shift()
    const dividers = JSON.parse(readFileSync(split).toString())
    execSync(`mkdir -p ${v_name}`)
    for (const [index, [start, end]] of dividers.entries()) {
        const command = `ffmpeg -y -i ${v} -sub_charenc gbk -i ${s} -ss ${time_to_second(start)} -to ${time_to_second(end)} -c copy ./${v_name}/${index}.mp4 -ss ${time_to_second(start)} -to ${time_to_second(end)} ./${v_name}/${index}.srt`
        execSync(command, (err, stdout, stderr) => {
            console.log(`err: ${stderr}`)
        })
    }
    const srts = readdirSync(`${v_name}`).filter(name => name.endsWith('.srt'))
    const iconv = Iconv('utf-8', 'gbk')
    for (const srt of srts) {
        const srt_content = readFileSync(`${v_name}/${srt}`)
        writeFileSync(`${v_name}/${srt}`, iconv.convert(srt_content), () => {})
    }
}

main()
