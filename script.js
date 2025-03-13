{\rtf1\ansi\ansicpg1252\cocoartf1561\cocoasubrtf610
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // script.js\
\
let workbook; // Variabile per memorizzare il workbook caricato\
\
// Gestione del caricamento del file Excel\
document.getElementById('fileUpload').addEventListener('change', function(e) \{\
  const file = e.target.files[0];\
  if (!file) return;\
  \
  const reader = new FileReader();\
  reader.onload = function(e) \{\
    const data = new Uint8Array(e.target.result);\
    workbook = XLSX.read(data, \{ type: 'array' \});\
    alert('File caricato correttamente!');\
  \};\
  reader.readAsArrayBuffer(file);\
\});\
\
// Funzione per cercare e visualizzare le TaskCard\
document.getElementById('searchBtn').addEventListener('click', function() \{\
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();\
  const model = document.getElementById('airplaneModel').value;\
  const taskCardsContainer = document.getElementById('taskCardsContainer');\
  \
  // Pulizia dei risultati precedenti\
  taskCardsContainer.innerHTML = '';\
  \
  if (!workbook) \{\
    alert('Carica prima il file Excel.');\
    return;\
  \}\
  \
  // Selezione del foglio relativo al modello di aereo scelto\
  const worksheet = workbook.Sheets[model];\
  if (!worksheet) \{\
    alert(`Foglio per il modello $\{model\} non trovato nel file Excel.`);\
    return;\
  \}\
  \
  // Conversione del foglio in formato JSON\
  // Utilizziamo la prima riga come header (A, B, C, D, E)\
  let data = XLSX.utils.sheet_to_json(worksheet, \{ header: "A" \});\
  \
  // Rimuoviamo l'intestazione se presente\
  if (data.length > 0 && data[0].A === 'TaskNo') \{\
    data.shift();\
  \}\
  \
  // Filtriamo le task in base alla query (ricerca in tutte le colonne)\
  let filteredTasks = data.filter(task => \{\
    const taskString = `$\{task.A\} $\{task.B\} $\{task.C\} $\{task.D\} $\{task.E\}`.toLowerCase();\
    return taskString.includes(searchQuery);\
  \});\
  \
  // Limitiamo il risultato a 10 TaskCard\
  filteredTasks = filteredTasks.slice(0, 10);\
  \
  if (filteredTasks.length === 0) \{\
    taskCardsContainer.innerHTML = '<p>Nessuna TaskCard trovata.</p>';\
    return;\
  \}\
  \
  // Creazione e visualizzazione delle card per ogni task\
  filteredTasks.forEach(task => \{\
    const card = document.createElement('div');\
    card.className = 'task-card';\
    \
    const taskNo = document.createElement('p');\
    taskNo.innerHTML = `<strong>TaskNo:</strong> $\{task.A || ''\}`;\
    \
    const description = document.createElement('p');\
    description.innerHTML = `<strong>Description:</strong> $\{task.B || ''\}`;\
    \
    const special = document.createElement('p');\
    special.innerHTML = `<strong>Special:</strong> $\{task.C || ''\}`;\
    \
    const workArea = document.createElement('p');\
    workArea.innerHTML = `<strong>Work Area:</strong> $\{task.D || ''\}`;\
    \
    const hour = document.createElement('p');\
    hour.innerHTML = `<strong>Hour:</strong> $\{task.E || ''\}`;\
    \
    card.appendChild(taskNo);\
    card.appendChild(description);\
    card.appendChild(special);\
    card.appendChild(workArea);\
    card.appendChild(hour);\
    \
    taskCardsContainer.appendChild(card);\
  \});\
\});\
\
// Funzione per rimuovere le TaskCard visualizzate\
document.getElementById('removeTasksBtn').addEventListener('click', function() \{\
  document.getElementById('taskCardsContainer').innerHTML = '';\
\});\
}