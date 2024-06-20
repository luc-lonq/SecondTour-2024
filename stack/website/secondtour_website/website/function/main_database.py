import traceback

from itsdangerous import json

from . import main_security
from ..database.main_database import *


def delete_all_content():
    try:
        # choix matiere
        response = ask_api("data/delete/choix_matiere", {})
        if response.status_code != 202:
            return "Erreur lors de la suppression des choix de matières", "danger"

        # creneaux
        response = ask_api("data/delete/creneau", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des creneaux")
            return "Erreur lors de la suppression des creneaux", "danger"

        # professeurs
        response = ask_api("data/delete/professeur", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des professeurs")
            return "Erreur lors de la suppression des professeurs", "danger"

        # matieres
        response = ask_api("data/delete/matiere", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des matieres")
            return "Erreur lors de la suppression des matieres", "danger"

        # candidats
        response = ask_api("data/delete/candidat", {})
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression des candidats")
            return "Erreur lors de la suppression des candidats", "danger"

        # salles
        response = ask_api("data/delete/salle", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des salles")
            return "Erreur lors de la suppression des salles", "danger"

        # series
        response = ask_api("data/delete/serie", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des series")
            return "Erreur lors de la suppression des series", "danger"

        return ['La base de données a été vidée', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def insert_admin():
    response = ask_api("data/insert/utilisateur", {"id_utilisateur": "null", "email": "admin@ac-poitiers.fr",
                                                   "password": "$p5k2$3e8$AfpOzesj$.KoGR.raCRkA3gne.aZrF1bQobRfdSIH",
                                                   "admin": "true", "id_professeur": "null"})
    if response.status_code != 201:
        logging.warning("Erreur lors de la suppression des données")


def add_account(email, password, user_type_string, output=False):
    hashed_password = main_security.hash_password(password)
    user_type = True if user_type_string == "Administrateur" else False

    try:
        tokens_filter = {"email": email, "admin": user_type_string}
        response = ask_api("data/fetchfilter/token", tokens_filter)
        if response.status_code != 200:
            logging.warning(
                "Impossible de récupérer tout les tokens")
            return ['Impossible de récupérer tout les tokens', 'danger']
        id_prof = response.json()[0]["id_professeur"]

        user = {"id_utilisateur": "null", "email": email, "password": hashed_password,
                "admin": "true" if user_type else "false", "id_professeur": id_prof}
        response = ask_api("data/insert/utilisateur", user)
        if response.status_code != 201:
            logging.warning("Erreur lors de l'insertion d'un utilisateur")
            if output:
                return (user, ["Erreur lors de l'insertion d'un utilisateur", "danger"])
            return "Erreur lors de l'insertion d'un utilisateur", "danger"
        user["id_utilisateur"] = response.json()["id"]
        if output:
            logging.warning('L\'utilisateur a bien été crée')
            return (user, ['L\'utilisateur a bien été crée', 'success'])
        logging.warning('L\'utilisateur a bien été crée')
        return ['L\'utilisateur a bien été crée', 'success']
    except Exception:
        if output:
            logging.warning('Erreur : ' + traceback.logging.warning_exc())
            return (user, ['Erreur : ' + traceback.logging.warning_exc(), 'danger'])
        logging.warning('Erreur : ' + traceback.logging.warning_exc())
        return ['Erreur : ' + traceback.logging.warning_exc(), 'danger']


def delete_account(id):
    try:
        user = {"id_utilisateur": id, "admin": "false"}
        response = ask_api(f"data/deletefilter/utilisateur", user)
        if response.status_code != 202:
            logging.warning("Impossible de supprimer cet utilisateur")
            return ['Impossible de supprimer cet utilisateur', 'danger']
        return False

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_serie(serie_choice, ret=False):
    try:
        serie = {"id_serie": "null", "nom": serie_choice}
        response = ask_api("data/insert/serie", serie)
        if response.status_code != 201:
            logging.warning("Erreur lors de l'insertion d'une serie")
            if ret:
                return (["Erreur lors de l'insertion d'une serie", "danger"], serie)
            return "Erreur lors de l'insertion d'une serie", "danger"
        serie["id_serie"] = response.json()["id"]
        if not ret:
            return ['La série a bien été crée', 'success']
        else:
            return [['La série a bien été crée', 'success'], serie]

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return [['Erreur : ' + traceback.format_exc(), 'danger']]


def update_serie(id, nom):
    try:
        serie = {"filter": {"id_serie": id}, "data": {"id_serie": id,
                                                      "nom": nom}}
        response = ask_api("data/updatefilter/serie", serie)
        if response.status_code != 202:
            logging.warning("Erreur lors de l'insertion des séries")
            return "Erreur lors de l'insertion des séries", "danger"

        return ['La série a bien été modifiée', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_serie(id):
    try:
        candidat_filter = {"id_serie": id}
        response = ask_api("data/fetchfilter/candidat", candidat_filter)
        if response.status_code != 200:
            logging.warning(
                "Impossible de récupérer tout les candidats correspondants à cette série")
            return ['Impossible de récupérer tout les candidats correspondants à cette série', 'danger']
        candidats = response.json()

        for candidat in candidats:
            # delete creneau
            creneau = {"id_candidat": candidat['id_candidat']}
            response = ask_api(f"data/deletefilter/creneau", creneau)
            if response.status_code != 202:
                logging.warning(
                    "Impossible de supprimer les creneaux des candidats correspondants à cette serie")
                return ['Impossible de supprimer les creneaux des candidats correspondants à cette serie', 'danger']
            # delete choix_matiere
            choix_matiere = {"id_candidat": candidat['id_candidat']}
            response = ask_api(
                f"data/deletefilter/choix_matiere", choix_matiere)
            if response.status_code != 202:
                logging.warning(
                    "Impossible de supprimer les choix matiere des candidats correspondants à cette serie")
                return ['Impossible de supprimer les choix matiere des candidats correspondants à cette serie',
                        'danger']

        response = ask_api(f"data/deletefilter/candidat", candidat_filter)
        if response.status_code != 202:
            logging.warning(
                "Impossible de supprimer les candidats correspondants à cette serie")
            return ['Impossible de supprimer les candidats correspondants à cette serie', 'danger']

        matiere_filter = {"id_serie": id}
        response = ask_api(f"data/fetchfilter/matiere", matiere_filter)
        if response.status_code != 200:
            logging.warning(
                "Impossible de supprimer les matieres correspondantes")
            return ['Impossible de supprimer les matieres correspondantes', 'danger']
        matieres = response.json()

        for matiere in matieres:
            professeur_filter = {"matiere": matiere["id_matiere"]}
            response = ask_api(f"data/deletefilter/professeur", professeur_filter)
            if response.status_code != 202:
                logging.warning(
                    "Impossible de récupérer les professeurs")
                return ['Impossible de récupérer les professeurs', 'danger']

        response = ask_api(f"data/deletefilter/matiere", matiere_filter)
        if response.status_code != 202:
            logging.warning(
                "Impossible de supprimer les matieres correspondantes")
            return ['Impossible de supprimer les matieres correspondantes', 'danger']

        serie_filter = {"id_serie": id}
        response = ask_api(f"data/deletefilter/serie", serie_filter)
        if response.status_code != 202:
            logging.warning("Impossible de supprimer cette serie", "danger")
            return ['Impossible de supprimer cette serie', 'danger']

        return ['La série a bien été supprimé', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_matiere(name, serie_id, temps_preparation, temps_preparation_tiers_temps, temps_passage,
                temps_passage_tiers_temps, loge, ret=False):
    try:
        serie_filter = {"id_serie": serie_id}
        response = ask_api("data/fetchfilter/serie", serie_filter)
        if response.status_code != 200:
            logging.warning("Erreur lors de la récupération de la serie")
            if ret:
                return ("Erreur lors de la récupération des series", "danger")
            return "Erreur lors de la récupération des series", "danger"
        serie = response.json()[0]
        if not serie:
            logging.warning(f"Erreur : No serie found at this id ({serie_id})")
            if ret:
                return ("Erreur lors de la récupération de la serie correspondantes", "danger")
            return "Erreur lors de la récupération de la serie correspondantes", "danger"

        matiere = {"id_matiere": "null", "id_serie": serie['id_serie'], "nom": name,
                   "temps_preparation": temps_preparation,
                   "temps_preparation_tiers_temps": temps_preparation_tiers_temps, "temps_passage": temps_passage,
                   "temps_passage_tiers_temps": temps_passage_tiers_temps, "loge": loge if loge else "null"}
        response = ask_api("data/insert/matiere", matiere)
        if response.status_code != 201:
            logging.warning("Erreur lors de l'insertion d'une matiere")
            if ret:
                return ("Erreur lors de l'insertion d'une matiere", "danger")
            return "Erreur lors de l'insertion d'une matiere", "danger"
        matiere["id_matiere"] = response.json()["id"]
        if not ret:
            return 'La matiere a bien été créée', 'success'
        else:
            return [['La matiere a bien été créée', 'success'], matiere]

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        if not ret:
            return [['Erreur : ' + traceback.format_exc(), 'danger']]
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_matiere(id):
    try:
        # creneaux
        creneau_filter = {"id_matiere": id}
        response = ask_api(f"data/deletefilter/creneau", creneau_filter)
        if response.status_code != 202:
            logging.warning(
                "Impossible de supprimer les creneaux liés à la matiere")
            return ['Impossible de supprimer les creneaux liés à la matiere', 'danger']
        # choix matieres
        choix_matiere_filter = {"filter": {"matiere1": id}, "data": {"matiere1": 'null'}}
        response = ask_api(
            f"data/updatefilter/choix_matiere", choix_matiere_filter)
        if response.status_code != 202:
            return ['Impossible de modifier le choix de matière du candidat', 'danger']
        choix_matiere_filter = {"filter": {"matiere2": id}, "data": {"matiere2": 'null'}}
        response = ask_api(
            f"data/updatefilter/choix_matiere", choix_matiere_filter)
        if response.status_code != 202:
            return ['Impossible de modifier le choix de matière du candidat', 'danger']
        professeur_filter = {"filter": {"matiere": id}, "data": {"matiere": 'null'}}
        response = ask_api(
            f"data/updatefilter/professeur", professeur_filter)
        if response.status_code != 202:
            logging.warning(
                "Impossible de modifier ce professeur")
            return ['Impossible de modifier ce professeur', 'danger']
        matiere_filter = {"id_matiere": id}
        response = ask_api(f"data/deletefilter/matiere", matiere_filter)
        if response.status_code != 202:
            logging.warning("Impossible de supprimer cette matiere")
            return ['Impossible de supprimer cette matiere', 'danger']

        return ['La matière a bien été supprimé', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_salle(numero, ret=False):
    try:
        salle = {"id_salle": "null", "numero": numero}
        response = ask_api("data/insert/salle", salle)
        if response.status_code != 201:
            # print(numero)
            logging.warning(
                "Erreur lors de l'insertion d'une salle", response.content)
            if ret:
                return (["Erreur lors de l'insertion d'une salle", "danger"], salle)
            return "Erreur lors de l'insertion d'une salle", "danger"
        salle["id_salle"] = response.json()["id"]
        if not ret:
            return ['La salle a bien été crée', 'success']
        else:
            return [['La salle a bien été crée', 'success'], salle]

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def update_salle(id, numero):
    try:
        salle = {"filter": {"id_salle": id}, "data": {
            "id_salle": id, "numero": numero}}
        response = ask_api("data/updatefilter/salle", salle)
        if response.status_code != 202:
            logging.warning("Erreur lors de l'insertion des salles")
            return "Erreur lors de l'insertion des salles", "danger"
        return ['Le salle a correctement été modifiée', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_salle(id):
    try:
        # update professeur
        professeur = {"filter": {"salle": id}, "data": {"salle": "null"}}
        response = ask_api(f"data/updatefilter/professeur", professeur)
        if response.status_code != 202:
            logging.warning(
                "Impossible de supprimer les professeurs associés à cette salle")
            return ['Impossible de supprimer les professeurs associés à cette salle', 'danger']

        # creneaux
        creneau_filter = {"id_salle": id}
        response = ask_api(f"data/deletefilter/creneau", creneau_filter)
        if response.status_code != 202:
            logging.warning(
                "Impossible de supprimer les creneaux liés à la salle")
            return ['Impossible de supprimer les creneaux liés à la salle', 'danger']
        # matiere
        matiere_filter = {"loge": id}
        response = ask_api(f"data/deletefilter/matiere", matiere_filter)
        if response.status_code != 202:
            logging.warning(
                "Impossible de supprimer les matieres liés à la salle")
            return ['Impossible de supprimer les matieres liés à la salle', 'danger']

        salle_filter = {"id_salle": id}
        response = ask_api(f"data/deletefilter/salle", salle_filter)
        if response.status_code != 202:
            logging.warning("Impossible de supprimer cette salle")
            return ['Impossible de supprimer cette salle', 'danger']

        return ['La série a bien été supprimé', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_professeur(nom, salle, matiere, ret=False):
    try:
        professeur = {"id_professeur": "null", "nom": nom,
                      "salle": salle if salle else "null",
                      "matiere": matiere if matiere else "null"}
        response = ask_api("data/insert/professeur", professeur)
        if response.status_code != 201:
            logging.warning("Erreur lors de l'insertion d'un professeur")
            if ret:
                return (["Erreur lors de l'insertion d'un professeur", "danger"], professeur)
            return "Erreur lors de l'insertion d'un professeur", "danger"
        professeur["id_professeur"] = response.json()["id"]

        if ret:
            return [['Le professeur a bien été créé', 'success'], professeur]
        return ['Le professeur a bien été créé', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def update_matiere(id, nom, id_serie, temps_preparation, temps_preparation_tiers_temps, temps_passage,
                   temps_passage_tiers_temps, loge):
    try:
        matiere = {"filter": {"id_matiere": id},
                   "data": {"id_matiere": id, "id_serie": id_serie, "nom": nom, "temps_preparation": temps_preparation,
                            "temps_preparation_tiers_temps": temps_preparation_tiers_temps,
                            "temps_passage": temps_passage, "temps_passage_tiers_temps": temps_passage_tiers_temps,
                            "loge": loge if loge else "null"}}
        response = ask_api("data/updatefilter/matiere", matiere)
        if response.status_code != 202:
            logging.warning("Erreur lors de l'insertion des matieres")
            return "Erreur lors de l'insertion des matieres", "danger"
        return ['La matière a bien été modifiée', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def update_professeur_wep(id, nom, salle, matiere):
    try:
        professeur = {"filter": {"id_professeur": id}, "data": {
            "nom": nom, "salle": salle if salle else "null",
            "matiere": matiere if matiere else "null"}}
        response = ask_api("data/updatefilter/professeur", professeur)
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de l'insertion des matieres du professeur")
            return "Erreur lors de l'insertion des matieres du professeur", "danger"

        return ['Le professeur a bien été modifié', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_professeur(id):
    try:
        # creneaux
        professeur_filter = {"id_professeur": id}
        response = ask_api("data/fetchfilter/professeur", professeur_filter)
        if response.status_code != 200:
            logging.warning("Erreur lors de la récupération du professeur")
            return "Erreur lors de la récupération du professeur", "danger"
        professeur = response.json()[0]

        creneaux = {"id_salle": professeur['salle']}
        response = ask_api("data/deletefilter/creneau", creneaux)
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des creneaux associé à ce professeur")
            return "Erreur lors de la suppression des creneaux associé à ce professeur", "danger"

        professeur = {"id_professeur": id}
        response = ask_api("data/deletefilter/professeur", professeur)
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression du professeur")
            return "Erreur lors de la suppression du professeur", "danger"

        return ['Le professeur a bien été supprimé', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_candidat(nom, id_serie, tiers_temps, jour, absent, matin, output=False):
    try:
        candidat = {"id_candidat": "null", "nom": nom, "id_serie": id_serie,
                    "tiers_temps": "true" if tiers_temps == "True" else "false",
                    "absent": "true" if absent == "True" else "false",
                    "matin": "true" if matin == "True" else "false", "jour": jour}
        response = ask_api("data/insert/candidat", candidat)
        if response.status_code != 201:
            logging.warning("Erreur lors de la creation du candidat")
            if output:
                return (candidat, "Erreur lors de la creation du candidat", "danger")
            return "Erreur lors de la creation du candidat", 'danger'
        candidat["id_candidat"] = response.json()["id"]
        if output:
            logging.warning('Le candidat a bien été crée')
            return [candidat, 'Le candidat a bien été crée', 'success']
        return ['Le candidat a bien été crée', 'success']

    except Exception:
        if output:
            logging.warning('Erreur : ' + traceback.format_exc())
            return [candidat, 'Erreur : ' + traceback.format_exc(), 'danger']
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_candidat_with_id(id, nom, id_serie, tiers_temps, jour, absent, matin):
    try:
        candidat = {"id_candidat": id, "nom": nom, "id_serie": id_serie,
                    "tiers_temps": "true" if tiers_temps == "True" else "false",
                    "absent": "true" if absent == "True" else "false",
                    "matin": "true" if matin == "True" else "false", "jour": jour}
        response = ask_api("data/insert/candidat", candidat)
        if response.status_code != 201:
            logging.warning("Erreur lors de la creation du candidat")
        else:
            logging.warning('Le candidat a bien été crée')
        return
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_candidat(id):
    try:
        # choix matiere
        choix_matiere = {"id_candidat": id}
        response = ask_api("data/deletefilter/choix_matiere", choix_matiere)
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des choix de matieres du candidat")
            return "Erreur lors de la suppression des choix de matieres du candidat", "danger"

        # creneaux
        creneau = {"id_candidat": id}
        response = ask_api("data/deletefilter/creneau", creneau)
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des creneaux du candidat")
            return "Erreur lors de la suppression des creneaux du candidat", "danger"

        candidat_filter = {"id_candidat": id}
        response = ask_api("data/deletefilter/candidat", candidat_filter)
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression du candidat")
            return "Erreur lors de la suppression du candidat", "danger"

        return False
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_all_candidats():
    try:
        # choix matiere
        response = ask_api("data/delete/choix_matiere", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des choix de matieres du candidat")
            return "Erreur lors de la suppression des choix de matieres du candidat", "danger"

        # creneaux
        response = ask_api("data/delete/creneau", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des creneaux du candidat")
            return "Erreur lors de la suppression des creneaux du candidat", "danger"

        # candidats
        response = ask_api("data/delete/candidat", {})
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression des candidats")
            return "Erreur lors de la suppression des candidats", "danger"
        return ['Tous les candidats ont correctement été supprimés !', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_all_professeurs():
    try:
        response = ask_api("data/delete/professeur", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des professeurs")
            return "Erreur lors de la suppression des professeurs", "danger"
        return ['Tous les professeurs ont correctement été supprimés !', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_all_salles():
    try:
        response = ask_api("data/fetchmulti", ["salle", "matiere", "professeur"])
        salles, matieres, professeurs = response.json()
        for matiere in matieres:
            if matiere["loge"]:
                filter = {"filter": {"id_matiere": matiere["id_matiere"]},
                          "data": {"id_matiere": matiere["id_matiere"],
                                   "id_serie": matiere["id_serie"],
                                   "nom": matiere["nom"],
                                   "temps_preparation": matiere["temps_preparation"],
                                   "temps_preparation_tiers_temps": matiere["temps_preparation_tiers_temps"],
                                   "temps_passage": matiere["temps_passage"],
                                   "temps_passage_tiers_temps": matiere["temps_passage_tiers_temps"],
                                   "loge": "null"
                                   }}
                ask_api("data/updatefilter/matiere", filter)

        for professeur in professeurs:
            if professeur["salle"]:
                filter = {"filter": {"id_professeur": professeur["id_professeur"]},
                          "data": {"id_professeur": professeur["id_professeur"],
                                   "nom": professeur["nom"],
                                   "salle": "null",
                                   "matiere": professeur["matiere"]
                                   }}
                ask_api("data/updatefilter/professeur", filter)

        response = ask_api("data/delete/creneau", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des creneaux")

        response = ask_api("data/delete/salle", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des salles")
            return "Erreur lors de la suppression des salles", "danger"
        return ['Toutes les salles ont correctement été supprimés !', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']

def delete_all_matieres():
    try:
        response = ask_api("data/fetchmulti", ["professeur"])
        professeurs = response.json()[0]

        for professeur in professeurs:
            if professeur["salle"]:
                filter = {"filter": {"id_professeur": professeur["id_professeur"]},
                          "data": {"id_professeur": professeur["id_professeur"],
                                   "nom": professeur["nom"],
                                   "salle": professeur["salle"],
                                   "matiere": "null"
                                   }}
                ask_api("data/updatefilter/professeur", filter)

        response = ask_api("data/delete/creneau", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des creneaux")

        response = ask_api("data/delete/choix_matiere", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des choix_matiere")

        response = ask_api("data/delete/matiere", {})
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression des matiere")
            return "Erreur lors de la suppression des matiere", "danger"

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']

def add_choix_matiere(id_candidat, matiere1, matiere2):
    try:
        choix_matiere = {"id_choix_matiere": "null", "id_candidat": id_candidat,
                         "matiere1": matiere1, "matiere2": matiere2}
        response = ask_api("data/insert/choix_matiere", choix_matiere)
        if response.status_code != 201:
            logging.warning("Erreur lors de la creation du choix des matières du candidat")
            return "Erreur lors de la creation du choix des matières du candidat", 'danger'
        return "Les choix de matières du candidat ont été créé", "success"

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_choix_matiere(id):
    try:
        choix_matiere = {"id_choix_matiere": id}
        response = ask_api("data/deletefilter/choix_matiere", choix_matiere)
        if response.status_code != 202:
            logging.warning(
                "Erreur lors de la suppression du choix de matieres")
            return "Erreur lors de la suppression du choix de matieres", "danger"

        return ['Les choix du candidat ont bien été supprimés', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def add_creneau(id_candidat, id_matiere, id_salle, debut_preparation, fin_preparation, fin, auto_commit=True,
                ret=False):
    try:
        if type(debut_preparation) == str:
            debut_preparation = json.loads(json.dumps(datetime.strptime(
                debut_preparation, '%a %b %d %Y %H:%M:%S'), default=myconverter))

            fin_preparation = json.loads(json.dumps(datetime.strptime(
                fin_preparation, '%a %b %d %Y %H:%M:%S'), default=myconverter))

            fin = json.loads(json.dumps(datetime.strptime(
                fin, '%a %b %d %Y %H:%M:%S'), default=myconverter))
        else:
            debut_preparation = json.loads(json.dumps(
                debut_preparation, default=myconverter))

            fin_preparation = json.loads(json.dumps(
                fin_preparation, default=myconverter))

            fin = json.loads(json.dumps(fin, default=myconverter))
        logging.warning("new Créneau : " + str(id_candidat) +
                        " | " + str(id_matiere) + " | " + str(id_salle))

        creneau = {"id_creneau": "null", "id_candidat": id_candidat, "id_matiere": id_matiere, "id_salle": id_salle,
                   "debut_preparation": debut_preparation, "fin_preparation": fin_preparation, "fin": fin}
        response = ask_api("data/insert/creneau", creneau)
        if response.status_code != 201:
            logging.warning("Erreur lors de la creation du créneau")
            if ret:
                return [creneau, ['Erreur lors de la creation du créneau', 'danger']]
            return "Erreur lors de la creation du créneau", 'danger'

        if ret:
            return [creneau, ['Le créneau a correctement été crée', 'success'], ]
        return ['Le créneau a correctement été crée', 'success']

    except Exception:
        logging.warning(traceback.format_exc())
        logging.warning('Erreur : ' + traceback.format_exc())
        traceback.print_exc()
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_creneau(id):
    try:
        creneau = {"id_creneau": id}
        response = ask_api("data/deletefilter/creneau", creneau)
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression du creneau")
            return "Erreur lors de la suppression du creneau", "danger"

        return False
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_creneau_by_candidat(id_candidat):
    try:
        creneau = {"id_candidat": id_candidat}
        response = ask_api("data/deletefilter/creneau", creneau)
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression du creneau")
            return "Erreur lors de la suppression du creneau", "danger"

        return ['Les créneaux du candidat ont bien été supprimés', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def delete_all_creneaux():
    try:
        response = ask_api("data/delete/creneau", {})
        if response.status_code != 202:
            logging.warning("Erreur lors de la supperssion des creneaux")
            return "Erreur lors de la supperssion des creneaux", "danger"
        return ['Tous les créneaux ont correctement été supprimés !', 'success']

    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def change_parametres(jour, debut_matin, fin_matin, debut_apresmidi, loge_apresmidi, fin_apresmidi, intervalle, pause,
                      passage, date_debut):
    try:
        response = ask_api("data/delete/parametres", [])
        if response.status_code != 202:
            logging.warning("Erreur lors de la suppression des paramtres")
            return "Erreur lors de la suppression des listes matieres", "danger"

        debut_matin = json.loads(json.dumps(debut_matin, default=myconverter))
        fin_matin = json.loads(json.dumps(fin_matin, default=myconverter))
        debut_apresmidi = json.loads(json.dumps(debut_apresmidi, default=myconverter))
        loge_apresmidi = json.loads(json.dumps(loge_apresmidi, default=myconverter))
        fin_apresmidi = json.loads(json.dumps(fin_apresmidi, default=myconverter))
        parametres = {"max_jour": jour, "heure_debut_matin": debut_matin, "heure_fin_matin": fin_matin,
                      "heure_debut_apres_midi": debut_apresmidi, "heure_loge_apres_midi": loge_apresmidi,
                      "heure_fin_apres_midi": fin_apresmidi, "intervalle": intervalle,
                      "temps_pause_eleve": pause, "prof_max_passage_sans_pause": passage,
                      "date_premier_jour": date_debut}

        response = ask_api("data/insert/parametres", parametres)
        if response.status_code != 201:
            logging.warning("Erreur lors de la creation des parametres")
            return "Erreur lors de la creation des parametres", 'danger'
        return ['Les paramètres ont bien été modifiés', 'success']
    except Exception:
        logging.warning('Erreur : ' + traceback.format_exc())
        return ['Erreur : ' + traceback.format_exc(), 'danger']


def to_dict(row):
    if row is None:
        return None

    rtn_dict = dict()
    print(row)
    keys = row.__table__.columns.keys()
    for key in keys:
        rtn_dict[key] = getattr(row, key)
    return rtn_dict


def myconverter(o):
    if isinstance(o, datetime):
        return o.strftime("%a %b %d %H:%M:%S %Y")
