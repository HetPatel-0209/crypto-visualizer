// Rail Fence Cipher Implementation
const railFenceCipher = {
    encrypt: function (text, rails) {
        text = text.replace(/\s/g, '').toUpperCase();
        
        // Check for valid input
        if (rails <= 1) return text;
        if (text.length <= rails) return text;
        
        // Create empty fence
        let fence = [];
        for (let i = 0; i < rails; i++) {
            fence.push([]);
        }
        
        // Fill the fence
        let rail = 0;
        let direction = 1;
        
        for (let i = 0; i < text.length; i++) {
            fence[rail].push(text[i]);
            
            rail += direction;
            
            if (rail === 0 || rail === rails - 1) {
                direction *= -1;
            }
        }
        
        // Read off the fence
        let result = '';
        for (let i = 0; i < rails; i++) {
            result += fence[i].join('');
        }
        
        return result;
    },
    
    decrypt: function (text, rails) {
        text = text.replace(/\s/g, '').toUpperCase();
        
        // Check for valid input
        if (rails <= 1) return text;
        if (text.length <= rails) return text;
        
        // Create empty fence with placeholders
        let fence = [];
        for (let i = 0; i < rails; i++) {
            fence.push(Array(text.length).fill(null));
        }
        
        // Mark valid positions with '*'
        let rail = 0;
        let direction = 1;
        
        for (let i = 0; i < text.length; i++) {
            fence[rail][i] = '*';
            
            rail += direction;
            
            if (rail === 0 || rail === rails - 1) {
                direction *= -1;
            }
        }
        
        // Fill the fence
        let index = 0;
        for (let i = 0; i < rails; i++) {
            for (let j = 0; j < text.length; j++) {
                if (fence[i][j] === '*' && index < text.length) {
                    fence[i][j] = text[index++];
                }
            }
        }
        
        // Read off in original order
        let result = '';
        rail = 0;
        direction = 1;
        
        for (let i = 0; i < text.length; i++) {
            result += fence[rail][i];
            
            rail += direction;
            
            if (rail === 0 || rail === rails - 1) {
                direction *= -1;
            }
        }
        
        return result;
    },

    renderRailFence: function (container, text, rails, isEncrypt) {
        container.innerHTML = '';
        text = text.replace(/\s/g, '').toUpperCase();

        if (isEncrypt) {
            this.renderEncryptionAnimation(container, text, rails);
        } else {
            this.renderDecryptionAnimation(container, text, rails);
        }
    },

    renderEncryptionAnimation: function (container, text, rails) {
        // Create rail containers
        const railContainers = [];
        for (let i = 0; i < rails; i++) {
            const rail = document.createElement('div');
            rail.className = 'rail';
            container.appendChild(rail);
            railContainers.push(rail);
        }

        // Plot characters in zigzag pattern
        let rail = 0;
        let direction = 1;
        const charPositions = [];

        for (let i = 0; i < text.length; i++) {
            const charBox = document.createElement('div');
            charBox.className = 'char-box';
            charBox.textContent = text[i];
            charBox.style.position = 'absolute';
            charBox.style.left = `${i * 50}px`;

            railContainers[rail].appendChild(charBox);
            charPositions.push({ rail, index: i, char: text[i] });

            rail += direction;
            if (rail === 0 || rail === rails - 1) {
                direction *= -1;
            }
        }

        // Add animation to show reading off by rail
        setTimeout(() => {
            const resultContainer = document.createElement('div');
            resultContainer.className = 'rail-result';
            resultContainer.innerHTML = '<div class="step-title">Reading off by rail:</div>';
            container.appendChild(resultContainer);

            let railIndex = 0;
            let resultText = '';

            function readNextRail() {
                if (railIndex >= rails) {
                    const finalResult = document.createElement('div');
                    finalResult.className = 'step-title';
                    finalResult.innerHTML = `<strong>Encrypted Result:</strong> ${resultText}`;
                    resultContainer.appendChild(finalResult);
                    return;
                }

                const railChars = charPositions.filter(p => p.rail === railIndex);
                railChars.sort((a, b) => a.index - b.index);

                const railResult = document.createElement('div');
                railResult.className = 'rail-reading';
                railResult.innerHTML = `<strong>Rail ${railIndex + 1}:</strong> `;
                resultContainer.appendChild(railResult);

                let delay = 0;
                railChars.forEach(pos => {
                    setTimeout(() => {
                        const boxes = railContainers[pos.rail].querySelectorAll('.char-box');
                        boxes.forEach((box, idx) => {
                            if (box.textContent === pos.char && 
                                parseInt(box.style.left) === pos.index * 50) {
                                box.classList.add('highlight');
                                setTimeout(() => {
                                    box.classList.add('encrypted');
                                    resultText += pos.char;
                                    railResult.innerHTML += pos.char;
                                }, 200);
                            }
                        });
                    }, delay);
                    delay += 300;
                });

                setTimeout(() => {
                    railIndex++;
                    readNextRail();
                }, delay + 300);
            }

            readNextRail();
        }, 1000);
    },

    renderDecryptionAnimation: function (container, ciphertext, rails) {
        // Create the fence structure first to show placement
        const fenceContainer = document.createElement('div');
        fenceContainer.className = 'fence-container';
        container.appendChild(fenceContainer);
        
        // Create the fence grid
        const fenceGrid = document.createElement('div');
        fenceGrid.className = 'fence-grid';
        fenceGrid.style.display = 'grid';
        fenceGrid.style.gridTemplateRows = `repeat(${rails}, 40px)`;
        fenceGrid.style.gridTemplateColumns = `repeat(${ciphertext.length}, 40px)`;
        fenceGrid.style.gap = '5px';
        fenceContainer.appendChild(fenceGrid);
        
        // Create empty fence with placeholders
        let fence = [];
        for (let i = 0; i < rails; i++) {
            fence.push(Array(ciphertext.length).fill(null));
        }
        
        // Mark valid positions with '*'
        let rail = 0;
        let direction = 1;
        
        for (let i = 0; i < ciphertext.length; i++) {
            fence[rail][i] = { pos: i, isValid: true };
            
            rail += direction;
            
            if (rail === 0 || rail === rails - 1) {
                direction *= -1;
            }
        }
        
        // Render the empty fence
        for (let i = 0; i < rails; i++) {
            for (let j = 0; j < ciphertext.length; j++) {
                const cell = document.createElement('div');
                cell.className = 'fence-cell';
                cell.style.width = '40px';
                cell.style.height = '40px';
                cell.style.display = 'flex';
                cell.style.justifyContent = 'center';
                cell.style.alignItems = 'center';
                cell.style.border = '1px solid #ddd';
                
                if (fence[i][j] && fence[i][j].isValid) {
                    cell.className += ' valid-position';
                    cell.style.backgroundColor = '#f0f0f0';
                }
                
                fenceGrid.appendChild(cell);
            }
        }
        
        // Animate filling the fence
        setTimeout(() => {
            let index = 0;
            const validCells = fenceGrid.querySelectorAll('.valid-position');
            
            function fillNextCell() {
                if (index >= ciphertext.length) {
                    // Start reading in zigzag order
                    setTimeout(readZigzag, 1000);
                    return;
                }
                
                validCells[index].textContent = ciphertext[index];
                validCells[index].classList.add('highlight');
                
                index++;
                setTimeout(fillNextCell, 200);
            }
            
            function readZigzag() {
                const resultContainer = document.createElement('div');
                resultContainer.className = 'decryption-result';
                resultContainer.innerHTML = '<div class="step-title">Reading in zigzag pattern:</div>';
                container.appendChild(resultContainer);
                
                let resultText = '';
                let r = 0;
                let dir = 1;
                let step = 0;
                
                function highlightNext() {
                    if (step >= ciphertext.length) {
                        const finalResult = document.createElement('div');
                        finalResult.className = 'step-title';
                        finalResult.innerHTML = `<strong>Decrypted Result:</strong> ${resultText}`;
                        resultContainer.appendChild(finalResult);
                        return;
                    }
                    
                    // Find the cell at the current zigzag position
                    const rowIndex = r;
                    const colIndex = step;
                    const cellIndex = rowIndex * ciphertext.length + colIndex;
                    const cells = fenceGrid.querySelectorAll('.fence-cell');
                    
                    if (cells[cellIndex].textContent) {
                        cells[cellIndex].classList.add('decrypted');
                        resultText += cells[cellIndex].textContent;
                        
                        // Display the current character being read
                        const charDisplay = document.createElement('span');
                        charDisplay.textContent = cells[cellIndex].textContent;
                        resultContainer.appendChild(charDisplay);
                    }
                    
                    r += dir;
                    if (r === 0 || r === rails - 1) {
                        dir *= -1;
                    }
                    
                    step++;
                    setTimeout(highlightNext, 300);
                }
                
                highlightNext();
            }
            
            fillNextCell();
        }, 1000);
    }
};

