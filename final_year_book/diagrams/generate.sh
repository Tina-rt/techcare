#!/bin/bash

# Script pour générer les diagrammes PlantUML en PNG
# Nécessite PlantUML installé (brew install plantuml sur macOS)

DIAGRAMS_DIR="$(dirname "$0")"
cd "$DIAGRAMS_DIR"

echo "🔄 Génération des diagrammes UML..."

# Vérifier si PlantUML est installé
if ! command -v plantuml &> /dev/null; then
    echo "❌ PlantUML n'est pas installé."
    echo "📦 Installation avec Homebrew: brew install plantuml"
    echo "📦 Ou télécharger le JAR: https://plantuml.com/download"
    exit 1
fi

# Générer tous les diagrammes (recherche récursive)
find . -name "*.puml" | while read -r file; do
    echo "  ➜ Génération de $file..."
    plantuml -tpng "$file"
done

echo "✅ Diagrammes générés avec succès dans $DIAGRAMS_DIR"
ls -lh *.png 2>/dev/null || echo "Aucun fichier PNG généré"
