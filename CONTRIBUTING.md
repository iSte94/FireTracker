# Contributing to FIRE Progress Tracker

Grazie per il tuo interesse nel contribuire al FIRE Progress Tracker! 🔥

## 🚀 Come Contribuire

### Segnalare Bug
1. Verifica che il bug non sia già stato segnalato nelle [Issues](https://github.com/iSte94/FireTracker/issues)
2. Crea una nuova issue con template "Bug Report"
3. Includi screenshot e steps per riprodurre il problema

### Suggerire Funzionalità
1. Controlla le [Issues](https://github.com/iSte94/FireTracker/issues) e [Discussions](https://github.com/iSte94/FireTracker/discussions)
2. Crea una "Feature Request" dettagliata
3. Spiega il caso d'uso e i benefici

### Contribuire al Codice

#### Setup Development
```bash
# 1. Fork il repository
# 2. Clone la tua fork
git clone https://github.com/tuousername/FireTracker.git

# 3. Installa dipendenze
pnpm install

# 4. Copia environment
cp .env.example .env.local

# 5. Setup database
pnpm run setup:investment

# 6. Avvia development server
pnpm dev
```

#### Process
1. **Crea un branch** per la tua feature:
   ```bash
   git checkout -b feature/nome-feature
   ```

2. **Sviluppa e testa**:
   - Scrivi codice pulito e documentato
   - Aggiungi test se necessario
   - Verifica che tutto funzioni

3. **Commit con convenzioni**:
   ```bash
   git commit -m "feat: aggiungi calcolatore Coast FIRE
   
   - Nuovo widget per Coast FIRE calculations
   - Integrazione con dashboard esistente
   - Test units inclusi"
   ```

4. **Push e Pull Request**:
   ```bash
   git push origin feature/nome-feature
   ```
   Poi crea una Pull Request su GitHub.

## 📝 Convenzioni

### Commit Messages
Usa [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - Nuove funzionalità
- `fix:` - Bug fixes
- `docs:` - Documentazione
- `style:` - Formattazione
- `refactor:` - Refactoring
- `test:` - Test
- `chore:` - Manutenzione

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Segui le regole configurate
- **Prettier**: Formattazione automatica
- **Components**: PascalCase per componenti
- **Files**: kebab-case per file

### Pull Request
- Titolo descrittivo
- Descrizione dettagliata delle modifiche
- Link alle issues correlate
- Screenshot per modifiche UI
- Test che tutto funzioni

## 🏗️ Architettura

### Directory Structure
```
fire-tracker/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Utilities
├── hooks/               # Custom hooks
├── types/               # TypeScript types
└── supabase/           # Database schema
```

### Componenti
- Usa `shadcn/ui` per UI components
- Componenti custom in `components/`
- Hooks riutilizzabili in `hooks/`

### Database
- Supabase con PostgreSQL
- Row Level Security (RLS) abilitato
- Migrations in `supabase/`

## 🎯 Roadmap

Vedi [Issues](https://github.com/iSte94/FireTracker/issues) con label `enhancement` per funzionalità pianificate.

### Priorità Alta
- [ ] App mobile React Native
- [ ] Import automatico da broker
- [ ] Grafici avanzati D3.js
- [ ] AI insights

### Come Scegliere su Cosa Lavorare
1. Controlla issues con label `good first issue`
2. Chiedi nelle Discussions per consigli
3. Proponi nuove idee

## ❓ Domande?

- 💬 [Discussions](https://github.com/iSte94/FireTracker/discussions)
- 📧 Email: firetracker.dev@gmail.com
- 🐛 [Issues](https://github.com/iSte94/FireTracker/issues)

Grazie per contribuire alla community FIRE! 🚀