// Add mode selection UI
document.addEventListener('DOMContentLoaded', function() {
    // Check if elements already exist
    if (!document.getElementById('rail-mode-container')) {
        const modeContainer = document.createElement('div');
        modeContainer.id = 'rail-mode-container';
        modeContainer.className = 'mode-selection';
        modeContainer.innerHTML = `
            <label>
                <input type="radio" name="rail-mode" value="encrypt" checked> Encrypt
            </label>
            <label>
                <input type="radio" name="rail-mode" value="decrypt"> Decrypt
            </label>
        `;
        
        const buttonGroup = document.querySelector('#railfence .button-group');
        buttonGroup.parentNode.insertBefore(modeContainer, buttonGroup);
    }
});

// Rail Fence Cipher Event Listeners
document.getElementById('rail-encrypt').addEventListener('click', () => {
    const input = document.getElementById('rail-input').value;
    const rails = parseInt(document.getElementById('rail-count').value);
    const isEncryptMode = document.querySelector('input[name="rail-mode"]:checked').value === 'encrypt';
    
    if (isEncryptMode) {
        const encrypted = railFenceCipher.encrypt(input, rails);
        document.getElementById('rail-output').textContent = encrypted;
    } else {
        const decrypted = railFenceCipher.decrypt(input, rails);
        document.getElementById('rail-output').textContent = decrypted;
    }
});

document.getElementById('rail-decrypt').addEventListener('click', () => {
    const input = document.getElementById('rail-input').value;
    const rails = parseInt(document.getElementById('rail-count').value);
    
    const decrypted = railFenceCipher.decrypt(input, rails);
    document.getElementById('rail-output').textContent = decrypted;
});

document.getElementById('rail-animate').addEventListener('click', () => {
    const input = document.getElementById('rail-input').value;
    const rails = parseInt(document.getElementById('rail-count').value);
    const isEncryptMode = document.querySelector('input[name="rail-mode"]:checked').value === 'encrypt';
    
    railFenceCipher.renderRailFence(
        document.getElementById('rail-diagram'),
        input,
        rails,
        isEncryptMode
    );
});