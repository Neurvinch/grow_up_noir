import { loadDapp, submitAdminProof, submitPlayerProof } from './web3_stuff.js';
import { generateProof, show } from './zk_stuff.js';

// Inicializa todo lo relacionado con web3
loadDapp();

// En esta aplicación, existen dos funciones que se ejecutan cuando el admin o el jugador presionan el botón de submit, ambas producen una prueba ZK que luego es enviada al contrato de Solidity

// Evento para cuando el admin crea la palabra, nota que el ganador es 0x0000000000000000000000000000000000000000 pues no será usado en el contrato de Solidity
document.getElementById("admin_submit").addEventListener("click", async () => {
  const word = document.getElementById("admin_word").value;
  const { proofBytes, publicInputs, rawProof } = await generateProof(
    word, 
    "0x0000000000000000000000000000000000000000"
  );

  await submitAdminProof(proofBytes, publicInputs);
  show("results", rawProof);
});

// Evento para cuando el jugador adivina la palabra, nota que el ganador puede ser definido por el jugador
document.getElementById("player_submit").addEventListener("click", async () => {
  const word = document.getElementById("player_word").value;
  const winnerAddress = document.getElementById("winner-address").value;
  const { proofBytes, publicInputs, rawProof } = await generateProof(
    word,
    winnerAddress
  );

  await submitPlayerProof(proofBytes, publicInputs);
  show("results", rawProof);
});