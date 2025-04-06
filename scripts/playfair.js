// Playfair Cipher Implementation
const playfairCipher = {
    generateMatrix: function (key) {
        key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
        const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // No J
        let matrix = [];
        let used = {};

        // Add key characters to matrix
        for (let char of key) {
            if (!used[char]) {
                matrix.push(char);
                used[char] = true;
            }
        }

        // Add remaining alphabet characters
        for (let char of alphabet) {
            if (!used[char]) {
                matrix.push(char);
                used[char] = true;
            }
        }

        // Convert to 5x5 grid
        let grid = [];
        for (let i = 0; i < 5; i++) {
            grid.push(matrix.slice(i * 5, (i + 1) * 5));
        }

        return grid;
    },

    getPosition: function (matrix, char) {
        char = char === 'J' ? 'I' : char;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (matrix[i][j] === char) {
                    return [i, j];
                }
            }
        }
        return [-1, -1];
    },

    createDigraphs: function (text) {
        text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
        let digraphs = [];

        for (let i = 0; i < text.length; i += 2) {
            if (i + 1 >= text.length) {
                digraphs.push(text[i] + 'X');
            } else if (text[i] === text[i + 1]) {
                digraphs.push(text[i] + 'X');
                i--;
            } else {
                digraphs.push(text[i] + text[i + 1]);
            }
        }

        return digraphs;
    },

    encrypt: function (plaintext, key) {
        const matrix = this.generateMatrix(key);
        const digraphs = this.createDigraphs(plaintext);

        return digraphs.map(digraph => {
            const [row1, col1] = this.getPosition(matrix, digraph[0]);
            const [row2, col2] = this.getPosition(matrix, digraph[1]);

            if (row1 === row2) {
                // Same row - take chars to the right
                return matrix[row1][(col1 + 1) % 5] + matrix[row2][(col2 + 1) % 5];
            } else if (col1 === col2) {
                // Same column - take chars below
                return matrix[(row1 + 1) % 5][col1] + matrix[(row2 + 1) % 5][col2];
            } else {
                // Rectangle - take chars at opposite corners
                return matrix[row1][col2] + matrix[row2][col1];
            }
        }).join(' ');
    },

    decrypt: function (ciphertext, key) {
        const matrix = this.generateMatrix(key);
        // Fix: Handle spaces in ciphertext properly
        const digraphs = ciphertext.replace(/\s+/g, ' ').toUpperCase().split(' ');

        return digraphs.map(digraph => {
            // Skip empty digraphs that might result from split
            if (!digraph || digraph.length !== 2) return '';
            
            const [row1, col1] = this.getPosition(matrix, digraph[0]);
            const [row2, col2] = this.getPosition(matrix, digraph[1]);

            if (row1 === row2) {
                // Same row - take chars to the left
                return matrix[row1][(col1 + 4) % 5] + matrix[row2][(col2 + 4) % 5];
            } else if (col1 === col2) {
                // Same column - take chars above
                return matrix[(row1 + 4) % 5][col1] + matrix[(row2 + 4) % 5][col2];
            } else {
                // Rectangle - take chars at opposite corners
                return matrix[row1][col2] + matrix[row2][col1];
            }
        }).join('');
    },

    renderMatrix: function (container, matrix) {
        container.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';

            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = matrix[i][j];
                row.appendChild(cell);
            }

            container.appendChild(row);
        }
    },

    animateEncryption: function (container, digraphs, matrix, delay = 800) {
        container.innerHTML = '';
        let outputDigraphs = [];

        // Create boxes for digraphs
        const digraphsDisplay = document.createElement('div');
        digraphsDisplay.style.display = 'flex';
        digraphsDisplay.style.flexWrap = 'wrap';
        digraphsDisplay.style.gap = '10px';
        digraphsDisplay.style.marginBottom = '20px';
        container.appendChild(digraphsDisplay);

        // Display explanation area
        const explanationArea = document.createElement('div');
        explanationArea.className = 'step';
        container.appendChild(explanationArea);

        let currentIndex = 0;

        function animateNext() {
            if (currentIndex < digraphs.length) {
                const digraph = digraphs[currentIndex];

                // Create box for this digraph
                const digraphBox = document.createElement('div');
                digraphBox.style.display = 'flex';
                digraphBox.style.border = '1px solid #ddd';
                digraphBox.style.padding = '5px';

                const char1 = document.createElement('div');
                char1.className = 'char-box';
                char1.textContent = digraph[0];

                const char2 = document.createElement('div');
                char2.className = 'char-box';
                char2.textContent = digraph[1];

                digraphBox.appendChild(char1);
                digraphBox.appendChild(char2);
                digraphsDisplay.appendChild(digraphBox);

                // Get positions
                const [row1, col1] = playfairCipher.getPosition(matrix, digraph[0]);
                const [row2, col2] = playfairCipher.getPosition(matrix, digraph[1]);

                // Show explanation
                explanationArea.innerHTML = `
                    <div class="step-title">Processing digraph: ${digraph}</div>
                    <p>${digraph[0]} is at position (${row1 + 1},${col1 + 1})</p>
                    <p>${digraph[1]} is at position (${row2 + 1},${col2 + 1})</p>
                `;

                setTimeout(() => {
                    // Determine the rule and encrypted chars
                    let encryptedDigraph = '';

                    if (row1 === row2) {
                        // Same row
                        encryptedDigraph = matrix[row1][(col1 + 1) % 5] + matrix[row2][(col2 + 1) % 5];
                        explanationArea.innerHTML += `
                            <p>Both letters are in the same row. Take letters to the right:</p>
                            <p>${digraph[0]} → ${matrix[row1][(col1 + 1) % 5]}</p>
                            <p>${digraph[1]} → ${matrix[row2][(col2 + 1) % 5]}</p>
                        `;
                    } else if (col1 === col2) {
                        // Same column
                        encryptedDigraph = matrix[(row1 + 1) % 5][col1] + matrix[(row2 + 1) % 5][col2];
                        explanationArea.innerHTML += `
                            <p>Both letters are in the same column. Take letters below:</p>
                            <p>${digraph[0]} → ${matrix[(row1 + 1) % 5][col1]}</p>
                            <p>${digraph[1]} → ${matrix[(row2 + 1) % 5][col2]}</p>
                        `;
                    } else {
                        // Rectangle
                        encryptedDigraph = matrix[row1][col2] + matrix[row2][col1];
                        explanationArea.innerHTML += `
                            <p>Letters form a rectangle. Take letters at opposite corners:</p>
                            <p>${digraph[0]} → ${matrix[row1][col2]}</p>
                            <p>${digraph[1]} → ${matrix[row2][col1]}</p>
                        `;
                    }

                    // Update digraph display
                    char1.style.textDecoration = 'line-through';
                    char2.style.textDecoration = 'line-through';

                    const encChar1 = document.createElement('div');
                    encChar1.className = 'char-box encrypted';
                    encChar1.textContent = encryptedDigraph[0];

                    const encChar2 = document.createElement('div');
                    encChar2.className = 'char-box encrypted';
                    encChar2.textContent = encryptedDigraph[1];

                    digraphBox.appendChild(encChar1);
                    digraphBox.appendChild(encChar2);

                    // Add to output
                    outputDigraphs.push(encryptedDigraph);

                    // Move to next digraph
                    currentIndex++;
                    setTimeout(animateNext, delay);
                }, delay / 2);
            } else {
                // All done, show final output
                explanationArea.innerHTML = `
                    <div class="step-title">Encryption Complete</div>
                    <p>Final output: ${outputDigraphs.join(' ')}</p>
                `;
            }
        }

        animateNext();
    },
    
    animateDecryption: function (container, digraphs, matrix, delay = 800) {
        container.innerHTML = '';
        let outputDigraphs = [];

        // Create boxes for digraphs
        const digraphsDisplay = document.createElement('div');
        digraphsDisplay.style.display = 'flex';
        digraphsDisplay.style.flexWrap = 'wrap';
        digraphsDisplay.style.gap = '10px';
        digraphsDisplay.style.marginBottom = '20px';
        container.appendChild(digraphsDisplay);

        // Display explanation area
        const explanationArea = document.createElement('div');
        explanationArea.className = 'step';
        container.appendChild(explanationArea);

        let currentIndex = 0;

        function animateNext() {
            if (currentIndex < digraphs.length) {
                const digraph = digraphs[currentIndex];

                // Skip empty digraphs that might result from split
                if (!digraph || digraph.length !== 2) {
                    currentIndex++;
                    animateNext();
                    return;
                }

                // Create box for this digraph
                const digraphBox = document.createElement('div');
                digraphBox.style.display = 'flex';
                digraphBox.style.border = '1px solid #ddd';
                digraphBox.style.padding = '5px';

                const char1 = document.createElement('div');
                char1.className = 'char-box';
                char1.textContent = digraph[0];

                const char2 = document.createElement('div');
                char2.className = 'char-box';
                char2.textContent = digraph[1];

                digraphBox.appendChild(char1);
                digraphBox.appendChild(char2);
                digraphsDisplay.appendChild(digraphBox);

                // Get positions
                const [row1, col1] = playfairCipher.getPosition(matrix, digraph[0]);
                const [row2, col2] = playfairCipher.getPosition(matrix, digraph[1]);

                // Show explanation
                explanationArea.innerHTML = `
                    <div class="step-title">Processing digraph: ${digraph}</div>
                    <p>${digraph[0]} is at position (${row1 + 1},${col1 + 1})</p>
                    <p>${digraph[1]} is at position (${row2 + 1},${col2 + 1})</p>
                `;

                setTimeout(() => {
                    // Determine the rule and decrypted chars
                    let decryptedDigraph = '';

                    if (row1 === row2) {
                        // Same row - take chars to the left
                        decryptedDigraph = matrix[row1][(col1 + 4) % 5] + matrix[row2][(col2 + 4) % 5];
                        explanationArea.innerHTML += `
                            <p>Both letters are in the same row. Take letters to the left:</p>
                            <p>${digraph[0]} → ${matrix[row1][(col1 + 4) % 5]}</p>
                            <p>${digraph[1]} → ${matrix[row2][(col2 + 4) % 5]}</p>
                        `;
                    } else if (col1 === col2) {
                        // Same column - take chars above
                        decryptedDigraph = matrix[(row1 + 4) % 5][col1] + matrix[(row2 + 4) % 5][col2];
                        explanationArea.innerHTML += `
                            <p>Both letters are in the same column. Take letters above:</p>
                            <p>${digraph[0]} → ${matrix[(row1 + 4) % 5][col1]}</p>
                            <p>${digraph[1]} → ${matrix[(row2 + 4) % 5][col2]}</p>
                        `;
                    } else {
                        // Rectangle - take chars at opposite corners
                        decryptedDigraph = matrix[row1][col2] + matrix[row2][col1];
                        explanationArea.innerHTML += `
                            <p>Letters form a rectangle. Take letters at opposite corners:</p>
                            <p>${digraph[0]} → ${matrix[row1][col2]}</p>
                            <p>${digraph[1]} → ${matrix[row2][col1]}</p>
                        `;
                    }

                    // Update digraph display
                    char1.style.textDecoration = 'line-through';
                    char2.style.textDecoration = 'line-through';

                    const decChar1 = document.createElement('div');
                    decChar1.className = 'char-box decrypted';
                    decChar1.textContent = decryptedDigraph[0];

                    const decChar2 = document.createElement('div');
                    decChar2.className = 'char-box decrypted';
                    decChar2.textContent = decryptedDigraph[1];

                    digraphBox.appendChild(decChar1);
                    digraphBox.appendChild(decChar2);

                    // Add to output
                    outputDigraphs.push(decryptedDigraph);

                    // Move to next digraph
                    currentIndex++;
                    setTimeout(animateNext, delay);
                }, delay / 2);
            } else {
                // All done, show final output
                explanationArea.innerHTML = `
                    <div class="step-title">Decryption Complete</div>
                    <p>Final output: ${outputDigraphs.join('')}</p>
                `;
            }
        }

        animateNext();
    }
};

