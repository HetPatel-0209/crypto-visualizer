// Hill Cipher Implementation
const hillCipher = {
    mod: function (n, m) {
        return ((n % m) + m) % m;
    },

    matrixMult: function (a, b, mod = 26) {
        let result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                result[i][j] = 0;
                for (let k = 0; k < a[0].length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
                result[i][j] = this.mod(result[i][j], mod);
            }
        }
        return result;
    },

    charToNum: function (char) {
        return char.toUpperCase().charCodeAt(0) - 65;
    },

    numToChar: function (num) {
        return String.fromCharCode(num + 65);
    },

    encrypt: function (plaintext, keyMatrix) {
        plaintext = plaintext.replace(/[^A-Za-z]/g, '').toUpperCase();
        
        // If odd length, pad with X
        if (plaintext.length % 2 !== 0) {
            plaintext += 'X';
        }
        
        try {
            // Convert plaintext to number matrix (digraphs)
            let columns = [];
            for (let i = 0; i < plaintext.length; i += 2) {
                let col = [
                    [this.charToNum(plaintext[i])],
                    [this.charToNum(plaintext[i + 1])]
                ];
                columns.push(col);
            }
            
            // Apply key using matrix multiplication
            let result = '';
            for (let i = 0; i < columns.length; i++) {
                let encrypted = this.matrixMult(keyMatrix, columns[i]);
                for (let j = 0; j < encrypted.length; j++) {
                    result += this.numToChar(encrypted[j][0]);
                }
            }
            
            return result;
        } catch (e) {
            console.error("Encryption error:", e);
            return "Error: " + e.message;
        }
    },

    determinant: function (matrix) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    },

    modInverse: function (a, m) {
        // Find modular multiplicative inverse
        for (let x = 1; x < m; x++) {
            if ((a * x) % m === 1) {
                return x;
            }
        }
        throw new Error("Modular inverse does not exist");
    },

    inverseMatrix: function (matrix) {
        let det = this.determinant(matrix);
        det = this.mod(det, 26);
        
        // Check if determinant is invertible in Z26
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        if (gcd(det, 26) !== 1) {
            throw new Error("Matrix is not invertible in Z26. Try different values for the key matrix.");
        }
        
        let detInv;
        try {
            detInv = this.modInverse(det, 26);
        } catch (e) {
            throw new Error("Matrix is not invertible: " + e.message);
        }
        
        // Create adjugate matrix
        let adj = [
            [matrix[1][1], -matrix[0][1]],
            [-matrix[1][0], matrix[0][0]]
        ];
        
        // Apply modular arithmetic and multiply by inverse of determinant
        let inv = [
            [this.mod(adj[0][0] * detInv, 26), this.mod(adj[0][1] * detInv, 26)],
            [this.mod(adj[1][0] * detInv, 26), this.mod(adj[1][1] * detInv, 26)]
        ];
        
        return inv;
    },

    decrypt: function (ciphertext, keyMatrix) {
        try {
            // Validate input
            if (!ciphertext || ciphertext.length === 0) {
                throw new Error("Empty ciphertext");
            }
            
            if (ciphertext.length % 2 !== 0) {
                throw new Error("Ciphertext length must be even");
            }
            
            // Find inverse of key matrix
            const invKey = this.inverseMatrix(keyMatrix);
            
            // Use the inverse key to decrypt
            return this.encrypt(ciphertext, invKey);
        } catch (e) {
            console.error("Decryption error:", e);
            return "Error: " + e.message;
        }
    },

    validateKeyMatrix: function(keyMatrix) {
        // Check if matrix is 2x2
        if (!keyMatrix || !Array.isArray(keyMatrix) || keyMatrix.length !== 2) {
            throw new Error("Key matrix must be 2x2");
        }
        
        for (let i = 0; i < 2; i++) {
            if (!Array.isArray(keyMatrix[i]) || keyMatrix[i].length !== 2) {
                throw new Error("Key matrix must be 2x2");
            }
            
            for (let j = 0; j < 2; j++) {
                if (typeof keyMatrix[i][j] !== 'number' || isNaN(keyMatrix[i][j])) {
                    throw new Error("Key matrix must contain only numbers");
                }
            }
        }
        
        // Check if determinant is invertible
        const det = this.determinant(keyMatrix);
        const modDet = this.mod(det, 26);
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        
        if (modDet === 0 || gcd(modDet, 26) !== 1) {
            throw new Error("Matrix is not invertible in Z26. Try different values.");
        }
        
        return true;
    },

    animateCalculation: function (container, plaintext, keyMatrix, isEncrypt) {
        container.innerHTML = '';
        plaintext = plaintext.replace(/[^A-Za-z]/g, '').toUpperCase();

        // If odd length, pad with X
        if (plaintext.length % 2 !== 0) {
            plaintext += 'X';
        }

        try {
            // Validate key matrix first
            this.validateKeyMatrix(keyMatrix);
            
            // Use inverse key matrix for decryption
            let workingKeyMatrix = keyMatrix;
            let operationDescription = "Encryption";
            
            if (!isEncrypt) {
                try {
                    workingKeyMatrix = this.inverseMatrix(keyMatrix);
                    operationDescription = "Decryption (using inverse key matrix)";
                } catch (e) {
                    container.innerHTML = `<div class="error">Error: ${e.message}</div>`;
                    return;
                }
            }

            // Display key matrix
            const keyDisplay = document.createElement('div');
            keyDisplay.innerHTML = `
                        <div class="step-title">${operationDescription}:</div>
                        <div style="display: flex; margin-bottom: 20px;">
                            <div style="margin-right: 5px;">Key Matrix (K) =</div>
                            <div>
                                [ ${workingKeyMatrix[0][0]}, ${workingKeyMatrix[0][1]} ]<br>
                                [ ${workingKeyMatrix[1][0]}, ${workingKeyMatrix[1][1]} ]
                            </div>
                        </div>
                    `;
            container.appendChild(keyDisplay);

            // Create animation element
            const animationContainer = document.createElement('div');
            animationContainer.className = 'hill-animation';
            container.appendChild(animationContainer);

            // Process each digraph with animation
            const runAnimation = async () => {
                let result = '';
                
                for (let i = 0; i < plaintext.length; i += 2) {
                    if (i >= plaintext.length - 1) break;
                    
                    const char1 = plaintext[i];
                    const char2 = plaintext[i + 1];
                    
                    const digraphContainer = document.createElement('div');
                    digraphContainer.className = 'digraph-calculation';
                    animationContainer.appendChild(digraphContainer);

                    // Setup calculation display
                    digraphContainer.innerHTML = `
                        <div class="step-title">Processing digraph: ${char1}${char2}</div>
                        <div class="calculation-step">
                            <div>Convert to numbers: ${char1} = ${char1.charCodeAt(0) - 65}, ${char2} = ${char2.charCodeAt(0) - 65}</div>
                            <div>Create column vector: 
                                <div style="display: inline-block; margin-left: 10px;">
                                    [ ${char1.charCodeAt(0) - 65} ]<br>
                                    [ ${char2.charCodeAt(0) - 65} ]
                                </div>
                            </div>
                        </div>
                    `;

                    // Matrix multiplication
                    const n1 = char1.charCodeAt(0) - 65;
                    const n2 = char2.charCodeAt(0) - 65;
                    
                    // Calculate result vector
                    const r1 = this.mod((workingKeyMatrix[0][0] * n1 + workingKeyMatrix[0][1] * n2), 26);
                    const r2 = this.mod((workingKeyMatrix[1][0] * n1 + workingKeyMatrix[1][1] * n2), 26);
                    
                    // Convert back to letters
                    const resultChar1 = String.fromCharCode(r1 + 65);
                    const resultChar2 = String.fromCharCode(r2 + 65);

                    // Add calculation details with animation
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const calculationStep = document.createElement('div');
                    calculationStep.className = 'calculation-step matrix-mult';
                    calculationStep.innerHTML = `
                        <div>Matrix multiplication:</div>
                        <div style="margin: 10px 0; display: flex; align-items: center;">
                            <div style="margin-right: 10px;">
                                [ ${workingKeyMatrix[0][0]}, ${workingKeyMatrix[0][1]} ]<br>
                                [ ${workingKeyMatrix[1][0]}, ${workingKeyMatrix[1][1]} ]
                            </div>
                            ×
                            <div style="margin: 0 10px;">
                                [ ${n1} ]<br>
                                [ ${n2} ]
                            </div>
                            =
                            <div style="margin-left: 10px;" class="result-matrix">
                                [ ${r1} ]<br>
                                [ ${r2} ]
                            </div>
                        </div>
                    `;
                    digraphContainer.appendChild(calculationStep);

                    await new Promise(resolve => setTimeout(resolve, 500));

                    const conversionStep = document.createElement('div');
                    conversionStep.className = 'calculation-step';
                    conversionStep.innerHTML = `
                        <div>Convert back to letters:</div>
                        <div style="margin: 10px 0;">
                            ${r1} → ${resultChar1}, ${r2} → ${resultChar2}
                        </div>
                        <div>Result for this digraph: <strong>${resultChar1}${resultChar2}</strong></div>
                    `;
                    digraphContainer.appendChild(conversionStep);

                    result += resultChar1 + resultChar2;
                    await new Promise(resolve => setTimeout(resolve, 700));
                }

                // Final result
                const resultDisplay = document.createElement('div');
                resultDisplay.className = 'final-result';
                resultDisplay.innerHTML = `
                    <div class="step-title">Final ${isEncrypt ? 'Encrypted' : 'Decrypted'} Output:</div>
                    <div style="font-size: 1.2em; font-weight: bold; margin-top: 10px;">${result}</div>
                `;
                container.appendChild(resultDisplay);

                return result;
            };

            runAnimation();
        } catch (e) {
            container.innerHTML = `<div class="error" style="color: red; padding: 10px; border: 1px solid red;">Error: ${e.message}</div>`;
            return;
        }
    }
};

