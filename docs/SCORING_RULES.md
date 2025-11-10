# Lead Scoring Rules - Assouplies

## 📊 Nouveaux Seuils (Plus Flexibles)

### Catégories de Leads

| Catégorie | Score BANT | Ancien Seuil | Nouveau Seuil |
|-----------|------------|--------------|---------------|
| 🔥 **Hot** | ≥ 50/100 | ≥ 70 | ≥ 50 |
| 🌟 **Warm** | ≥ 30/100 | ≥ 40 | ≥ 30 |
| ❄️ **Cold** | < 30/100 | < 40 | < 30 |

### Critères de Qualification

| Critère | Ancien | Nouveau |
|---------|--------|---------|
| **Ready for Handoff** | Score ≥ 70 ET Complétude ≥ 70% | Score ≥ 50 ET Complétude ≥ 50% |
| **Statut "Qualified"** | Complétude ≥ 70% | Complétude ≥ 60% |
| **Notification Telegram** | Hot OU (Warm ET 80% complétude) | Hot OU (Warm ET 60% complétude) |
| **Seuil Minimum Tool** | Score ≥ 50 | Score ≥ 40 |

## 🎯 Scoring BANT (Inchangé)

Chaque critère vaut **25 points** maximum :

### Budget (0-25 points)
- **25 pts**: 100k+, million, enterprise, unlimited
- **18 pts**: 50k, moderate, flexible, allocated
- **10 pts**: small, limited, POC, exploring
- **12 pts**: Budget mentionné mais flou

### Authority (0-25 points)
- **25 pts**: Decision-maker (CEO, CTO, VP, Director)
- **18 pts**: Influencer (Manager, Team Lead)
- **8 pts**: Researcher (Individual contributor)
- **Inférence**: Basée sur le contexte si non fourni

### Need (0-25 points)
- **10 pts**: Description projet > 100 caractères
- **8 pts**: 3+ pain points identifiés
- **5 pts**: Mots-clés d'urgence (urgent, ASAP, critical)
- **2 pts**: Use case spécifique (chatbot, RAG, LLM)

### Timeline (0-25 points)
- **25 pts**: Immédiat (this week, ASAP, urgent)
- **20 pts**: Court terme (1-3 mois, Q1-Q4)
- **15 pts**: Moyen terme (4-6 mois)
- **10 pts**: Long terme (6+ mois, année)
- **5 pts**: Exploratoire (no rush, flexible)

## 📋 Complétude (0-100%)

### Champs Requis (70% du score)
- firstName
- lastName
- email
- company
- country
- projectDescription

### Champs Optionnels Valorisés (30% du score)
- phone
- budget
- timeline
- authority

## 🔔 Règles de Notification Telegram

### ✅ Notification Envoyée Si :

1. **Lead Hot** (score ≥ 50)
   - Prêt pour suivi immédiat
   - Notification automatique

2. **Lead Warm avec bonne complétude** (score ≥ 30 ET complétude ≥ 60%)
   - Besoin de nurturing mais qualifié
   - Notification pour visibilité

### ❌ Notification Bloquée Si :

1. **Aucune information de contact** (SIMPLIFIÉ)
   - Besoin d'au moins email OU prénom
   - Tous les autres champs sont optionnels

2. **Score trop faible** (< 30)
   - Continue la qualification
   - Collecte plus d'informations

3. **Déjà notifié**
   - Évite les doublons
   - Flag `telegramNotificationSent = true`

## 💡 Exemples

### Exemple 1: Lead Hot (Score 52)
```
Budget: 18/25 (50k mentionné)
Authority: 15/25 (Manager inféré)
Need: 12/25 (Description détaillée + 2 pain points)
Timeline: 7/25 (Timeline flou)
Total: 52/100 → HOT
Complétude: 65%
✅ Notification envoyée
```

### Exemple 2: Lead Warm (Score 42)
```
Budget: 12/25 (Budget mentionné)
Authority: 12/25 (Company fournie)
Need: 10/25 (Description moyenne)
Timeline: 8/25 (Timeline flou)
Total: 42/100 → WARM
Complétude: 70%
✅ Notification envoyée (warm + 70% complétude)
```

### Exemple 3: Lead Cold (Score 25)
```
Budget: 0/25
Authority: 8/25
Need: 10/25 (Description basique)
Timeline: 7/25
Total: 25/100 → COLD
Complétude: 40%
❌ Pas de notification (score trop faible)
```

## 🚀 Impact des Changements

### Avant (Strict)
- Seulement les leads avec score ≥ 70 étaient notifiés
- Beaucoup de leads qualifiés passaient inaperçus
- Trop de friction dans le processus

### Après (Flexible)
- Les leads avec score ≥ 50 (hot) sont notifiés immédiatement
- Les leads warm (≥ 30) avec 60% de complétude sont aussi notifiés
- Meilleure couverture des opportunités
- Équipe commerciale informée plus tôt

## 📝 Notes

- Les seuils peuvent être ajustés dans `/service/lead-scoring.service.ts`
- Les règles de notification sont dans `/ai/tools/sdr-tools.ts`
- Le scoring est automatique et transparent pour l'utilisateur
- L'agent continue à qualifier même après notification
