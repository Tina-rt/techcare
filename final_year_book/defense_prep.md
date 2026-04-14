# Aide-Mémoire pour la Soutenance : Architecture Microservices Techcare

Ce document rassemble les définitions clés et les questions "pièges" ou classiques que le jury pourrait vous poser sur votre architecture.

---

## 1. Concepts d'Architecture Fondamentaux

*   **Microservices :** Approche architecturale où une grosse application (monolithe) est découpée en petits services indépendants, chacun responsable métier d'un domaine précis, déployable séparément et communiquant via le réseau.
*   **API Gateway :** Point d'entrée unique de votre application côté backend. C'est le chef d'orchestre qui reçoit les requêtes HTTP, valide les tokens (JWT), et dispatche vers les bons microservices. *Rôle annexe : CORS, rate-limiting.*
*   **Architecture Hexagonale (Ports and Adapters) :** Séparation stricte du code en couches (Domaine / Application / Infrastructure) pour que la logique métier ne dépende jamais des outils (pas de code "SQL" dans la logique de validation d'un produit).
*   **Théorème CAP :** Dans un système distribué, on ne peut garantir que 2 des 3 propriétés : **C**onsistency (Cohérence absolue), **A**vailability (Disponibilité) et **P**artition Tolerance (Tolérance au partitionnement réseau). Techcare sacrifie un peu de "C" pour du "A" et "P" (d'où l'Eventual Consistency).

## 2. Communication & Résilience

*   **Communication Synchrone (HTTP/gRPC) :** Le client attend que le service ait fini de traiter pour avoir la réponse. *Problème en microservices : si le service B est lent, le service A bloque.*
*   **Communication Asynchrone (RabbitMQ) :** Le service A envoie un message dans une file d'attente et ne bloque pas. Le service B le consomme quand il est prêt.
*   **RabbitMQ / Broker de messages :** Facteur logiciel. Il reçoit les messages (Producer), les stocke dans des files (Queues) de manière sécurisée (même en cas de crash) et les livre aux bons services métiers (Consumers).
*   **Pattern SAGA :** En microservices, on n'a pas de transaction "ACID" qui traverse tout le réseau. La SAGA est une suite de transactions locales. Si une étape échoue (ex: Payment failed), le système déclenche une **transaction de compensation** (ex: relâcher le stock réservé) pour annuler l'action précédente.
*   **L'Impôt de la distribution (Distributed Tax) :** Le coût de performance (latence réseau, sérialisation JSON, routage) qu'on paye en passant d'un monolithe hyper-rapide (appels de fonctions) à un réseau de microservices.
*   **Service Mesh (Ex: Istio) :** Couche d'infrastructure logicielle (proxys "sidecars") qui gère le trafic réseau *entre* les microservices pour ajouter la sécurité (chiffrement mTLS), la résilience (retry automatique) et le traçage, sans coder ça dans Node.js.

## 3. Technologies Spécifiques

*   **NestJS :** Framework Node.js TypeScript pensé pour le monde de l'entreprise. Imite le monde Angular / Spring Boot avec ses Modules, Controllers, et Providers (Injection de dépendance).
*   **JWT (JSON Web Token) :** Jeton de sécurité encodé. Permet l'authentification "Stateless" : le serveur n'a pas besoin de stocker la session en base de données, l'identité et les droits sont signés _dans_ le token lui-même.
*   **Drizzle ORM :** Contrairement à TypeORM ou Prisma, c'est un constructeur de requêtes SQL hyper léger ("headless") et totalement Typesafe, meilleur pour les performances de cold-start et le contrôle exact du SQL généré.
*   **Docker / Conteneurisation :** Encapsulation du code et de ses dépendances système dans une boîte isolée (conteneur). Assure que le code tournera de la même manière sur votre Mac de dev et sur le serveur de production.

---

## 🛑 Questions Fréquentes du Jury (et comment y répondre)

**Q1. "Pourquoi utiliser des microservices pour le projet Techcare ? Est-ce que ce n'est pas tirer au bazooka sur une mouche (over-engineering) ?"**
> *C'est la question piège classique.*
> **Réponse :** "Pour une pharmacie de quartier avec 2 utilisateurs, oui, ce serait de l'over-engineering. Mais pour Techcare, l'objectif est une plateforme B2B/B2C avec des pics de charge. Les microservices permettent de scaler indépendamment : on peut cloner le service de consultation catalogue 10 fois le jour du Black Friday, sans avoir à dupliquer le service de paiement qui est lourd. De plus, cela isole les pannes : si le serveur mail crashe, les clients peuvent toujours valider des paniers."

**Q2. "Je vois que votre requête a ralenti (de 8ms dans le monolithe à 22ms). C'est grave ?"**
> **Réponse :** "C'est normal, c'est ce qu'on appelle "l'impôt de la distribution". Transiter par la Gateway, RabbitMQ, et sérialiser/désérialiser du JSON a un coût réseau. Perdre 14 millisecondes pour un utilisateur humain est imperceptible, mais le bénéfice global (la plateforme ne plantera pas si 10 000 utilisateurs arrivent) justifie largement ce mini-compromis de latence. De plus, on peut l'optimiser plus tard avec un cache Redis ou du gRPC."

**Q3. "Que se passe-t-il si RabbitMQ tombe en panne (SPOF) ?"**
> **Réponse :** "C'est effectivement le risque majeur (Single Point of Failure). Pour la mise en production réelle, nous mettrions en place deux choses : un cluster RabbitMQ (réplication sur plusieurs serveurs) et le pattern *Transactional Outbox*, où le service écrit l'événement dans sa propre base de données avant de l'envoyer au réseau, garantissant qu'aucune donnée n'est perdue."

**Q4. "Comment les factures et les données clients sont-elles sécurisées contre les autres microservices ?"**
> **Réponse :** "Grâce à la stratégie Zero Trust, au JWT et au RBAC abordés dans la section III.6. L'API Gateway s'assure que seules les requêtes avec un profil authentifié (ex: Pharmacien) atteignent le backend. De plus, l'identité de l'utilisateur est propagée tout le long du réseau : l'Order Manager ne renverra jamais les données qui n'appartiennent pas exactement au token envoyé."

**Q5. "Pourquoi Drizzle ORM avec PostgreSQL pour l'inventaire, mais MongoDB pour les produits ?"**
> **Réponse :** "Nous appliquons le paradigme de 'Persistance Polyglotte'. Le produit a besoin de flexibilité : des caractéristiques peuvent s'ajouter (tailles, types d'effets) et une recherche textuelle puissante est nécessaire (NoSQL / MongoDB). L'inventaire (quantité) et les paiements exigent par contre une très stricte cohérence et des transactions ACID garanties (Relationnel / PostgreSQL)."

**Q6. "Qu'est-ce que l'Eventual Consistency (Consistance Éventuelle) ?"**
> **Réponse :** "C'est accepter qu'à l'instant "T", tous les serveurs n'ont pas exactement la même vision des données, mais qu'ils l'auront au bout de quelques millisecondes. Exemple : l'administrateur crée un produit, il voit le succès immédiat. Peut-être que le service de Reporting ou Elasticsearch mettra 50 millisecondes de plus à inscrire la donnée de son côté. Pour le métier, cette latence est totalement acceptable."
