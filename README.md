Cette application nécessite d'avoir Docker mais peut être installer par le script si Docker n'est pas installé.

# Installation
Pour installer l'application avec les données de base (identifiant admin, paramètres, etc...) :

Exécuter le script bash et ajouter le flag -i.
```
./script -i
```
Si le script renvoie :
```
{utility: createtables}
{utility: init}
```
Celà veut dire que l'application s'est correctement installé avec des données de base. Si ce n'est pas le cas, attendez entre 30 seconds et une minutes et répété la même commande.


# Instalation avec Fixtures
(Nécessite Docker)
Pour installer l'application avec un jeu de données de test :

Exécuter les commandes suivantes :
```
cd stack/
docker compose up --build
```
Une fois l'application démarrer, se rendre sur ```localhost:44300/utility/createtables``` et ```localhost:44300/utility/fixtures```.

Si les deux pages renvoie ```{utility: createtables}``` et ```{utility: fixtures}```, les données sont crées.

# Utilisation
## Ordre d'import
Importer des candidats nécessite d'avoir des matières dans la base de données.

Importer des professeurs nécessite d'avoir des matières et salle dans la base de données.

L'ordre d'import serait le suivant :
- Matières
- Salles
- Candidats
- Professeurs

## Génération calendrier
Le calendrier peut ne pas réussir à créer la totalité des créneaux, il est possible de créer les créneaux restants soit-même depuis la page créneau. Cependant, cette méthode ne tient pas compte des temps de pause candidat et professeur.

## Suppression
Les boutons de suppression supprime les liens avec les autres entités. Supprimer toutes les salles retire son association avec les professeurs.

Le bouton de suppression globale dans les paramètres supprimes tout sauf les identifiants d'accès et les paramètres.