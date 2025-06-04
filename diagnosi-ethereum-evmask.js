/**
 * Script di Diagnostica Avanzata per il Conflitto evmAsk.js
 * Da eseguire nella console browser per identificare la causa esatta del blocco
 */

console.log('🔍 === INIZIANDO DIAGNOSTICA CONFLITTO EVMASK ===');

// 1. Analisi stato iniziale window.ethereum
function diagnoseInitialEthereumState() {
  console.log('\n📊 1. STATO INIZIALE WINDOW.ETHEREUM');
  console.log('─'.repeat(50));
  
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  
  console.log('✓ Esistenza ethereum:', typeof window.ethereum !== 'undefined');
  console.log('✓ Tipo ethereum:', typeof window.ethereum);
  console.log('✓ Ha descriptor:', Boolean(descriptor));
  
  if (descriptor) {
    console.log('✓ Descriptor completo:', {
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      enumerable: descriptor.enumerable,
      hasValue: 'value' in descriptor,
      hasGetter: 'get' in descriptor,
      hasSetter: 'set' in descriptor
    });
  }
  
  if (window.ethereum) {
    console.log('✓ Provider info:', {
      isMetaMask: window.ethereum.isMetaMask,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      isTrust: window.ethereum.isTrust,
      chainId: window.ethereum.chainId,
      selectedAddress: window.ethereum.selectedAddress
    });
  }
  
  return descriptor;
}

// 2. Ricerca script evmAsk nelle estensioni
function searchEvmAskScripts() {
  console.log('\n🔍 2. RICERCA SCRIPT EVMASK');
  console.log('─'.repeat(50));
  
  // Controlla tutti gli script caricati
  const scripts = Array.from(document.scripts);
  const evmAskScripts = scripts.filter(script => 
    script.src.includes('evmAsk') || 
    script.src.includes('evm-ask') ||
    script.textContent?.includes('evmAsk')
  );
  
  console.log('✓ Script totali trovati:', scripts.length);
  console.log('✓ Script evmAsk trovati:', evmAskScripts.length);
  
  evmAskScripts.forEach((script, index) => {
    console.log(`  📄 Script ${index + 1}:`, {
      src: script.src,
      hasContent: Boolean(script.textContent),
      contentLength: script.textContent?.length || 0
    });
  });
  
  // Controlla nel DOM per elementi sospetti
  const possibleEvmElements = document.querySelectorAll('[*="evm"], [*="ethereum"], [*="evmAsk"]');
  console.log('✓ Elementi DOM sospetti:', possibleEvmElements.length);
  
  return { scripts: evmAskScripts, elements: Array.from(possibleEvmElements) };
}

// 3. Monitora tentativi di ridefinizione in tempo reale
function monitorDefinePropertyAttempts() {
  console.log('\n👁️ 3. MONITORAGGIO DEFINEPROPERTY');
  console.log('─'.repeat(50));
  
  const originalDefineProperty = Object.defineProperty;
  let attemptCount = 0;
  
  Object.defineProperty = function(obj, prop, descriptor) {
    if (obj === window && prop === 'ethereum') {
      attemptCount++;
      console.log(`🚨 TENTATIVO ${attemptCount} DI RIDEFINIZIONE ETHEREUM:`, {
        timestamp: new Date().toISOString(),
        descriptor: descriptor,
        stackTrace: new Error().stack.split('\n').slice(1, 5).join('\n')
      });
      
      // Verifica se il tentativo proviene da evmAsk
      const stack = new Error().stack;
      if (stack.includes('evmAsk') || stack.includes('evm-ask')) {
        console.log('🎯 TROVATO: Tentativo da evmAsk.js!');
        console.log('📍 Stack trace completo:', stack);
      }
    }
    
    return originalDefineProperty.apply(this, arguments);
  };
  
  console.log('✓ Interceptor defineProperty attivato');
  return originalDefineProperty;
}

// 4. Simula il problema per confermare la diagnosi
function simulateEvmAskConflict() {
  console.log('\n🧪 4. SIMULAZIONE CONFLITTO EVMASK');
  console.log('─'.repeat(50));
  
  const currentDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  
  if (currentDescriptor && !currentDescriptor.configurable) {
    console.log('✓ Condizione conflitto presente: ethereum non configurabile');
    
    try {
      // Simula quello che evmAsk.js probabilmente tenta di fare
      Object.defineProperty(window, 'ethereum', {
        value: { simulated: true },
        writable: true,
        configurable: true
      });
      console.log('❌ INASPETTATO: Ridefinizione riuscita (non dovrebbe succedere)');
    } catch (error) {
      console.log('✅ CONFERMATO: Errore riprodotto:', error.message);
      console.log('🎯 Questo è l\'errore che blocca evmAsk.js');
    }
  } else {
    console.log('⚠️ Condizione conflitto NON presente');
  }
}

