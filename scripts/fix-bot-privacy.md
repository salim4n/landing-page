# Désactiver le Privacy Mode du Bot Telegram

## Problème
Le bot ne voit pas les messages du groupe car le "Privacy Mode" est activé.

## Solution

### Étape 1 : Ouvrez @BotFather dans Telegram

### Étape 2 : Envoyez la commande
```
/setprivacy
```

### Étape 3 : Sélectionnez votre bot
- Choisissez `@ignitionChatBot`

### Étape 4 : Désactivez le Privacy Mode
- Sélectionnez `Disable`

### Étape 5 : Testez
Après avoir désactivé le Privacy Mode :
1. Envoyez un nouveau message dans votre groupe
2. Relancez le script :
```bash
TELEGRAM_BOT_TOKEN="7634333245:AAFunGTryflKir6yjqqW-dxnrYrISyO2UFY" npx tsx scripts/get-telegram-info.ts
```

## Alternative : Méthode Manuelle

Si le script ne fonctionne toujours pas, récupérez l'ID manuellement :

1. Ouvrez votre navigateur
2. Visitez : `https://api.telegram.org/bot7634333245:AAFunGTryflKir6yjqqW-dxnrYrISyO2UFY/getUpdates`
3. Cherchez `"chat":{"id":-1234567890`
4. Le nombre négatif est votre ID de groupe
5. Ajoutez-le dans `.env.local` :
   ```
   TELEGRAM_SALES_CHAT_ID=-1234567890
   ```

## Vérifications Supplémentaires

### Le bot est-il bien admin ?
- Paramètres du groupe → Administrateurs
- Vérifiez que `@ignitionChatBot` est dans la liste
- Permissions nécessaires : "Envoyer des messages"

### Le groupe est-il bien un groupe ?
- Pas un "canal" (channel)
- Pas une conversation privée
- Un vrai "groupe" Telegram

### Message envoyé APRÈS avoir ajouté le bot ?
- Les bots ne voient que les messages envoyés APRÈS leur ajout
- Envoyez un nouveau message maintenant