// Add mode selection UI
document.addEventListener('DOMContentLoaded', function() {
    // Check if elements already exist
    if (!document.getElementById('playfair-mode-container')) {
        const modeContainer = document.createElement('div');
        modeContainer.id = 'playfair-mode-container';
        modeContainer.className = 'mode-selection';
        modeContainer.innerHTML = `
            <label>
                <input type="radio" name="playfair-mode" value="encrypt" checked> Encrypt
            </label>
            <label>
                <input type="radio" name="playfair-mode" value="decrypt"> Decrypt
            </label>
        `;
        
        const buttonGroup = document.querySelector('#playfair .button-group');
        buttonGroup.parentNode.insertBefore(modeContainer, buttonGroup);
    }
});

// Playfair Cipher Event Listeners
document.getElementById('playfair-encrypt').addEventListener('click', () => {
    const input = document.getElementById('playfair-input').value;
    const key = document.getElementById('playfair-key').value;
    const isEncryptMode = document.querySelector('input[name="playfair-mode"]:checked').value === 'encrypt';

    const matrix = playfairCipher.generateMatrix(key);
    playfairCipher.renderMatrix(document.getElementById('playfair-matrix'), matrix);

    if (isEncryptMode) {
        const digraphs = playfairCipher.createDigraphs(input);
        document.getElementById('playfair-digraphs').textContent = digraphs.join(' ');
        
        const encrypted = playfairCipher.encrypt(input, key);
        document.getElementById('playfair-output').textContent = encrypted;
    } else {
        // For decryption, just show the input as is for digraphs
        const digraphs = input.replace(/\s+/g, ' ').toUpperCase().split(' ');
        document.getElementById('playfair-digraphs').textContent = digraphs.join(' ');
        
        const decrypted = playfairCipher.decrypt(input, key);
        document.getElementById('playfair-output').textContent = decrypted;
    }
});

