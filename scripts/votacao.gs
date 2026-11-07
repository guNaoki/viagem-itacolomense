/*
  VOTAÇÃO — cola isto no Apps Script da planilha (Extensões > Apps Script) e publica:
    Implantar > Nova implantação > tipo "App da Web"
      Executar como: Eu
      Quem pode acessar: Qualquer pessoa
  Copia o endereço que termina em /exec e coloca em TRIP.voteUrl (src/data/trip.js).
  Toda vez que mudar este código: Implantar > Gerenciar implantações > editar > Nova versão.

  A aba "votos" é criada sozinha. Uma linha por pessoa (votar de novo troca a linha).
*/
const SHEET = 'votos'
const HEAD = ['nome', 'presença', 'chacara', 'cabanas', 'ody', 'quando']
const VIBES = ['chacara', 'cabanas', 'ody']

function sheet_() {
  const ss = SpreadsheetApp.getActive()
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET)
  if (sh.getLastRow() === 0) sh.appendRow(HEAD)
  return sh
}

function people_(sh) {
  const v = sh.getDataRange().getValues().slice(1)
  return v
    .filter((r) => String(r[0]).trim())
    .map((r) => ({
      name: String(r[0]).replace(/^'/, ''),
      presence: r[1],
      votes: { chacara: r[2], cabanas: r[3], ody: r[4] },
    }))
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}

function doGet() {
  return json_({ people: people_(sheet_()) })
}

function doPost(e) {
  // trava: dois votos chegando juntos não se atropelam
  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const d = JSON.parse(e.postData.contents)
    let name = String(d.name || '').trim().slice(0, 40)
    if (!name) return json_({ error: 'sem nome' })
    if (/^[=+\-@]/.test(name)) name = "'" + name // não deixa virar fórmula
    const ok = (x) => (['top', 'ok', 'no'].indexOf(x) >= 0 ? x : '')
    const presence = ['in', 'maybe', 'out'].indexOf(d.presence) >= 0 ? d.presence : ''
    const votes = d.votes || {}
    const line = [name, presence].concat(VIBES.map((k) => ok(votes[k]))).concat([new Date()])

    const sh = sheet_()
    const key = (s) => String(s).replace(/^'/, '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const names = sh.getRange(1, 1, sh.getLastRow(), 1).getValues()
    let row = -1
    for (let i = 1; i < names.length; i++) if (key(names[i][0]) === key(name)) row = i + 1
    if (row > 0) sh.getRange(row, 1, 1, line.length).setValues([line])
    else sh.appendRow(line)
    return json_({ people: people_(sh) })
  } finally {
    lock.releaseLock()
  }
}
