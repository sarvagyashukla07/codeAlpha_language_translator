
const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const swapBtn = document.getElementById("swapBtn");
const status = document.getElementById("status");
const charCount = document.getElementById("charCount");
const outputCount = document.getElementById("outputCount");

function updateCounts() {
    charCount.textContent = `${inputText.value.length} / 500`;
    outputCount.textContent = `${outputText.value.length} characters`;
}

inputText.addEventListener("input", updateCounts);

function setStatus(message) {
    status.textContent = message;
}

translateBtn.addEventListener("click", async () => {
    const text = inputText.value.trim();
    const source = sourceLanguage.value;
    const target = targetLanguage.value;

    if (!text) {
        outputText.value = "";
        updateCounts();
        setStatus("Please enter some text first.");
        return;
    }

    if (source === target) {
        outputText.value = text;
        updateCounts();
        setStatus("Both languages are the same.");
        return;
    }

    translateBtn.disabled = true;
    translateBtn.innerHTML = "⏳ Translating...";
    outputText.value = "";
    updateCounts();
    setStatus("Your translation is on its way...");

    try {
        const url =
            "https://api.mymemory.translated.net/get?q=" +
            encodeURIComponent(text) +
            "&langpair=" +
            encodeURIComponent(source + "|" + target) +
            "&mt=1";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const data = await response.json();

        if (data.responseStatus !== 200) {
            throw new Error(
                data.responseDetails || "Translation service error."
            );
        }

        const translated = data.responseData?.translatedText;

        if (typeof translated !== "string" || !translated.trim()) {
            throw new Error("Empty translation received.");
        }

        if (
            translated.trim().toLowerCase() === text.toLowerCase() &&
            !/^[\u0900-\u097F]/.test(text)
        ) {
            throw new Error("The service returned the original text.");
        }

        outputText.value = translated;
        setStatus("✓ Translation completed successfully!");
    } catch (error) {
        outputText.value = "";
        setStatus(
            "Translation failed. Check your internet or try again later."
        );
        console.error("Translation error:", error);
    } finally {
        translateBtn.disabled = false;
        translateBtn.innerHTML = "<span>✦</span> Translate Now <span>→</span>";
        updateCounts();
    }
});

swapBtn.addEventListener("click", () => {
    const previousSource = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = previousSource;

    if (outputText.value.trim()) {
        inputText.value = outputText.value;
        outputText.value = "";
        setStatus("Languages swapped. Click Translate Now.");
    } else {
        setStatus("Languages swapped successfully.");
    }

    updateCounts();
});

clearBtn.addEventListener("click", () => {
    inputText.value = "";
    outputText.value = "";
    updateCounts();
    setStatus("Text cleared. Enter new text to translate.");
});

copyBtn.addEventListener("click", async () => {
    const text = outputText.value.trim();

    if (!text) {
        setStatus("No translation available to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        setStatus("✓ Translation copied to clipboard!");
    } catch (error) {
        outputText.select();
        setStatus("Select the text and press Ctrl+C to copy.");
    }
});

updateCounts();
