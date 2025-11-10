# Guide du Bot Telegram Interactif

## 🤖 Vue d'ensemble

Le bot Telegram permet à l'équipe commerciale de consulter et gérer les leads directement depuis Telegram, sans avoir besoin d'accéder à la base de données ou au dashboard.

## 🚀 Installation

### 1. Installer les dépendances

```bash
pnpm add telegraf
```

### 2. Configuration

Le bot utilise les mêmes variables d'environnement que les notifications :

```env
TELEGRAM_BOT_TOKEN="7877279495:AAHCjrNBHtTNkqwhJAqgAycG6XrPOWbpBBg"
TELEGRAM_SALES_CHAT_ID="-5074434645"
```

### 3. Démarrer le bot

```bash
# Mode développement
pnpm tsx scripts/start-telegram-bot.ts

# Ou ajoutez dans package.json
"scripts": {
  "bot": "tsx scripts/start-telegram-bot.ts"
}

# Puis
pnpm bot
```

## 📱 Utilisation

### Commandes Disponibles

#### 📊 Statistiques

| Commande | Description |
|----------|-------------|
| `/start` | Démarrer le bot et voir le menu |
| `/help` | Afficher l'aide |
| `/stats` | Statistiques globales des leads |

#### 🔥 Filtres par Catégorie

| Commande | Description |
|----------|-------------|
| `/hot` | Voir les leads hot (score ≥ 50) |
| `/warm` | Voir les leads warm (30-49) |
| `/cold` | Voir les leads cold (< 30) |

#### 🔍 Recherche

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/search <email>` | Chercher un lead par email | `/search user@example.com` |
| `/lead <id>` | Détails complets d'un lead | `/lead 123e4567-e89b-12d3-a456-426614174000` |
| `/recent` | Les 10 derniers leads | `/recent` |
| `/qualified` | Leads qualifiés (score ≥ 50) | `/qualified` |

### 💬 Langage Naturel

Le bot comprend aussi le langage naturel ! Vous pouvez lui poser des questions :

**Exemples:**
- "Combien de leads hot avons-nous ?"
- "Montre-moi les leads récents"
- "Quels sont les leads urgents ?"
- "Statistiques"

## 📊 Exemples de Réponses

### `/stats` - Statistiques

```
📊 **Statistiques des Leads**

**Total**: 42 leads

**Par Catégorie:**
🔥 Hot: 12 (29%)
🌟 Warm: 18 (43%)
❄️  Cold: 12 (29%)

**Par Statut:**
✅ Qualifiés: 15
📞 Contactés: 8

**Métriques:**
📈 Score moyen: 45/100
🆕 Dernières 24h: 5
```

### `/hot` - Leads Hot

```
🔥 **Leads Hot** (12 total)

1. **Jean Dupont** (jean@example.com)
   Score: 68/100 | Acme Corp
   ID: `123e4567-e89b-12d3-a456-426614174000`

2. **Marie Martin** (marie@startup.fr)
   Score: 72/100 | Startup SAS
   ID: `234e5678-e89b-12d3-a456-426614174001`

Utilisez /lead <id> pour voir les détails.
```

### `/lead <id>` - Détails Complets

```
🔥 **Lead Details**

━━━━━━━━━━━━━━━━━━━━
👤 **Contact**
Jean Dupont
📧 jean@example.com
📱 +33 6 12 34 56 78
🏢 Acme Corp
🌍 France

━━━━━━━━━━━━━━━━━━━━
📊 **Qualification**
✅ Status: **QUALIFIED**
🔥 Category: **HOT**
Score: **68/100**
Complétude: **85%**

━━━━━━━━━━━━━━━━━━━━
🎯 **BANT Score**
💰 Budget: 18/25
👤 Authority: 22/25
📌 Need: 15/25
⏰ Timeline: 13/25

━━━━━━━━━━━━━━━━━━━━
💼 **Project**
Nous cherchons à implémenter un chatbot IA pour notre service client. 
Besoin d'une solution RAG avec intégration à notre base de connaissances...

━━━━━━━━━━━━━━━━━━━━
🎯 **Pain Points**
• Temps de réponse trop long
• Coût du support client élevé
• Manque de disponibilité 24/7

━━━━━━━━━━━━━━━━━━━━
📋 **BANT Info**
💰 Budget: 50k-100k
⏰ Timeline: 1-3 mois
👤 Authority: decision-maker

