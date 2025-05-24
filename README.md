# 🔥 FIRE Progress Tracker

<div align="center">

![FIRE Tracker](https://img.shields.io/badge/FIRE-Tracker-orange?style=for-the-badge&logo=fire)
![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Traccia e pianifica il tuo percorso verso l'indipendenza finanziaria con strumenti avanzati per FIRE, COAST FIRE e Barista FIRE.**

[🚀 Demo Live](#) • [📖 Documentazione](#funzionalità) • [🛠️ Setup](#installazione) • [🤝 Contribuisci](#contribuire)

</div>

---

## 📋 Panoramica

FIRE Progress Tracker è un'applicazione web avanzata progettata per aiutarti nel tuo percorso verso l'**indipendenza finanziaria** (FIRE - Financial Independence, Retire Early). Con un'interfaccia moderna e funzionalità complete, l'app offre tutto ciò di cui hai bisogno per pianificare, tracciare e ottimizzare la tua strategia FIRE.

### 🎯 Due Modalità di Utilizzo

- **🔥 Solo FIRE**: Focus esclusivo sull'indipendenza finanziaria
- **💰 FIRE & Budget**: Integra gestione budget con pianificazione FIRE

## ✨ Funzionalità Principali

### 🎯 Tracking FIRE Avanzato
- **Multi-FIRE Support**: Traditional, Coast, Barista, Lean e Fat FIRE
- **Progress Tracker Visuale**: Visualizzazione grafica del progresso in tempo reale
- **Timeline Interattiva**: Proiezioni temporali con milestone personalizzate
- **Simulazioni What-If**: Analizza scenari alternativi e ottimizza la strategia

### 📊 Gestione Portfolio Intelligente
- **Prezzi Real-Time**: Integrazione Yahoo Finance con aggiornamenti automatici
- **Holdings Dettagliate**: Tabella posizioni con P&L in tempo reale
- **Grafici di Allocazione**: Visualizzazione interattiva asset allocation
- **Performance Analysis**: Analisi rendimenti storici e metriche avanzate

### 🎯 Sistema Obiettivi
- **Obiettivi Personalizzati**: Portfolio allocation, target value, rendimento annuale
- **Progress Tracking**: Monitoraggio automatico progresso obiettivi
- **Alert Intelligenti**: Notifiche per deviazioni e traguardi raggiunti
- **Allocation Targets**: Gestione target di allocazione per asset class

### 💼 Gestione Transazioni
- **Transazioni Complete**: Buy/Sell, dividendi, interessi, commissioni
- **Calcolo Automatico**: Holdings calcolate automaticamente dalle transazioni
- **Storico Dettagliato**: Registro completo con bilanci progressivi
- **Import/Export**: Supporto per importazione dati broker

### 🧮 Calcolatori Avanzati
- **FIRE Number Calculator**: Calcolo personalizzato per ogni tipo di FIRE
- **Safe Withdrawal Rate**: Analisi SWR con variazioni personalizzate
- **Coast FIRE Calculator**: Determina quando smettere di investire
- **Future Expense Impact**: Impatto spese future sul timeline FIRE
- **Timeline Comparison**: Confronta scenari multipli side-by-side

### 💰 Gestione Budget (Modalità FIRE & Budget)
- **Budget per Categoria**: Pianificazione mensile, trimestrale e annuale
- **Alert Automatici**: Notifiche per superamento soglie
- **Analisi Tendenze**: Grafici di spesa nel tempo
- **Insights Intelligenti**: Suggerimenti per ottimizzazione spese

### 📱 Dashboard Personalizzata
- **Widget Dinamici**: Layout che si adatta alla modalità selezionata
- **Metriche Real-Time**: Patrimonio netto, tasso risparmio, anni al FIRE
- **FIRE Quick Stats**: Metriche rapide sempre visibili
- **Responsive Design**: Ottimizzato per desktop, tablet e mobile

## 🛠️ Tecnologie

<div align="center">

| Frontend | Backend | Database | Styling | Tools |
|----------|---------|----------|---------|-------|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white) | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) | ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white) | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) |
| React 18 | Edge Functions | Row Level Security | shadcn/ui | Zod Validation |
| Server Components | Real-time APIs | Automated Triggers | Radix UI | React Hook Form |

