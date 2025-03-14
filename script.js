let workbook; // Variabile globale per il workbook

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

// Aggiunge una nuova riga di ricerca
document.getElementById('addSearchRow').addEventListener('click', function() {
  const container = document.getElementById('searchRowsContainer');
  const newRow = document.createElement('div');
  newRow.className = 'search-row';
  newRow.innerHTML = `
    <input type="text" placeholder="Cerca TaskCard..." class="searchInput">
    <select class="airplaneModel">
      <option value="A220">A220</option>
      <option value="A320">A320</option>
      <option value="A330">A330</option>
      <option value="A330Neo">A330Neo</option>
      <option value="A340">A340</option>
      <option value="A350">A350</option>
      <option value="B777">B777</option>
      <option value="B737">B737</option>
    </select>
    <button class="removeRow" title="Rimuovi riga" onclick="removeRow(this)">–</button>
  `;
  container.appendChild(newRow);
});

// Rimuove la riga di ricerca (almeno una deve rimanere)
function removeRow(btn) {
  const container = document.getElementById('searchRowsContainer');
  if (container.children.length > 1) {
    btn.parentElement.remove();
  } else {
    alert('Deve esserci almeno una riga di ricerca.');
  }
}

// Esegue la ricerca per ogni riga e visualizza i risultati in tabelle
document.getElementById('searchBtn').addEventListener('click', function() {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = ''; // Pulisce i risultati precedenti
  
  if (!workbook) {
    alert('Il file Excel non è stato caricato. Controlla la console per maggiori dettagli.');
    return;
  }
  
  const searchRows = document.querySelectorAll('#searchRowsContainer .search-row');
  
  searchRows.forEach((row, index) => {
    const queryInput = row.querySelector('.searchInput').value.toLowerCase();
    const modelSelect = row.querySelector('.airplaneModel').value;
    
    // Seleziona il foglio relativo al modello scelto
    const worksheet = workbook.Sheets[modelSelect];
    if (!worksheet) {
      alert(`Foglio per il modello ${modelSelect} non trovato nel file Excel.`);
      return;
    }
    
    // Converte il foglio in JSON
    let data = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
    if (data.length > 0 && data[0].A === 'TaskNo') {
      data.shift();
    }
    
    // Filtra le task in base alla query (ricerca in tutte le colonne)
    let filteredTasks = data.filter(task => {
      const taskString = `${task.A} ${task.B} ${task.C} ${task.D} ${task.E}`.toLowerCase();
      return taskString.includes(queryInput);
    });
    
    // Limita i risultati a 10 per ogni riga
    filteredTasks = filteredTasks.slice(0, 10);
    
    // Crea un wrapper per la tabella dei risultati di questa riga
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';
    
    const title = document.createElement('h3');
    title.textContent = `Risultati ricerca ${index + 1}`;
    tableWrapper.appendChild(title);
    
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Intestazione della tabella
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>TaskNo</th>
        <th>Description</th>
        <th>Special</th>
        <th>Work Area</th>
        <th>Hour</th>
      </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    if (filteredTasks.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'Nessun risultato trovato.';
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      filteredTasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${task.A || ''}</td>
          <td>${task.B || ''}</td>
          <td>${task.C || ''}</td>
          <td>${task.D || ''}</td>
          <td>${task.E || ''}</td>
        `;
        tbody.appendChild(tr);
      });
    }
    
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    resultsContainer.appendChild(tableWrapper);
  });
});

// Copia nei clipboard il contenuto testuale dei risultati
document.getElementById('copyResultsBtn').addEventListener('click', function() {
  const resultsContainer = document.getElementById('resultsContainer');
  if (!resultsContainer.innerText.trim()) {
    alert('Nessun risultato da copiare.');
    return;
  }
  
  // Crea un elemento textarea temporaneo per la copia
  const textarea = document.createElement('textarea');
  textarea.value = resultsContainer.innerText;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('Risultati copiati negli appunti.');
  } catch (err) {
    alert('Errore nella copia.');
  }
  document.body.removeChild(textarea);
});
