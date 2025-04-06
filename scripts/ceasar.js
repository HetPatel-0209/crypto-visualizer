// Caesar Cipher Implementation
const caesarCipher = {
    encrypt: function (text, shift) {
        return this.process(text, shift, true);
    },

    decrypt: function (text, shift) {
        return this.process(text, shift, false);
    },

    process: function (text, shift, isEncrypt) {
        shift = isEncrypt ? shift : (26 - shift) % 26;
        return text.toUpperCase().split('').map(char => {
            if (char.match(/[A-Z]/)) {
                let code = char.charCodeAt(0);
                return String.fromCharCode(((code - 65 + shift) % 26) + 65);
            }
            return char;
        }).join('');
    },

    animateStep: function (container, input, shift, isEncrypt, delay = 500) {
        container.innerHTML = '';
        shift = isEncrypt ? shift : (26 - shift) % 26;

        // Create character boxes
        const chars = input.toUpperCase().split('');
        const charBoxes = chars.map(char => {
            const box = document.createElement('div');
            box.className = 'char-box';
            box.textContent = char;
            container.appendChild(box);
            return box;
        });

        // Animate each character transformation
        let currentIndex = 0;

        function animateNext() {
            if (currentIndex < chars.length) {
                // Highlight current character
                charBoxes[currentIndex].classList.add('highlight');

                // Wait and then transform
                setTimeout(() => {
                    if (chars[currentIndex].match(/[A-Z]/)) {
                        const code = chars[currentIndex].charCodeAt(0);
                        const newChar = String.fromCharCode(((code - 65 + shift) % 26) + 65);

                        // Show transition details in a tooltip
                        const tooltip = document.createElement('div');
                        tooltip.className = 'char-tooltip';
                        tooltip.innerHTML = `${chars[currentIndex]} ${isEncrypt ? '→' : '←'} ${newChar}<br>
                                            ${isEncrypt ? 'Shifted by +' : 'Shifted by -'}${isEncrypt ? shift : 26-shift}`;
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
    if (!document.getElementById('caesar-mode-container')) {
        const modeContainer = document.createElement('div');
        modeContainer.id = 'caesar-mode-container';
        modeContainer.className = 'mode-selection';
        modeContainer.innerHTML = `
            <label>
                <input type="radio" name="caesar-mode" value="encrypt" checked> Encrypt
            </label>
            <label>
                <input type="radio" name="caesar-mode" value="decrypt"> Decrypt
            </label>
        `;
        
        const buttonGroup = document.querySelector('#caesar .button-group');
        buttonGroup.parentNode.insertBefore(modeContainer, buttonGroup);
    }
});

// Caesar Cipher Event Listeners
document.getElementById('caesar-encrypt').addEventListener('click', () => {
    const input = document.getElementById('caesar-input').value;
    const shift = parseInt(document.getElementById('caesar-shift').value) % 26;
    const isEncryptMode = document.querySelector('input[name="caesar-mode"]:checked').value === 'encrypt';

    document.getElementById('caesar-input-display').textContent = input.toUpperCase();
    const result = isEncryptMode ? 
        caesarCipher.encrypt(input, shift) : 
        caesarCipher.decrypt(input, shift);
    document.getElementById('caesar-output').textContent = result;
});

document.getElementById('caesar-decrypt').addEventListener('click', () => {
    const input = document.getElementById('caesar-input').value;
    const shift = parseInt(document.getElementById('caesar-shift').value) % 26;

    document.getElementById('caesar-input-display').textContent = input.toUpperCase();
    const decrypted = caesarCipher.decrypt(input, shift);
    document.getElementById('caesar-output').textContent = decrypted;
});

document.getElementById('caesar-animate').addEventListener('click', () => {
    const input = document.getElementById('caesar-input').value;
    const shift = parseInt(document.getElementById('caesar-shift').value) % 26;
    const isEncryptMode = document.querySelector('input[name="caesar-mode"]:checked').value === 'encrypt';

    document.getElementById('caesar-input-display').textContent = input.toUpperCase();
    caesarCipher.animateStep(
        document.getElementById('caesar-animation'),
        input,
        shift,
        isEncryptMode
    );

    // Update output after animation
    setTimeout(() => {
        const result = isEncryptMode ? 
            caesarCipher.encrypt(input, shift) : 
            caesarCipher.decrypt(input, shift);
        document.getElementById('caesar-output').textContent = result;
    }, input.length * 500 + 100);
});