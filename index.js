import fetch from "node-fetch";
import fs from "fs";
import express from "express";

import knex from "knex"

const k = knex({
    client: 'sqlite3',
    connection: {
        filename: "./data.sqlite"
    },
    useNullAsDefault: true
});

const { spreadsheetID, port } = JSON.parse(fs.readFileSync("./config.json", "utf8"));
let data, updating = false

const app = express()

app.use(express.static('webview'))

app.use((req, res, next) => {
    console.log(req.method, req.url)
    next()
})

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/webview/index.html')
})

app.get('/updateDB', async (req, res) => {
    if (updating) {
        res.status(400).json({ error: "Already updating" })
    } else {
        try {
            updating = true
            const r = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetID}/gviz/tq?tqx=out:json`)
            const text = await r.text()
        
            const json = JSON.parse(text.substr(47).slice(0, -2))
            data = json.table.rows.map(row => row.c.map(e => e ? e.v : null))

            await k("card").delete()

            let group
            for (let i = 1; i < data.length; i++) {
                const row = data[i]
                if (row[1] == null) {
                    group = row[0]
                    continue
                }

                const exists = await k("card").select('id').where({
                    english: row[0],
                    german: row[1]
                }).first()

                if (exists) return console.log("Duplicate:", row[0], row[1])

                await k("card").insert({
                    english: row[0],
                    german: row[1],
                    group: group,
                    category: 'Elementary Vocabulary',
                    image: row[2],
                    sentence: row[3],
                    image: null,
                    sentence: null,
                    played: 0,
                    correct: 0,
                    incorrect: 0,
                    streak: 0,
                    lastPlayed: null
                })
                  
                console.log('new vocable: ', group, row[0], row[1])
                        
            }
    
            updating = false
            res.status(200).json({ success: 'Updated' })
        } catch(e) {
            updating = false
            res.status(500).json({ error: e.message })
        }
}
})

app.get('/data', async (req, res) => {
    try {
        const cards = await k("card").select()
        res.status(200).json(cards)
    }
    catch (e) {
        res.status(500).json({ error: e, message: "Could not get data" })
    }
})

let debouncer = Date.now()
app.get('/judge/:id/:vote', (req, res) => {
    if (Date.now() - debouncer < 1000) return res.status(400).json({ error: "Debounce" })
    debouncer = Date.now()
    const { id, vote } = req.params
    if (!id || !vote) return res.status(400).send('missing id or vote')
    k("card").where({ id }).update({
        played: k.raw('played + 1'),
        streak: vote === 'correct' ? k.raw('streak + 1') : 0,
        lastPlayed: Date.now(),
        correct: vote === 'correct' ? k.raw('correct + 1') : k.raw('correct'),
        incorrect: vote === 'incorrect' ? k.raw('incorrect + 1') : k.raw('incorrect')
    }).then(() => {
        res.status(200).json({ success: true })
    }).catch(err => {
        console.log(err)
        res.status(500).json({ error: err, message: "Could not update card" })
    })
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
