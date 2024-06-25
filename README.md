Cette application nécessite d'avoir Docker mais est installé par le script si Docker n'est pas installé.

# Installation
Pour installer l'application avec les données de base (identifiant admin, paramètres, etc...) :
Exécuter le script bash et ajouter le flag -i.
```./script -i```
Si le script renvoie :
```
{utility: createtables}
{utility: init}
```
Celà veut dire que l'application s'est correctement installé avec des données de base. Si ce n'est pas le cas, attendez entre 30 seconds et une minutes et répété la même commande.


# Instalation avec Fixtures
(Nécessite Docker)
Pour installer l'application avec un jeu de données de test :
Exécuter les commandes suivantes
```
cd stack/
docker compose up --build
```
