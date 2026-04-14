# Instructions pour générer les diagrammes PlantUML

## Installation de PlantUML

### Option 1 : Via Homebrew (macOS)
```bash
brew install plantuml
```

### Option 2 : Via le JAR
1. Télécharger PlantUML: https://plantuml.com/download
2. Installer Java (si pas déjà installé): `brew install openjdk`

### Option 3 : Utiliser le service en ligne
Aller sur https://www.plantuml.com/plantuml/ et coller le contenu des fichiers .puml

## Génération des diagrammes

### Avec le script bash (si PlantUML installé)
```bash
cd diagrams
./generate.sh
```

### Manuellement
```bash
cd diagrams
plantuml -tpng use_case.puml
plantuml -tpng sequence_saga.puml
plantuml -tpng class_architecture.puml
```

### Avec Visual Studio Code
1. Installer l'extension "PlantUML" (jebbs.plantuml)
2. Ouvrir un fichier .puml
3. Appuyer sur Alt+D (ou Cmd+D sur macOS) pour prévisualiser
4. Clic droit > Export Current Diagram > PNG

## Organisation des fichiers
Les diagrammes sont classés par type dans des sous-dossiers :

- `use_case/use_case.puml` : Diagramme de cas d'utilisation (Acteurs et fonctionnalités)
- `sequence/sequence_saga.puml` : Diagramme de séquence du pattern Saga avec compensation
- `sequence/sequence_auth.puml` : Diagramme de séquence du flux d'authentification JWT
- `sequence/sequence_product_creation.puml` : Diagramme de séquence de création de produit
- `class/class_architecture.puml` : Diagramme de classe de l'architecture microservices
- `activity/activity_order.puml` : Diagramme d'activité du processus de commande (Client)
- `activity/activity_inventory.puml` : Diagramme d'activité de la gestion des stocks (Pharmacien)

Les fichiers PNG générés seront créés dans leurs dossiers respectifs.
