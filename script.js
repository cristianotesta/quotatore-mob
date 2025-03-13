let workbook; // Variabile per memorizzare il workbook caricato

// Caricamento automatico del file Excel dalla directory principale
function loadExcelFile() {
  fetch('airplanes.xlsx')
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore nel caricamento del file Excel.');
      }
      return response.arrayBuffer();
    })
    .then(data => {
      workbook = XLSX.read(data, { type: 'array' });
      console.log('File Excel caricato automaticamente.');
    })
    .catch(error => {
      console.error('Errore:', error);
      alert('Errore nel caricamento del file Excel. Assicurati che "airplanes.xlsx" sia nella directory principale.');
    });
}

window.addEventListener('DOMContentLoaded', loadExcelFile);

// Funzione per cercare e visualizzare le TaskCard
document.getElementById('searchBtn').addEventListener('click', function() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const model = document.getElementById('airplaneModel').value;
  const taskCardsContainer = document.getElementById('taskCardsContainer');

  // Pulizia dei risultati precedenti
  taskCardsContainer.innerHTML = '';

  if (!workbook) {
    alert('Il file Excel non è stato caricato. Controlla la console per maggiori dettagli.');
    return;
  }

  // Selezione del foglio corrispondente al modello
  const worksheet = workbook.Sheets[model];
  if (!worksheet) {
    alert(`Foglio per il modello ${model} non trovato nel file Excel.`);
    return;
  }

  // Conversione del foglio in formato JSON
  let data = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
  if (data.length > 0 && data[0].A === 'TaskNo') {
    data.shift();
  }

  // Filtraggio in base alla query (ricerca in tutte le colonne)
  let filteredTasks = data.filter(task => {
    const taskString = `${task.A} ${task.B} ${task.C} ${task.D} ${task.E}`.toLowerCase();
    return taskString.includes(searchQuery);
  });

  // Limita a 10 risultati
  filteredTasks = filteredTasks.slice(0, 10);

  if (filteredTasks.length === 0) {
    taskCardsContainer.innerHTML = '<p style="text-align:center;">Nessuna TaskCard trovata.</p>';
    return;
  }

  // Creazione e visualizzazione delle card per ogni task
  filteredTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';

    const taskNo = document.createElement('p');
    taskNo.innerHTML = `<strong>TaskNo:</strong> ${task.A || ''}`;

    const description = document.createElement('p');
    description.innerHTML = `<strong>Description:</strong> ${task.B || ''}`;

    const special = document.createElement('p');
    special.innerHTML = `<strong>Special:</strong> ${task.C || ''}`;

    const workArea = document.createElement('p');
    workArea.innerHTML = `<strong>Work Area:</strong> ${task.D || ''}`;

    const hour = document.createElement('p');
    hour.innerHTML = `<strong>Hour:</strong> ${task.E || ''}`;

    card.appendChild(taskNo);
    card.appendChild(description);
    card.appendChild(special);
    card.appendChild(workArea);
    card.appendChild(hour);

    taskCardsContainer.appendChild(card);
  });
});

// Funzione per rimuovere le TaskCard visualizzate
document.getElementById('removeTasksBtn').addEventListener('click', function() {
  document.getElementById('taskCardsContainer').innerHTML = '';
});