document.getElementById('playfair-decrypt').addEventListener('click', () => {
    const input = document.getElementById('playfair-input').value;
    const key = document.getElementById('playfair-key').value;

    const matrix = playfairCipher.generateMatrix(key);
    playfairCipher.renderMatrix(document.getElementById('playfair-matrix'), matrix);

    // Display digraphs of the ciphertext
    const digraphs = input.replace(/\s+/g, ' ').toUpperCase().split(' ');
    document.getElementById('playfair-digraphs').textContent = digraphs.join(' ');

    const decrypted = playfairCipher.decrypt(input, key);
    document.getElementById('playfair-output').textContent = decrypted;
});

document.getElementById('playfair-animate').addEventListener('click', () => {
    const input = document.getElementById('playfair-input').value;
    const key = document.getElementById('playfair-key').value;
    const isEncryptMode = document.querySelector('input[name="playfair-mode"]:checked').value === 'encrypt';

    const matrix = playfairCipher.generateMatrix(key);
    playfairCipher.renderMatrix(document.getElementById('playfair-matrix'), matrix);

    if (isEncryptMode) {
        const digraphs = playfairCipher.createDigraphs(input);
        document.getElementById('playfair-digraphs').textContent = digraphs.join(' ');
        
        playfairCipher.animateEncryption(
            document.getElementById('playfair-animation'),
            digraphs,
            matrix
        );
    } else {
        // For decryption animation
        const digraphs = input.replace(/\s+/g, ' ').toUpperCase().split(' ');
        document.getElementById('playfair-digraphs').textContent = digraphs.join(' ');
        
        playfairCipher.animateDecryption(
            document.getElementById('playfair-animation'),
            digraphs,
            matrix
        );
    }
});