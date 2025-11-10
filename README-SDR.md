# 🎯 IgnitionAI SDR Agent - Guide Complet

Votre agent conversationnel a été transformé en **SDR (Sales Development Representative) IA** professionnel qui qualifie automatiquement vos prospects et envoie des notifications Telegram à votre équipe commerciale.

## 🚀 Qu'est-ce qui a changé ?

### ❌ Avant (Mode Démo)
- Amadeus Travel API (vols, hôtels)
- Nutrition API
- Focus : démonstration technique

### ✅ Maintenant (Mode SDR)
- **Capture de leads** incrémentale et naturelle
- **Scoring BANT** automatique (Budget, Authority, Need, Timeline)
- **Notifications Telegram** pour l'équipe commerciale
- **Qualification intelligente** Hot/Warm/Cold
- Focus : génération de leads qualifiés

---

## 📋 Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    Visiteur Website                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Sophie (SDR Agent IA)                           │
│  • Qualification conversationnelle (pas un formulaire !)    │
│  • Écoute active et recommandations personnalisées          │
│  • Utilise RAG pour répondre aux questions techniques       │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ capture_lead  │ │calculate_lead │ │send_telegram  │
│    _info      │ │    _score     │ │ _notification │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 Azure Table Storage                          │
│  • Table "leads" : Données prospects + scores BANT          │
│  • Table "conversations" : Historique complet               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Telegram (Équipe Commerciale)                   │
│  📱 Notification instantanée quand lead qualifié (score≥70) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Configuration (10 minutes)

### 1️⃣ Configurer Azure Table Storage

```bash
# 1. Créer un Storage Account sur Azure Portal
# https://portal.azure.com → Storage Accounts → Create

# 2. Copier la connection string
# Storage Account → Access keys → Connection string

# 3. Ajouter dans .env.local
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=..."
AZURE_LEADS_TABLE_NAME="leads"
AZURE_CONVERSATIONS_TABLE_NAME="conversations"
```

Les tables seront créées automatiquement au démarrage ✅

---

### 2️⃣ Configurer Telegram Bot

```bash
# 1. Créer un bot
# • Ouvrir Telegram
# • Chercher @BotFather
# • Envoyer /newbot
# • Suivre les instructions
# • Copier le token fourni

# 2. Créer un groupe/canal pour les notifications
# • Créer un groupe "IgnitionAI Sales Leads"
# • Ajouter le bot au groupe
# • Le rendre admin (pour pouvoir poster)

# 3. Obtenir le Chat ID
# • Envoyer un message dans le groupe
# • Visiter : https://api.telegram.org/botVOTRE_TOKEN/getUpdates
# • Chercher "chat":{"id": -123456789}
# • C'est votre CHAT_ID

# 4. Ajouter dans .env.local
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_SALES_CHAT_ID="-123456789"
```

---

### 3️⃣ Tester la Configuration

```bash
# Démarrer le serveur
npm run dev

# Vérifier les logs au démarrage
✅ Lead service initialized with Azure Tables
✅ Telegram service initialized
✅ Agent initialized with 6 tools

# Tester via le chat sur http://localhost:3000
# Dialogue exemple :
User: "Bonjour, je cherche à développer un chatbot IA"
Sophie: "Bonjour ! Je suis Sophie, consultante IA chez IgnitionAI..."
```

---

## 🎭 Comment Sophie Qualifie les Leads

### Scoring BANT Automatique

| Critère | Points | Signaux Détectés |
|---------|--------|------------------|
| **Budget** | 0-25 | "50k EUR", "budget flexible", "limité" |
| **Authority** | 0-25 | "CTO", "directeur", "manager", "explorateur" |
| **Need** | 0-25 | Description projet, pain points, urgence |
| **Timeline** | 0-25 | "urgent", "1-3 mois", "en exploration" |
| **TOTAL** | 0-100 | Score final |

### Catégories

- 🔥 **Hot Lead** (70-100) → Notification Telegram immédiate
- 🌟 **Warm Lead** (40-69) → Continue à qualifier
- ❄️ **Cold Lead** (0-39) → Phase recherche, éducation

---

## 📊 Outils Disponibles pour Sophie

### 1. `capture_lead_info`
Sauvegarde incrémentale des infos prospect.

**Exemple d'utilisation :**
```
User: "Je m'appelle Jean et je travaille chez Acme Corp"
Sophie appelle: capture_lead_info({firstName: "Jean", company: "Acme Corp"})
→ Sauvegardé dans Azure Table
```

### 2. `calculate_lead_score`
Calcule le score BANT (0-100).

**Exemple :**
```
Sophie appelle: calculate_lead_score()
→ Retour: {
  total: 75,
  category: "hot",
  budget: 20/25,
  authority: 25/25,
  need: 20/25,
  timeline: 10/25,
  readyForHandoff: true
}
```

### 3. `send_telegram_notification`
Envoie notification à l'équipe commerciale.

**Exemple :**
```
Sophie appelle: send_telegram_notification({urgency: "high"})
→ Message Telegram envoyé :
🔥 New Lead Alert!
━━━━━━━━━━━━━━
👤 Contact: Jean Dupont
📧 jean@acme.com
🏢 Acme Corp • France
...
```

### 4. `advanced_knowledge_search`
Répond aux questions techniques via RAG.

