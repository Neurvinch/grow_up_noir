const NETWORK_ID = 17000 // Para este tutorial usaremos Holesky, para usar otra red solo cambia este valor
const CONTRACT_ADDRESS = "0xfb89Fb2a693e71B237cE2E6A4CC2EEbFb59034c9" // Dirección del contrato de demostración, cambia esta dirección por la del contrato de ahorcado ZK que recién creamos

// Définimos el ABI del contrato para ambas funciones de init y playWord
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_proof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32[]",
        "name": "_publicInputs",
        "type": "bytes32[]"
      }
    ],
    "name": "init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_proof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32[]",
        "name": "_publicInputs",
        "type": "bytes32[]"
      }
    ],
    "name": "playWord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let web3;
let accounts;
let contract;
let isAdmin = false;

// Función para recargar la página cuando se cambia de cuenta o de red
function metamaskReloadCallback() {
  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  });
  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  });
}

// Función para inicializar web3
const getWeb3 = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }
  return new Web3(window.ethereum);
};

// Carga el contrato de Ahoracado
const getContract = async (web3) => {
  return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
};

// Inicializa la aplicación, conecta a la wallet e inicializa el contrato
async function loadDapp() {
  try {
    metamaskReloadCallback();
    web3 = await getWeb3();

    const netId = await web3.eth.net.getId();
    if (netId !== NETWORK_ID) {
      document.getElementById("web3_message").textContent = "Please connect to Holesky network";
      return;
    }

    contract = await getContract(web3);

    accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      onWalletConnected();
    } else {
      document.getElementById("web3_message").textContent = "Please connect wallet";
      document.getElementById("connect_button").style.display = "block";
      document.getElementById("connected_section").style.display = "none";
    }
  } catch (error) {
    console.error("Error loading dapp:", error);
    document.getElementById("web3_message").textContent = error.message;
  }
}

// Función para conectar la wallet
async function connectWallet() {
  try {
    accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    onWalletConnected();
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

// Callback para cuando se conecta la wallet
function onWalletConnected() {
  document.getElementById("connect_button").style.display = "none";
  document.getElementById("web3_message").textContent = "Connected!";
  document.getElementById("wallet_address").textContent = `Wallet: ${accounts[0]}`;
  document.getElementById("connected_section").style.display = "block";
  document.getElementById("forms").style.display = "block";
}

// Función llamada por el Admin para crear la palabra
async function submitAdminProof(proofBytes, publicInputs) {
  console.log(proofBytes);
  console.log(publicInputs);
  try {
    await contract.methods.init(proofBytes, publicInputs)
      .send({ from: accounts[0] })
      .on('transactionHash', (hash) => {
        document.getElementById("web3_message").textContent = "Transaction pending...";
      })
      .on('receipt', (receipt) => {
        document.getElementById("web3_message").textContent = "Success!";
      });
  } catch (error) {
    console.error("Error submitting admin proof:", error);
    document.getElementById("web3_message").textContent = "Transaction failed";
  }
}

// Función llamada por el jugador para adivinar la palabra
async function submitPlayerProof(proofBytes, publicInputs) {
  try {
    await contract.methods.playWord(proofBytes, publicInputs)
      .send({ from: accounts[0] })
      .on('transactionHash', (hash) => {
        document.getElementById("web3_message").textContent = "Transaction pending...";
      })
      .on('receipt', (receipt) => {
        document.getElementById("web3_message").textContent = "Success!";
      });
  } catch (error) {
    console.error("Error submitting player proof:", error);
    document.getElementById("web3_message").textContent = "Transaction failed";
  }
}

export { loadDapp, connectWallet, submitAdminProof, submitPlayerProof };