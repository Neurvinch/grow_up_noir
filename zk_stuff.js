// Librerías de Aztec para generar pruebas ZK con Noir
import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import circuit from './zk+hangman/target/zk+hangman.json';

// Librerías extra para compatibilidad con zkWASM
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url";
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);

// Función para mostrar logs y resultados en HTML
export const show = (id, content) => {
  const container = document.getElementById(id);
  container.appendChild(document.createTextNode(content));
  container.appendChild(document.createElement("br"));
};

// Función para generar pruebas ZK para ambos el admin y el jugador
export async function generateProof(word, winnerAddress) {
  // Inicializa Noir con el circuito precompilado en la carpeta circuit
  const noir = new Noir(circuit);
  const backend = new UltraHonkBackend(circuit.bytecode);

  // Convierte la palabra a un array de caracteres y la rellena con 0s hasta que tenga 10 caracteres
  const wordArray = Array.from(word)
    .map(char => char.charCodeAt(0).toString())
    .concat(Array(10 - word.length).fill("0"));

  // Generamos la prueba ZK
  show("logs", "Generating witness... ⏳");
  const { witness } = await noir.execute({ 
    word: wordArray,
    word_length: word.length,
    winner: winnerAddress
  });
  show("logs", "Generated witness... ✅");

  show("logs", "Generating proof... ⏳");
  const proof = await backend.generateProof(witness, { keccak: true });
  show("logs", "Generated proof... ✅");

  // Opcional: Verificamos la prueba ZK antes de enviarla al contrato de Solidity
  show('logs', 'Verifying proof... ⌛');
  const isValid = await backend.verifyProof(proof, { keccak: true });
  show("logs", `Proof is ${isValid ? "valid" : "invalid"}... ✅`);

  const proofBytes = '0x' + Array.from(Object.values(proof.proof))
    .map(n => n.toString(16).padStart(2, '0'))
    .join('');

  // Devolvemos la prueba ZK para ser enviada al contrato de Solidity
  return {
    proofBytes,
    publicInputs: proof.publicInputs,
    rawProof: proof.proof
  };
} 