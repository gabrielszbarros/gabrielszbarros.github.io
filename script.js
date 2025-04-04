// Inicialização com dados do localStorage ou array vazio
let items = JSON.parse(localStorage.getItem('items')) || [];

// Função para salvar no localStorage
function saveItems() {
    localStorage.setItem('items', JSON.stringify(items));
}

// Função para adicionar novo anime
function addItem() {
    const input = document.getElementById('itemInput');
    const itemText = input.value.trim();
    
    if (itemText) {
        const newItem = {
            text: itemText,
            checked: false,
            starred: false,
            letter: itemText[0].toUpperCase()
        };
        
        items.push(newItem);
        saveItems();
        updateDisplay();
        input.value = '';
        input.focus();
    }
}

// Função para alternar estrela
function toggleStar(index) {
    items[index].starred = !items[index].starred;
    saveItems();
    updateDisplay();
}

// Função para alternar checkbox
function toggleCheck(index) {
    items[index].checked = !items[index].checked;
    saveItems();
    updateDisplay();
}

// Função para atualizar a exibição
function updateDisplay() {
    const lettersGrid = document.getElementById('lettersGrid');
    lettersGrid.innerHTML = '';

    // Criar colunas de A-Z
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        const column = document.createElement('div');
        column.className = 'letter-column';
        column.innerHTML = `<h3>${letter}</h3>`;
        column.id = `column-${letter}`;
        lettersGrid.appendChild(column);
    });

    // Adicionar itens
    items.forEach((item, index) => {
        const column = document.getElementById(`column-${item.letter}`);
        if (column) {
            const itemDiv = document.createElement('div');
            itemDiv.className = `item ${item.checked ? 'checked' : ''}`;
            itemDiv.innerHTML = `
                <input type="checkbox" 
                    onchange="toggleCheck(${index})" 
                    ${item.checked ? 'checked' : ''}>
                <span class="star ${item.starred ? 'starred' : ''}" 
                      onclick="toggleStar(${index})">★</span>
                ${item.text}
            `;
            column.appendChild(itemDiv);
        }
    });
}

// Função para exportar lista
function saveList() {
    let textToSave = "=== LISTA DE ANIMES ===\n\n";
    
    const groupedItems = {};
    items.forEach(item => {
        if (!groupedItems[item.letter]) groupedItems[item.letter] = [];
        groupedItems[item.letter].push(item);
    });
    
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        if (groupedItems[letter]) {
            textToSave += `=== ${letter} ===\n`;
            groupedItems[letter].forEach(item => {
                textToSave += `[${item.checked ? 'v' : ' '}] ${item.starred ? '★ ' : '  '}${item.text}\n`;
            });
            textToSave += "\n";
        }
    });
    
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista_animes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função para importar lista
function importList() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const text = e.target.result;
            const importedItems = [];
            let currentLetter = '';
            
            text.split('\n').forEach(line => {
                line = line.trim();
                
                // Detecta seção de letra
                if (line.startsWith('=== ') && line.endsWith(' ===')) {
                    currentLetter = line.replace(/===/g, '').trim();
                }
                // Parseia linhas de itens
                else if (line.match(/^\[[ xv]\]/)) {
                    const checked = line[1] !== ' ';
                    const starred = line.includes('★');
                    const textStart = line.indexOf(']') + 1;
                    const itemText = line.slice(textStart).replace(/★/g, '').trim();
                    
                    if (itemText) {
                        importedItems.push({
                            text: itemText,
                            checked: checked,
                            starred: starred,
                            letter: itemText[0].toUpperCase()
                        });
                    }
                }
            });
            
            if (importedItems.length > 0) {
                if (confirm(`Deseja substituir a lista atual por esta importada? (${importedItems.length} itens encontrados)`)) {
                    items = importedItems;
                    saveItems();
                    updateDisplay();
                }
            } else {
                alert('Nenhum item válido encontrado no arquivo!');
            }
        };
        
        reader.readAsText(file);
    };
    
    fileInput.click();
}

// Função para limpar tudo
function clearAll() {
    if(confirm("Tem certeza que quer apagar TODOS os itens? OLHA A BURRADA, EIN!? NÃO TEM VOLTA!")) {
        localStorage.removeItem('items');
        items = [];
        updateDisplay();
    }
}

// Event listeners
document.getElementById('itemInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addItem();
});

// Inicializar
updateDisplay();