// Add mode selection UI
document.addEventListener('DOMContentLoaded', function() {
    // Check if elements already exist
    if (!document.getElementById('hill-mode-container')) {
        const modeContainer = document.createElement('div');
        modeContainer.id = 'hill-mode-container';
        modeContainer.className = 'mode-selection';
        modeContainer.innerHTML = `
            <label>
                <input type="radio" name="hill-mode" value="encrypt" checked> Encrypt
            </label>
            <label>
                <input type="radio" name="hill-mode" value="decrypt"> Decrypt
            </label>
        `;
        
        const buttonGroup = document.querySelector('#hill .button-group');
        buttonGroup.parentNode.insertBefore(modeContainer, buttonGroup);
    }
});

// Hill Cipher Event Listeners
document.getElementById('hill-encrypt').addEventListener('click', () => {
    const input = document.getElementById('hill-input').value;
    const isEncryptMode = document.querySelector('input[name="hill-mode"]:checked').value === 'encrypt';
    
    // Get key matrix values
    const keyMatrix = [
        [parseInt(document.getElementById('hill-k11').value), parseInt(document.getElementById('hill-k12').value)],
        [parseInt(document.getElementById('hill-k21').value), parseInt(document.getElementById('hill-k22').value)]
    ];
    
    try {
        // Validate the key matrix first
        hillCipher.validateKeyMatrix(keyMatrix);
        
        const result = isEncryptMode ? 
            hillCipher.encrypt(input, keyMatrix) : 
            hillCipher.decrypt(input, keyMatrix);
        document.getElementById('hill-output').textContent = result;
    } catch (e) {
        document.getElementById('hill-output').textContent = "Error: " + e.message;
    }
});

