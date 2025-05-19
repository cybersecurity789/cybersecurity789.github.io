function checkPassword() {
    let password = document.getElementById("password").value;
    let strengthText = document.getElementById("strength");
    let feedbackText = document.getElementById("feedback");
    let progressBar = document.getElementById("progress-bar");

    if (!password) {
        strengthText.innerText = "";
        feedbackText.innerText = "";
        progressBar.style.width = "0%";
        return;
    }

    let score = 0;
    let feedback = [];

    // sprawdzenie długości
    if (password.length >= 12) {
        score += 2;
    } else if (password.length >= 8) {
        score += 1;
        // feedback.push("Spróbuj dłuższego hasła (min. 12 znaków).");
    } else {
        // feedback.push("Hasło jest zbyt krótkie.");
    }

    // sprawdzenie różnych typów znaków
    if (/[a-z]/.test(password)) score += 1; // Małe litery
    if (/[A-Z]/.test(password)) score += 1; // Wielkie litery
    if (/[0-9]/.test(password)) score += 1; // Cyfry
    if (/[\W_]/.test(password)) score += 2; // Znaki specjalne

    // pasek postępu
    let progressPercentage = (score / 6) * 100;
    progressBar.style.width = progressPercentage + "%";

    if (score >= 6) {
        strengthText.innerText = "Bardzo mocne";
        strengthText.style.color = "green";
        strengthText.className = "strong";
        progressBar.style.backgroundColor = "green";

        // 🎉 Konfetti!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    else if (score >= 4) {
        strengthText.innerText = "Średnie";
        strengthText.style.color = "orange";
        strengthText.className = "medium";
        progressBar.style.backgroundColor = "orange";
    } else {
        strengthText.innerText = "Słabe";
        strengthText.style.color = "red";
        strengthText.className = "weak";
        progressBar.style.backgroundColor = "red";
    }

    // ✅ Podpowiedzi dla użytkownika
    feedbackText.innerText = feedback.join(" ");
}

document.getElementById("togglePassword").addEventListener("click", function () {
    let passwordInput = document.getElementById("password");
    let icon = document.getElementById("togglePassword");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.src = "assets/hide-private-hidden-icon.png"; // Zmiana na ikonę ukrywania
    } else {
        passwordInput.type = "password";
        icon.src = "assets/eye-look-icon.png"; // Zmiana na ikonę pokazującą hasło
    }
});


function generatePassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    let passwordField = document.getElementById("password");
    passwordField.type = "text"; // Odsłaniamy wygenerowane hasło
    passwordField.value = password;

    // Resetowanie paska postępu przed ponowną aktualizacją
    let progressBar = document.getElementById("progress-bar");
    progressBar.style.width = "0%"; // Zerujemy szerokość
    progressBar.className = ""; // Usuwamy poprzednie klasy kolorów

    // Automatycznie aktualizujemy siłę hasła i czas łamania
    checkPassword();
    estimateCrackTime(password);

    // Jeśli użytkownik zacznie wpisywać coś samodzielnie, wracamy do ukrytego hasła
    passwordField.addEventListener("input", function () {
        passwordField.type = "password";
        checkPassword();
        estimateCrackTime(passwordField.value);
    });
}


