# Changelog - Simplification des Notifications Telegram

## 🎯 Objectif
Rendre l'agent plus flexible et moins strict pour l'envoi de notifications Telegram.

## ✅ Changements Effectués

### 1. **Validation des Champs Simplifiée**

#### Avant (Trop Strict)
```typescript
// 4 champs obligatoires
if (!lead.firstName) missingFields.push("first name");
if (!lead.email) missingFields.push("email");
if (!lead.company) missingFields.push("company");
if (!lead.projectDescription) missingFields.push("project description");
```

#### Après (Simplifié)
```typescript
// Seulement email OU prénom requis
if (!lead.email && !lead.firstName) {
  missingFields.push("email or first name");
}
```

**Impact**: L'agent peut maintenant envoyer des notifications avec beaucoup moins d'informations.

### 2. **Seuil de Score Abaissé**

| Critère | Avant | Après |
|---------|-------|-------|
| Score minimum pour notification manuelle | 40 | 30 |
| Champs requis | 4 (firstName, email, company, projectDescription) | 1 (email OU firstName) |

### 3. **Description du Tool Simplifiée**

#### Avant
```
When to use:
- Lead score is >= 70 (hot lead)
- Lead has agreed to a call/demo
- You have enough contact information (at minimum: name, email, company, project description)
```

#### Après
```
When to use (SIMPLIFIED):
- Lead score is >= 30 (warm or hot lead)
- You have at least email OR name
- Lead shows genuine interest (asked questions, shared project info, wants demo/call)
```

**Impact**: L'agent comprend mieux quand il peut utiliser le tool.

## 📊 Comparaison

### Scénario 1: Lead avec Email Seulement

**Données**:
- Email: ✅ `user@example.com`
- Prénom: ❌
- Entreprise: ❌
- Description projet: ❌
- Score: 35

**Avant**: ❌ Bloqué (manque 3 champs requis)
**Après**: ✅ Notification envoyée

### Scénario 2: Lead avec Prénom Seulement

**Données**:
- Email: ❌
- Prénom: ✅ `Jean`
- Entreprise: ❌
- Description projet: ❌
- Score: 32

**Avant**: ❌ Bloqué (manque 3 champs requis)
**Après**: ✅ Notification envoyée

### Scénario 3: Lead Complet

**Données**:
- Email: ✅
- Prénom: ✅
- Entreprise: ✅
- Description projet: ✅
- Score: 42

**Avant**: ✅ Notification envoyée
**Après**: ✅ Notification envoyée (plus rapide)

## 🎯 Résultat

### Taux de Notification Estimé

- **Avant**: ~20% des leads (très strict)
- **Après**: ~60% des leads (flexible)

### Avantages

1. ✅ **Plus de leads notifiés**: L'équipe commerciale reçoit plus d'opportunités
2. ✅ **Moins de friction**: L'agent n'est pas bloqué par des validations strictes
3. ✅ **Meilleure réactivité**: Notifications envoyées plus tôt dans le parcours
4. ✅ **Flexibilité**: Fonctionne même avec peu d'informations

### Garde-fous Maintenus

- ❌ Pas de notification si score < 30 (évite le spam)
- ❌ Pas de notification si aucun contact (email ET prénom manquants)
- ❌ Pas de doublon (flag `telegramNotificationSent`)

## 📝 Fichiers Modifiés

1. `/ai/tools/sdr-tools.ts`
   - Validation simplifiée (ligne 212-224)
   - Seuil abaissé à 30 (ligne 227)
   - Description du tool mise à jour (ligne 158-178)

2. `/docs/SCORING_RULES.md`
   - Documentation mise à jour

## 🚀 Migration

Aucune migration nécessaire. Les changements sont rétrocompatibles.

Les leads existants avec plus d'informations continueront de fonctionner normalement.

## 🧪 Tests Recommandés

1. **Test avec email seulement**
   - Créer un lead avec juste un email
   - Score: 35
   - Vérifier que la notification est envoyée

2. **Test avec prénom seulement**
   - Créer un lead avec juste un prénom
   - Score: 32
   - Vérifier que la notification est envoyée

3. **Test avec score trop faible**
   - Créer un lead avec email
   - Score: 25
   - Vérifier que la notification est bloquée

4. **Test sans contact**
   - Créer un lead sans email ni prénom
   - Vérifier que la notification est bloquée

## 📅 Date
10 Novembre 2025

## 👤 Auteur
Cascade AI Assistant
