// Monoalphabetic Cipher Implementation
const monoalphaCipher = {
    encrypt: function (text, key) {
        return this.process(text, key, true);
    },

    decrypt: function (text, key) {
        return this.process(text, key, false);
    },

    process: function (text, key, isEncrypt) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        text = text.toUpperCase();
        key = key.toUpperCase();

        // Create substitution map
        let map = {};
        if (isEncrypt) {
            for (let i = 0; i < 26; i++) {
                map[alphabet[i]] = key[i];
            }
        } else {
            for (let i = 0; i < 26; i++) {
                map[key[i]] = alphabet[i];
            }
        }

        // Apply substitution
        return text.split('').map(char => {
            return char.match(/[A-Z]/) ? map[char] : char;
        }).join('');
    },

    animateStep: function (container, input, key, isEncrypt, delay = 500) {
        container.innerHTML = '';
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // Create character boxes
        const chars = input.toUpperCase().split('');
        const charBoxes = chars.map(char => {
            const box = document.createElement('div');
            box.className = 'char-box';
            box.textContent = char;
            container.appendChild(box);
            return box;
        });

        // Create substitution map
        let map = {};
        if (isEncrypt) {
            for (let i = 0; i < 26; i++) {
                map[alphabet[i]] = key[i];
            }
        } else {
            for (let i = 0; i < 26; i++) {
                map[key[i]] = alphabet[i];
            }
        }

        // Animate each character transformation
        let currentIndex = 0;

        function animateNext() {
            if (currentIndex < chars.length) {
                // Highlight current character
                charBoxes[currentIndex].classList.add('highlight');

                // Wait and then transform
                setTimeout(() => {
                    if (chars[currentIndex].match(/[A-Z]/)) {
                        const newChar = map[chars[currentIndex]];

                        // Show substitution details in a tooltip
                        const tooltip = document.createElement('div');
                        tooltip.className = 'char-tooltip';
                        tooltip.innerHTML = `${chars[currentIndex]} ${isEncrypt ? '→' : '←'} ${newChar}<br>
                                           ${isEncrypt ? 'Substituting with cipher alphabet' : 'Reverse lookup in cipher alphabet'}`;
                        charBoxes[currentIndex].appendChild(tooltip);

                        setTimeout(() => {
                            charBoxes[currentIndex].classList.remove('highlight');
                            charBoxes[currentIndex].classList.add(isEncrypt ? 'encrypted' : 'decrypted');
                            charBoxes[currentIndex].textContent = newChar;
                            currentIndex++;
                            animateNext();
                        }, delay / 2);
                    } else {
                        currentIndex++;
                        animateNext();
                    }
                }, delay);
            }
        }

        animateNext();
    }
};

// Add mode selection UI
document.addEventListener('DOMContentLoaded', function() {
    // Check if elements already exist
    if (!document.getElementById('mono-mode-container')) {
        const modeContainer = document.createElement('div');
        modeContainer.id = 'mono-mode-container';
        modeContainer.className = 'mode-selection';
        modeContainer.innerHTML = `
            <label>
                <input type="radio" name="mono-mode" value="encrypt" checked> Encrypt
            </label>
            <label>
                <input type="radio" name="mono-mode" value="decrypt"> Decrypt
            </label>
        `;
        
        const buttonGroup = document.querySelector('#monoalpha .button-group');
        buttonGroup.parentNode.insertBefore(modeContainer, buttonGroup);
    }
});

// Monoalphabetic Cipher Event Listeners
document.getElementById('mono-encrypt').addEventListener('click', () => {
    const input = document.getElementById('mono-input').value;
    const key = document.getElementById('mono-key').value;
    const isEncryptMode = document.querySelector('input[name="mono-mode"]:checked').value === 'encrypt';

    if (key.length !== 26) {
        alert('Key must be exactly 26 characters!');
        return;
    }

    const result = isEncryptMode ? 
        monoalphaCipher.encrypt(input, key) : 
        monoalphaCipher.decrypt(input, key);
    document.getElementById('mono-output').textContent = result;
});

document.getElementById('mono-decrypt').addEventListener('click', () => {
    const input = document.getElementById('mono-input').value;
    const key = document.getElementById('mono-key').value;

    if (key.length !== 26) {
        alert('Key must be exactly 26 characters!');
        return;
    }

    const decrypted = monoalphaCipher.decrypt(input, key);
    document.getElementById('mono-output').textContent = decrypted;
});

document.getElementById('mono-animate').addEventListener('click', () => {
    const input = document.getElementById('mono-input').value;
    const key = document.getElementById('mono-key').value;
    const isEncryptMode = document.querySelector('input[name="mono-mode"]:checked').value === 'encrypt';

    if (key.length !== 26) {
        alert('Key must be exactly 26 characters!');
        return;
    }

    // Update the map display
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    document.getElementById('mono-map-display').innerHTML = `
        <div style="display: flex; flex-wrap: wrap; margin-bottom: 10px;">
            <div style="margin-right: 10px;"><strong>Original:</strong> ${alphabet}</div>
        </div>
        <div style="display: flex; flex-wrap: wrap;">
            <div><strong>Substitution:</strong> ${key.toUpperCase()}</div>
        </div>
        <div style="margin-top: 10px; font-style: italic; font-size: 0.9em;">
            ${isEncryptMode ? 'Encrypting by replacing each letter with its corresponding letter in the substitution alphabet' : 
                            'Decrypting by finding each letter in the substitution alphabet and replacing with its original letter'}
        </div>
    `;

    monoalphaCipher.animateStep(
        document.getElementById('mono-animation'),
        input,
        key,
        isEncryptMode
    );

    // Update output after animation
    setTimeout(() => {
        const result = isEncryptMode ? 
            monoalphaCipher.encrypt(input, key) : 
            monoalphaCipher.decrypt(input, key);
        document.getElementById('mono-output').textContent = result;
    }, input.length * 500 + 100);
});