━━━━━━━━━━━━━━━━━━━━
🔗 **Info**
ID: `123e4567-e89b-12d3-a456-426614174000`
Thread: `thread_abc123`
Créé: 10/11/2025
Mis à jour: 10/11/2025
```

## 🔐 Sécurité

### Qui peut utiliser le bot ?

Le bot répond à **tous les messages** qu'il reçoit. Pour limiter l'accès :

#### Option 1 : Groupe Privé (Recommandé)
- Créez un groupe Telegram privé
- Ajoutez seulement les membres de l'équipe commerciale
- Ajoutez le bot au groupe
- Le bot ne répondra que dans ce groupe

#### Option 2 : Whitelist (À implémenter)
Ajoutez une vérification dans `telegram-bot.service.ts` :

```typescript
// Liste des utilisateurs autorisés
const ALLOWED_USERS = [
  123456789,  // ID Telegram de l'utilisateur 1
  987654321,  // ID Telegram de l'utilisateur 2
];

// Dans chaque commande
if (!ALLOWED_USERS.includes(ctx.from.id)) {
  await ctx.reply("❌ Accès non autorisé");
  return;
}
```

## 🚀 Déploiement en Production

### Option 1 : PM2 (Recommandé)

```bash
# Installer PM2
npm install -g pm2

# Démarrer le bot
pm2 start scripts/start-telegram-bot.ts --name telegram-bot --interpreter tsx

# Voir les logs
pm2 logs telegram-bot

# Redémarrer
pm2 restart telegram-bot

# Arrêter
pm2 stop telegram-bot
```

### Option 2 : Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "bot"]
```

### Option 3 : Systemd Service

```ini
# /etc/systemd/system/telegram-bot.service
[Unit]
Description=IgnitionAI Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/ignition-landing-v2
ExecStart=/usr/bin/node /path/to/ignition-landing-v2/scripts/start-telegram-bot.ts
Restart=always

[Install]
WantedBy=multi-user.target
```

## 🔧 Personnalisation

### Ajouter une Nouvelle Commande

```typescript
// Dans telegram-bot.service.ts

this.bot.command("mycommand", async (ctx) => {
  try {
    // Votre logique ici
    const data = await leadService.getLeads();
    
    await ctx.reply("Résultat de ma commande", {
      parse_mode: "Markdown"
    });
  } catch (error) {
    console.error("Error:", error);
    await ctx.reply("❌ Erreur");
  }
});
```

### Améliorer le NLP

Pour un meilleur traitement du langage naturel, intégrez OpenAI :

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

this.bot.on(message("text"), async (ctx) => {
  const userMessage = ctx.message.text;
  
  // Analyser l'intention avec GPT
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Tu es un assistant qui aide à gérer des leads. Analyse l'intention de l'utilisateur et réponds avec une commande appropriée."
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });
  
  // Exécuter la commande suggérée
  // ...
});
```

## 📊 Monitoring

### Logs

Le bot log automatiquement :
- ✅ Démarrage/arrêt
- ❌ Erreurs
- 📊 Commandes exécutées

### Métriques à Suivre

- Nombre de commandes par jour
- Commandes les plus utilisées
- Temps de réponse moyen
- Erreurs

## 🐛 Troubleshooting

### Le bot ne répond pas

1. Vérifiez que le bot est démarré
2. Vérifiez les variables d'environnement
3. Vérifiez les logs : `pm2 logs telegram-bot`

### Erreur "Bot token is invalid"

- Vérifiez `TELEGRAM_BOT_TOKEN` dans `.env.local`
- Générez un nouveau token via @BotFather si nécessaire

### Le bot ne voit pas les messages du groupe

- Désactivez le Privacy Mode via @BotFather
- Commande : `/setprivacy` → Sélectionnez votre bot → `Disable`

## 📝 TODO / Améliorations Futures

- [ ] Authentification par whitelist
- [ ] Commandes d'administration (update status, assign lead)
- [ ] Notifications push pour nouveaux leads hot
- [ ] Intégration OpenAI pour NLP avancé
- [ ] Export de leads en CSV
- [ ] Statistiques avancées (graphiques)
- [ ] Rappels automatiques pour follow-up
- [ ] Intégration CRM (Salesforce, HubSpot)

## 🆘 Support

Pour toute question ou problème :
1. Consultez les logs
2. Vérifiez la configuration
3. Testez avec `/start` et `/help`