// 5. Controlla meccanismi di prevenzione esistenti
function checkPreventionMechanisms() {
  console.log('\n🛡️ 5. VERIFICA MECCANISMI PREVENZIONE');
  console.log('─'.repeat(50));
  
  console.log('✓ __ethereumConflictPrevented:', window.__ethereumConflictPrevented);
  console.log('✓ __ethereumOriginalDescriptor:', Boolean(window.__ethereumOriginalDescriptor));
  console.log('✓ __extensionEthereumHandlers:', window.__extensionEthereumHandlers?.size || 'undefined');
  
  // Verifica se le funzioni di prevenzione sono disponibili
  const advancedFunctions = [
    'advancedEthereumConflictPrevention',
    'emergencyEthereumReset',
    'diagnoseEthereumState',
    'getRegisteredProviders'
  ];
  
  advancedFunctions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    console.log(`✓ ${funcName}:`, exists ? 'Disponibile' : 'Non trovata');
  });
}

// 6. Log degli eventi delle estensioni
function logExtensionEvents() {
  console.log('\n📡 6. MONITORAGGIO EVENTI ESTENSIONI');
  console.log('─'.repeat(50));
  
  const events = [
    'ethereum#initialized',
    'eip6963:announceProvider',
    'web3:loaded',
    'metamask:initialized'
  ];
  
  events.forEach(eventType => {
    window.addEventListener(eventType, (event) => {
      console.log(`🔔 EVENTO: ${eventType}`, {
        timestamp: new Date().toISOString(),
        detail: event.detail,
        provider: event.detail?.provider || event.detail
      });
    });
  });
  
  console.log('✓ Listener per eventi estensioni attivati');
}

// 7. Fornisce soluzioni basate sui risultati
function provideSolutions() {
  console.log('\n💡 7. SOLUZIONI PROPOSTE');
  console.log('─'.repeat(50));
  
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
  const hasEvmAsk = document.querySelector('[src*="evmAsk"], [src*="evm-ask"]');
  
  if (descriptor && !descriptor.configurable) {
    console.log('🔧 SOLUZIONE A: Proprietà ethereum non configurabile');
    console.log('   → Utilizzare il reset di emergenza');
    console.log('   → Disabilitare temporaneamente l\'estensione problematica');
    
    console.log('   Codice fix:');
    console.log(`
    try {
      if (window.ethereum && !Object.getOwnPropertyDescriptor(window, 'ethereum').configurable) {
        window.ethereum = undefined;
        location.reload();
      }
    } catch (e) { console.error('Fix fallito:', e); }
    `);
  }
  
  if (hasEvmAsk) {
    console.log('🔧 SOLUZIONE B: Script evmAsk trovato');
    console.log('   → Bloccare il caricamento dello script');
    console.log('   → Patch dell\'estensione che lo utilizza');
  }
  
  console.log('🔧 SOLUZIONE C: Prevenzione timing');
  console.log('   → Spostare il caricamento della prevenzione prima del body');
  console.log('   → Utilizzare un service worker per intercettare script');
}

// Esecuzione completa della diagnostica
async function runCompleteDiagnosis() {
  const initialDescriptor = diagnoseInitialEthereumState();
  const scriptResults = searchEvmAskScripts();
  const originalDefineProperty = monitorDefinePropertyAttempts();
  logExtensionEvents();
  
  // Aspetta un momento per catturare eventi
  setTimeout(() => {
    checkPreventionMechanisms();
    simulateEvmAskConflict();
    provideSolutions();
    
    console.log('\n🎉 === DIAGNOSTICA COMPLETATA ===');
    console.log('📋 Risultati salvati nelle variabili globali:');
    console.log('   - window.diagnosticResults');
    
    // Salva risultati per accesso futuro
    window.diagnosticResults = {
      initialDescriptor,
      scriptResults,
      timestamp: new Date().toISOString()
    };
    
  }, 2000);
  
  return 'Diagnostica avviata - controlla la console per i risultati';
}

// Auto-avvio
runCompleteDiagnosis();