</div>

## 🚀 Installazione

### Prerequisiti
- Node.js 18+ 
- pnpm (raccomandato) o npm
- Account Supabase

### Setup Rapido

1. **Clona il repository**
```bash
git clone https://github.com/tuousername/fire-tracker.git
cd fire-tracker
```

2. **Installa le dipendenze**
```bash
pnpm install
```

3. **Configura le variabili d'ambiente**
```bash
cp .env.example .env.local
```

Configura le seguenti variabili in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Setup del database**
```bash
# Setup automatico del modulo investimenti
pnpm run setup:investment

# Verifica l'installazione
pnpm run test:investment
```

5. **Avvia l'applicazione**
```bash
pnpm dev
```

L'app sarà disponibile su `http://localhost:3000` 🎉

### Setup Manuale Database

Se preferisci il setup manuale:

1. Apri [Supabase Dashboard](https://app.supabase.com)
2. Vai su "SQL Editor"  
3. Esegui i file SQL in questo ordine:
   - `supabase/setup-profiles.sql`
   - `supabase/setup-budget-tables.sql`
   - `supabase/setup-all-investment.sql`

## 📖 Guide di Utilizzo

### 🔥 Modalità Solo FIRE

Perfetta per chi vuole concentrarsi esclusivamente sul percorso FIRE:

1. **Imposta i tuoi dati**: Patrimonio attuale, spese annuali, tasso di risparmio
2. **Scegli il tipo di FIRE**: Traditional, Coast, Barista o Fat FIRE
3. **Monitora il progresso**: Dashboard con metriche real-time
4. **Gestisci il portfolio**: Traccia investimenti con prezzi real-time
5. **Usa i calcolatori**: Simula scenari e ottimizza la strategia

### 💰 Modalità FIRE & Budget

Combina gestione budget con pianificazione FIRE:

1. **Crea budget per categoria**: Imposta limiti mensili/annuali
2. **Traccia le spese**: Monitora vs budget in tempo reale  
3. **Ricevi alert**: Notifiche automatiche per controllo spese
4. **Analizza trends**: Grafici di spesa nel tempo
5. **Ottimizza per FIRE**: Collegamenti diretti a obiettivi FIRE

### 📊 Gestione Portfolio

Sistema completo per investimenti:

1. **Registra transazioni**: Buy/sell, dividendi, commissioni
2. **Imposta obiettivi**: Target allocation per asset class
3. **Monitora performance**: P&L real-time con Yahoo Finance
4. **Analizza allocazione**: Grafici interattivi e deviazioni
5. **Ottimizza strategia**: Suggerimenti basati sui dati

## 📊 Screenshot

<div align="center">

### Dashboard Solo FIRE
![Dashboard FIRE](docs/images/dashboard-fire.png)

### Portfolio Real-Time  
![Portfolio](docs/images/portfolio-realtime.png)

### Calcolatori Avanzati
![Calculators](docs/images/calculators.png)

### Progress Tracking
![Progress](docs/images/fire-progress.png)

</div>

## 🔧 Scripts Disponibili

```bash
# Sviluppo
pnpm dev                    # Avvia server di sviluppo
pnpm build                  # Build per produzione
pnpm start                  # Avvia server produzione

# Database
pnpm run setup:investment   # Setup modulo investimenti
pnpm run test:investment   # Test setup database
pnpm run schema:check      # Verifica schema database

# Utilità
pnpm lint                  # Linting codice
pnpm type-check           # Controllo TypeScript
```

## 🏗️ Architettura

```
fire-tracker/
├── app/                   # Next.js App Router
│   ├── dashboard/         # Dashboard principale  
│   ├── fire-progress/     # Tracking progresso FIRE
│   ├── portfolio/         # Gestione investimenti
│   ├── calculators/       # Calcolatori avanzati
│   ├── budget/            # Gestione budget
│   └── api/               # API routes
├── components/            # Componenti React
│   ├── fire/              # Componenti FIRE specifici
│   ├── portfolio/         # Componenti portfolio
│   ├── dashboard/         # Widget dashboard
│   └── ui/                # Design system
├── lib/                   # Utilities e configurazioni
├── hooks/                 # Custom React hooks
├── types/                 # Type definitions
└── supabase/             # Schema e migrations
```

## 🎨 Design System

Il progetto utilizza un design system moderno basato su:

- **shadcn/ui**: Componenti accessibili e personalizzabili
- **Tailwind CSS**: Styling utility-first
- **Radix UI**: Primitivi accessibili
- **Lucide Icons**: Icone coerenti
- **Dark/Light Mode**: Supporto temi automatico

## 🔒 Sicurezza

- **Row Level Security (RLS)**: Isolamento dati per utente
- **Authentication**: Supabase Auth con provider multipli
- **API Protection**: Rate limiting e validazione
- **Type Safety**: TypeScript end-to-end
- **Data Validation**: Zod schemas per input

## 🚀 Performance

- **Server Components**: Rendering server-side ottimizzato
- **Lazy Loading**: Caricamento componenti on-demand
- **Caching**: Cache intelligente per API esterne
- **Bundle Splitting**: Codice diviso per modalità
- **Real-time Updates**: WebSocket per dati live

## 📈 Roadmap

### v1.1 - Q2 2025
- [ ] 📱 App mobile (React Native)
- [ ] 🔄 Import automatico da broker
- [ ] 📊 Grafici avanzati con D3.js
- [ ] 🤖 AI insights personalizzati

### v1.2 - Q3 2025  
- [ ] 🌍 Multi-currency support
- [ ] 📈 Crypto portfolio tracking
- [ ] 💬 Community features
- [ ] 📋 Tax optimization tools

### v2.0 - Q4 2025
- [ ] 🏦 Open Banking integration
- [ ] 🎯 Advanced goal setting
- [ ] 📊 Machine learning predictions
- [ ] 🔗 Third-party integrations

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti! Vedi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida.

### Come Contribuire

1. **Fork** il repository
2. **Crea** un branch per la feature (`git checkout -b feature/amazing-feature`)
3. **Commit** le modifiche (`git commit -m 'Add amazing feature'`)
4. **Push** al branch (`git push origin feature/amazing-feature`)
5. **Apri** una Pull Request

### Development Setup

```bash
# Fork e clone
git clone https://github.com/yourusername/fire-tracker.git

# Setup environment
cp .env.example .env.local
pnpm install
pnpm run setup:investment

# Start development
pnpm dev
```

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi [LICENSE](LICENSE) per dettagli.

## 🙏 Riconoscimenti

- **Ispirato da**: Comunità FIRE italiana e internazionale
- **Design**: shadcn/ui e Radix UI team
- **Dati**: Yahoo Finance API
- **Hosting**: Vercel e Supabase

## 📞 Supporto

- 📧 **Email**: support@firetracker.dev
- 💬 **Discord**: [Community Server](https://discord.gg/firetracker)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/fire-tracker/issues)
- 📖 **Docs**: [Documentazione Completa](https://docs.firetracker.dev)

---

<div align="center">

**Inizia oggi il tuo percorso verso l'indipendenza finanziaria! 🔥**

[⭐ Metti una stella su GitHub](https://github.com/yourusername/fire-tracker) • [🚀 Prova la demo](https://firetracker.dev)

Fatto con ❤️ per la comunità FIRE italiana

</div>
