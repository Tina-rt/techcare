# 📦 Techcare API — Documentation des Endpoints

> **Base URL :** `http://localhost:4000`  
> **Format des réponses :** `application/json`  
> **Authentification :** JWT Bearer Token (header `Authorization: Bearer <token>`)  
> 🔒 = Route protégée (JWT requis) | 🌐 = Route publique

---

## Table des matières

- [🔐 Authentification](#-authentification)
- [📦 Produits](#-produits)
- [🗂️ Catégories](#️-catégories)
- [📊 Inventaire](#-inventaire)
- [🛒 Panier](#-panier)
- [📋 Commandes](#-commandes)
- [💳 Paiement](#-paiement)
- [📁 Fichiers](#-fichiers)
- [🔔 Notifications](#-notifications)

---

## 🔐 Authentification

### `POST /auth/signup` 🌐
Crée un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```
**Réponse `201`:**
```json
{
  "id": "6502d...",
  "email": "user@example.com"
}
```

---

### `POST /auth/signin` 🌐
Connecte un utilisateur existant et retourne un JWT.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```
**Réponse `200`:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6..."
}
```

---

### `GET /auth/me` 🔒
Retourne le profil de l'utilisateur connecté (extrait du JWT).

**Headers:**
```
Authorization: Bearer <token>
```
**Réponse `200`:**
```json
{
  "userId": "6502d...",
  "email": "user@example.com",
  "role": "CLIENT"
}
```

---

## 📦 Produits

### `GET /products` 🌐
Retourne la liste de tous les produits du catalogue.

**Réponse `200`:**
```json
[
  {
    "_id": "6502d...",
    "name": "Doliprane 1000mg",
    "description": "Analgésique et antipyrétique",
    "price": 3.50,
    "category": "6502c...",
    "image": "https://bucket.s3.amazonaws.com/products/..."
  }
]
```

---

### `GET /products/:id` 🌐
Retourne un produit par son identifiant.

**Params:** `id` — ObjectId MongoDB du produit

**Réponse `200`:**
```json
{
  "_id": "6502d...",
  "name": "Doliprane 1000mg",
  "price": 3.50,
  "category": "6502c...",
  "image": "https://..."
}
```

---

### `POST /products` 🔒
Crée un nouveau produit. Accepte une image (multipart/form-data).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data:**
| Champ | Type | Description |
|---|---|---|
| `name` | string | Nom du produit |
| `description` | string | Description |
| `price` | number | Prix unitaire |
| `category` | string | ObjectId de la catégorie |
| `image` | File | Image du produit (jpg, png) |

**Réponse `201`:** Produit créé avec URL de l'image S3.

---

### `PUT /products/:id` 🔒
Met à jour un produit existant.

**Params:** `id` — ObjectId du produit  
**Body:** Mêmes champs que la création (sans l'image).

**Réponse `200`:** Produit mis à jour.

---

### `DELETE /products/:id` 🔒
Supprime un produit.

**Params:** `id` — ObjectId du produit  
**Réponse `200`:** `{ "deleted": true }`

---

## 🗂️ Catégories

### `GET /category` 🌐
Retourne toutes les catégories.

**Réponse `200`:**
```json
[
  { "_id": "6502c...", "name": "Analgésiques", "description": "..." }
]
```

---

### `GET /category/:id` 🌐
Retourne une catégorie par son identifiant.

---

### `POST /category` 🔒
Crée une nouvelle catégorie.

**Body:**
```json
{
  "name": "Antibiotiques",
  "description": "Médicaments antibactériens"
}
```

---

### `PUT /category/:id` 🔒
Met à jour une catégorie.

**Body:** Mêmes champs que la création.

---

### `DELETE /category/:id` 🔒
Supprime une catégorie.

---

## 📊 Inventaire

### `GET /inventory` 🌐
Retourne le stock de tous les produits.

**Réponse `200`:**
```json
[
  { "productId": "6502d...", "quantity": 150 }
]
```

---

### `GET /inventory/:productId` 🌐
Retourne le stock d'un produit spécifique.

**Params:** `productId` — Identifiant du produit

**Réponse `200`:**
```json
{ "productId": "6502d...", "quantity": 150 }
```

---

### `POST /inventory/update` 🔒
Met à jour le stock d'un produit (admin/pharmacien).

**Body:**
```json
{
  "productId": "6502d...",
  "quantity": 50
}
```
> ⚠️ `quantity` est **ajoutée** au stock existant (valeur négative pour décrémenter).

---

## 🛒 Panier

### `POST /cart/add` 🌐
Ajoute un article au panier d'un utilisateur.

**Body:**
```json
{
  "userId": "user123",
  "productId": "6502d...",
  "quantity": 2,
  "price": 3.50,
  "name": "Doliprane 1000mg",
  "image": "https://..."
}
```

---

### `GET /cart/:userId` 🌐
Récupère le panier complet d'un utilisateur.

**Params:** `userId` — Identifiant de l'utilisateur

**Réponse `200`:**
```json
{
  "userId": "user123",
  "items": [
    { "productId": "...", "name": "...", "quantity": 2, "price": 3.50 }
  ],
  "total": 7.00
}
```

---

### `PUT /cart/update` 🌐
Met à jour la quantité d'un article dans le panier.

**Body:**
```json
{
  "userId": "user123",
  "productId": "6502d...",
  "quantity": 5
}
```

---

### `DELETE /cart/remove` 🌐
Supprime un article du panier.

**Body:**
```json
{
  "userId": "user123",
  "productId": "6502d..."
}
```

---

### `DELETE /cart/clear/:userId` 🌐
Vide entièrement le panier d'un utilisateur.

**Params:** `userId` — Identifiant de l'utilisateur

---

## 📋 Commandes

### `POST /order/create` 🌐
Crée une nouvelle commande et déclenche la Saga de paiement.

**Body:**
```json
{
  "userId": "user123",
  "shippingAddress": {
    "fullName": "Jean Dupont",
    "address": "12 Rue de la Paix",
    "city": "Paris",
    "state": "IDF",
    "postalCode": "75001",
    "country": "France",
    "phone": "+33612345678"
  },
  "notes": "Livrer avant 18h"
}
```
**Réponse `201`:**
```json
{
  "_id": "6981b...",
  "status": "PENDING",
  "userId": "user123",
  "createdAt": "2026-02-20T18:00:00Z"
}
```

---

### `GET /order` 🌐
Retourne toutes les commandes (admin).

---

### `GET /order/:orderId` 🌐
Retourne une commande par son identifiant.

**Params:** `orderId` — ObjectId de la commande

---

### `GET /order/user/:userId` 🌐
Retourne toutes les commandes d'un utilisateur.

**Params:** `userId` — Identifiant de l'utilisateur

---

### `PUT /order/status` 🌐
Met à jour le statut d'une commande (admin/pharmacien).

**Body:**
```json
{
  "orderId": "6981b...",
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```
**Valeurs de `status`:** `PENDING` | `CONFIRMED` | `shipped` | `DELIVERED` | `CANCELLED`

---

### `PUT /order/cancel/:orderId` 🌐
Annule une commande et déclenche la compensation Saga (libération du stock).

**Params:** `orderId` — ObjectId de la commande

---

## 💳 Paiement

> ⚠️ Les paiements utilisent **Stripe**. En développement, utiliser les [cartes de test Stripe](https://stripe.com/docs/testing).

### `POST /payment/create-intent` 🌐
Crée un PaymentIntent Stripe pour initier le paiement.

**Body:**
```json
{
  "orderId": "6981b...",
  "amount": 59.98,
  "currency": "eur"
}
```
**Réponse `201`:**
```json
{
  "clientSecret": "pi_3O..._secret_...",
  "paymentIntentId": "pi_3O..."
}
```
> 💡 Le `clientSecret` doit être passé au SDK Stripe côté frontend pour confirmer le paiement.

---

### `POST /payment/confirm` 🌐
Confirme un paiement après validation Stripe côté frontend.

**Body:**
```json
{
  "paymentIntentId": "pi_3O...",
  "orderId": "6981b..."
}
```

---

### `POST /payment/refund` 🌐
Effectue un remboursement complet d'un paiement.

**Body:**
```json
{
  "paymentIntentId": "pi_3O..."
}
```

---

### `GET /payment/intent/:paymentIntentId` 🌐
Récupère les détails d'un PaymentIntent Stripe.

**Params:** `paymentIntentId` — Identifiant Stripe du paiement

---

## 📁 Fichiers

### `POST /files/upload` 🔒
Upload un fichier vers AWS S3.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data:**
| Champ | Type | Description |
|---|---|---|
| `file` | File | Fichier à uploader |
| `folder` | string | (optionnel) Dossier cible S3 (ex: `products`, `avatars`) |

**Réponse `201`:**
```json
{
  "url": "https://techcare-bucket.s3.amazonaws.com/products/1708456723-image.jpg"
}
```

---

## 🔔 Notifications

### `GET /notification/test` 🌐
Vérifie que le service de notification est opérationnel.

**Réponse `200`:**
```json
{ "message": "Notification Service is up and running!" }
```

---

### `GET /notification/all` 🌐
Récupère l'historique de toutes les notifications envoyées.

---

### `POST /notification/send` 🌐
Envoie une notification manuelle (email ou temps réel).

**Body:**
```json
{
  "userId": "user123",
  "type": "email",
  "subject": "Votre commande est confirmée",
  "message": "Votre commande #6981b a été confirmée."
}
```

---

## 🛠️ Codes d'erreur communs

| Code | Signification |
|---|---|
| `400` | Données invalides / champ manquant |
| `401` | Token JWT manquant ou expiré |
| `403` | Rôle insuffisant (ex: action réservée admin) |
| `404` | Ressource introuvable |
| `500` | Erreur interne du serveur / microservice indisponible |
| `503` | RabbitMQ ou microservice temporairement hors ligne |

---

## 🔗 Variables d'environnement Frontend

Pour connecter votre frontend à cette API, configurez :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

---

*Documentation générée le 2026-02-20 — Techcare v1.0*