function estimateCrackTime(password) {
    const length = password.length;
    let charsetType = '';

    // Określamy zestaw znaków
    if (/^\d+$/.test(password)) charsetType = "numbers";
    else if (/^[a-z]+$/.test(password)) charsetType = "lowercase";
    else if (/^[a-zA-Z]+$/.test(password)) charsetType = "mixed-case";
    else if (/^[a-zA-Z0-9]+$/.test(password)) charsetType = "letters-digits";
    else charsetType = "full-set";

    if (length < 4) {
        document.getElementById("crack-time").innerText = "natychmiast";
        return;
    }

    // czas złamania zgodnie z tabelą Hive Systems (bcrypt, A100, 8x GPU)
    const hiveTable = {
        "numbers":   ["natychmiast", "natychmiast", "1 sek", "10 sek", "2 min", "3 godz", "1 dzień", "2 tyg", "4 mies", "3 lata", "30 lat", "303 lat", "3k lat", "30k lat", "303k lat", "3m lat", "30m lat", "303m lat", "3bn lat", "30bn lat", "303bn lat", "3tn lat"],
        "lowercase": ["natychmiast", "11 sek", "5 min", "2 godz", "2 dni", "2 mies", "4 lat", "111 lat", "2k lat", "75k lat", "1m lat", "50m lat", "1bn lat", "34bn lat", "894bn lat", "23tn lat", "604tn lat", "15qd lat", "408qd lat", "10qn lat", "276qn lat", "7sx lat"],
        "mixed-case": ["7 sek", "6 min", "5 godz", "2 tyg", "2 lat", "84 lat", "4k lat", "228k lat", "11m lat", "616m lat", "32bn lat", "1tn lat", "86tn lat", "4qd lat", "234qd lat", "12qn lat", "633qn lat", "32sx lat", "1sx lat", "89sx lat", "4oct lat", "241oct lat"],
        "letters-digits": ["14 sek", "15 min", "15 godz", "1 mies", "7 lat", "411 lat", "25k lat", "1m lat", "97m lat", "6bn lat", "376bn lat", "23tn lat", "1qd lat", "89qd lat", "5qn lat", "344qn lat", "21sx lat", "1spt lat", "82spt lat", "5oct lat", "315oct lat", "19non lat"],
        "full-set":  ["23 sek", "27 min", "1 dzień", "3 mies", "17 lat", "1k lat", "85k lat", "5m lat", "419m lat", "29bn lat", "2tn lat", "144tn lat", "10qd lat", "705qd lat", "499qn lat", "3sx lat", "242sx lat", "16spt lat", "1oct lat", "83oct lat", "830oct lat", "406non lat"]
    };

    // pobieanie wyniku z tabeli
    let lastIndex = hiveTable[charsetType].length - 1;
    let timeToCrack = (length > 25) ? `więcej niż ${hiveTable[charsetType][lastIndex]}` : hiveTable[charsetType][length - 4];

    document.getElementById("crack-time").innerText = `Czas złamania: ${timeToCrack}`;
}



async function checkHIBP(password) {
    let crackTimeElement = document.getElementById("crack-time");
    let hibpWarningElement = document.getElementById("hibp-warning");

    // Jeśli pole hasła jest puste → usuń komunikaty
    if (!password) {
        crackTimeElement.innerHTML = `<strong>Czas złamania:</strong> -`;
        hibpWarningElement.innerHTML = "";
        return;
    }

    // Generowanie SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();

    // Pobieramy tylko pierwsze 5 znaków hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    try {
        // Pobieramy wyniki z Have I Been Pwned API
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const result = await response.text();

        // Sprawdzamy, czy suffix występuje na liście zwróconych hashy
        const found = result.split("\n").some(line => line.split(":")[0] === suffix);

        if (found) {
            crackTimeElement.innerHTML = `<strong>Czas złamania:</strong> <span style="color:red;">Natychmiast</span>`;
            hibpWarningElement.innerHTML = `<span style="color:red;">⚠️ Hasło było w wycieku! Zmień je natychmiast.</span>`;
        } else {
            estimateCrackTime(password); // Obliczamy normalny czas łamania
            hibpWarningElement.innerHTML = `<span style="color:green;">✅ Hasło nie występuje w znanych wyciekach.</span>`;
        }
    } catch (error) {
        hibpWarningElement.innerText = "Błąd podczas sprawdzania haseł. Spróbuj ponownie.";
    }
}

// Automatyczne sprawdzanie po wpisaniu hasła
document.getElementById("password").addEventListener("input", function() {
    let password = this.value;
    checkPassword();
    estimateCrackTime(password);
    checkHIBP(password);
});