document.getElementById('hill-decrypt').addEventListener('click', () => {
    const input = document.getElementById('hill-input').value;
    
    // Get key matrix values
    const keyMatrix = [
        [parseInt(document.getElementById('hill-k11').value), parseInt(document.getElementById('hill-k12').value)],
        [parseInt(document.getElementById('hill-k21').value), parseInt(document.getElementById('hill-k22').value)]
    ];
    
    try {
        // Validate the key matrix first
        hillCipher.validateKeyMatrix(keyMatrix);
        
        const decrypted = hillCipher.decrypt(input, keyMatrix);
        document.getElementById('hill-output').textContent = decrypted;
    } catch (e) {
        document.getElementById('hill-output').textContent = "Error: " + e.message;
    }
});

document.getElementById('hill-animate').addEventListener('click', () => {
    const input = document.getElementById('hill-input').value;
    const isEncryptMode = document.querySelector('input[name="hill-mode"]:checked').value === 'encrypt';
    
    // Get key matrix values
    const keyMatrix = [
        [parseInt(document.getElementById('hill-k11').value), parseInt(document.getElementById('hill-k12').value)],
        [parseInt(document.getElementById('hill-k21').value), parseInt(document.getElementById('hill-k22').value)]
    ];
    
    // Clear previous calculation display
    document.getElementById('hill-calculation').innerHTML = '';
    
    // Animate the calculation
    hillCipher.animateCalculation(
        document.getElementById('hill-calculation'),
        input,
        keyMatrix,
        isEncryptMode
    );
});