**Exemple :**
```
User: "Comment fonctionne un système RAG ?"
Sophie appelle: advanced_knowledge_search("RAG system explanation")
→ Réponse basée sur votre knowledge base
```

---

## 💬 Flow Conversationnel

### ✅ BON Exemple (Naturel)

```
User: "Bonjour"
Sophie: "Bonjour ! Je suis Sophie, consultante IA. Comment puis-je vous aider ?"

User: "Je cherche à automatiser notre support client"
Sophie: "Excellent ! Un chatbot IA pourrait vraiment aider. Quel volume de demandes gérez-vous actuellement ?"
[capture_lead_info: {projectDescription: "automatiser support client"}]

User: "Environ 500 tickets par jour"
Sophie: "C'est conséquent ! Pour mieux vous conseiller, puis-je avoir votre prénom ?"

User: "Jean"
Sophie: "Merci Jean ! Et vous travaillez dans quelle entreprise ?"
[capture_lead_info: {firstName: "Jean"}]

User: "Acme Corp"
[capture_lead_info: {company: "Acme Corp"}]
[calculate_lead_score → score: 45, warm lead]

Sophie: "Super ! Pour Acme Corp, nous avons déjà aidé des entreprises similaires. Avez-vous un email pour que je vous envoie des exemples ?"
...
```

### ❌ MAUVAIS Exemple (Formulaire)

```
Sophie: "Bonjour ! Donnez-moi votre nom, prénom, email, entreprise et projet"
→ ❌ Trop agressif, pas naturel !
```

---

## 🔍 Monitoring & Analytics

### Dans Azure Table Storage

```bash
# Table "leads" - Voir tous les prospects
# Colonnes principales :
- partitionKey: "LEAD"
- rowKey: UUID du lead
- email, company, projectDescription
- leadScore, leadCategory (hot/warm/cold)
- status, telegramNotificationSent

# Table "conversations" - Historique complet
- partitionKey: "CONVERSATION"
- rowKey: threadId
- messages: JSON array
```

### Dans Telegram

Chaque lead qualifié génère un message formaté avec :
- Contact info complète
- Description projet
- Score BANT détaillé
- Pain points
- Timeline & budget

---

## 🧪 Tester en Local

```typescript
// Tester l'agent directement
const agent = MyFirstAgent.getInstance();
await agent.initialize();

const response = agent.streamStructured(
  "Bonjour, je cherche à automatiser mon support client",
  "test-thread-123",
  "fr" // ou "en"
);

for await (const event of response) {
  console.log(event);
}
```

---

## 📈 Prochaines Étapes Recommandées

### Court Terme (1-2 semaines)
- [ ] Ajouter un dashboard admin pour visualiser les leads
- [ ] Intégrer Cal.com ou Calendly pour prise de rendez-vous automatique
- [ ] Ajouter email de confirmation automatique aux prospects

### Moyen Terme (1 mois)
- [ ] Intégration CRM (HubSpot, Pipedrive)
- [ ] A/B testing de différents prompts
- [ ] Analytics détaillés (taux de conversion, temps de qualification)

### Long Terme (3 mois)
- [ ] Lead nurturing automatisé (email sequences)
- [ ] Prédiction du LTV (Lifetime Value)
- [ ] Fine-tuning du modèle sur vos propres conversations

---

## 🎓 Bonnes Pratiques

### Pour Sophie (l'agent)
✅ Pose 1-2 questions à la fois
✅ Justifie pourquoi tu demandes une info
✅ Utilise le RAG pour crédibiliser
✅ Valorise les réponses du prospect
❌ Ne demande JAMAIS tout d'un coup
❌ N'insiste pas si refus

### Pour l'Équipe Commerciale
✅ Réponds aux notifications Telegram sous 2h (hot leads)
✅ Mets à jour le statut dans Azure Table
✅ Donne du feedback sur la qualité des leads
✅ Aide à affiner le scoring BANT

---

## 🆘 Troubleshooting

### "Agent not initialized"
```bash
# Vérifier que initialize() est appelé au démarrage
# Check dans app/api/chat/route.ts
```

### "Telegram notification not sent"
```bash
# 1. Vérifier les variables d'environnement
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_SALES_CHAT_ID

# 2. Tester manuellement
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"

# 3. Vérifier que le bot est admin du groupe
```

### "Azure Table not found"
```bash
# Les tables doivent être créées automatiquement
# Si erreur, vérifier la connection string
# Check dans Azure Portal > Storage Account > Tables
```

---

## 📚 Ressources

- [Zod Schemas](./lib/schemas/lead.schema.ts) - Types & validation
- [Lead Service](./service/lead.service.ts) - Azure Table Storage
- [Scoring Service](./service/lead-scoring.service.ts) - BANT logic
- [Telegram Service](./service/telegram.service.ts) - Notifications
- [SDR Tools](./ai/tools/sdr-tools.ts) - Agent tools
- [System Prompts](./ai/prompts/system-prompts.ts) - FR & EN prompts

---

## 🎉 Félicitations !

Votre agent SDR est maintenant opérationnel. Sophie va qualifier vos prospects automatiquement et alerter votre équipe commerciale sur Telegram quand un lead chaud arrive.

**Questions ?** Ouvrez une issue ou contactez l'équipe dev.

---

*Généré par Claude Code | IgnitionAI © 2025*
