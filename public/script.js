const ws = new WebSocket("ws://localhost:3000");

let allCryptoCurrencies = [];
let lastAssetIndex = 0;
const assetsPerPage = 500;

ws.onmessage = function (event) {
  try {
    const data = JSON.parse(event.data);

    if (!data.asset_id_base || !data.asset_id_quote || isNaN(data.rate)) {
      throw new Error("Invalid data format received from WebSocket.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    const formattedRate = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.asset_id_quote,
      maximumFractionDigits: 2,
    }).format(data.rate);

    document.getElementById("rate-display").innerText = `1 ${data.asset_id_base} = ${formattedRate}`;
  } catch (error) {
    handleError(`WebSocket error: ${error.message}`);
  }
};


window.addEventListener("load", () => {
  fetchCurrencies();
});

function fetchCurrencies() {
  fetch("/currencies")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const sortedTraditionalCurrencies = data.traditionalCurrencies.sort((a, b) => 
        a.asset_id.localeCompare(b.asset_id)
      );
      populateDropdown("currency-select", sortedTraditionalCurrencies);

      allCryptoCurrencies = data.cryptocurrencies.filter(crypto => crypto.price_usd !== undefined);
      populateCryptoDropdown("crypto-select", 0, assetsPerPage);
    })
    .catch((error) => console.error("Error fetching currency data:", error));
}


function populateDropdown(dropdownId, options) {
  const select = document.getElementById(dropdownId);
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.asset_id;
    optionElement.textContent = `${option.name} (${option.asset_id})`;
    select.appendChild(optionElement);
  });
}

function populateCryptoDropdown(dropdownId, startIndex, count) {
  const select = document.getElementById(dropdownId);
  const endIndex = Math.min(startIndex + count, allCryptoCurrencies.length);
  for (let i = startIndex; i < endIndex; i++) {
    const option = allCryptoCurrencies[i];
    const optionElement = document.createElement("option");
    optionElement.value = option.asset_id;
    optionElement.textContent = `${option.name} (${option.asset_id})`;
    select.appendChild(optionElement);
  }
  lastAssetIndex = endIndex;
}

function addMoreCryptoCurrencies() {
  if (lastAssetIndex < allCryptoCurrencies.length) {
    populateCryptoDropdown("crypto-select", lastAssetIndex, assetsPerPage);
  }
}

const cryptoSelect = document.getElementById("crypto-select");
cryptoSelect.addEventListener('scroll', () => {
  if (cryptoSelect.scrollTop + cryptoSelect.offsetHeight >= cryptoSelect.scrollHeight - 10) {
    addMoreCryptoCurrencies();
  }
});

document.getElementById("get-rate-btn").addEventListener("click", () => {
  const crypto = document.getElementById("crypto-select").value;
  const currency = document.getElementById("currency-select").value;
  fetchExchangeRate(crypto, currency);
});

function fetchExchangeRate(crypto, currency) {
  fetch(`/exchange-rate?crypto=${crypto}&currency=${currency}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
    })
    .catch((error) => {
      handleError(`Exchange rate error: ${error.message}`);
    });
}

function handleError(errorMessage) {
  console.error(errorMessage);
}

