from datetime import timedelta
from flask.helpers import flash
from copy import deepcopy

from . import main_database
from ..database.main_database import *


def generation_calendrier():
    (all_candidats, all_professeurs, all_liste_matiere, all_choix_matieres, all_matieres, all_salles, all_creneau,
     parametres) = get_data()
    parametres = parametres[0]

    list_candidats = order_candidats_list(all_candidats)
    local_creneau = []

    # Create the creneau for each candidate
    for list_candidat_day in list_candidats:
        for list_candidat_half_day in list_candidat_day:
            logging.info(list_candidat_half_day)
            for candidat in list_candidat_half_day:
                start, end = get_horaires(candidat, parametres)
                passage_m1, passage_m2 = get_infos_about_candidat(candidat, all_choix_matieres, all_matieres,
                                                                  all_professeurs, all_liste_matiere, all_salles)
                passages = [passage_m1, passage_m2]
                creneaux_candidat = []
                break_time = None

                for _ in range(3):

                    for passage in passages:
                        creneaux_from_half_day = get_all_creneau_from_half_day(local_creneau, candidat["jour"], start,
                                                                               end)
                        heure_debut_preparation_voulue = start
                        while (heure_debut_preparation_voulue + passage["temps_preparation"] + passage["temps_passage"]
                               <= end):
                            aucune_collision = True
                            chosed_salle = None
                            for creneau in creneaux_from_half_day:

                                if not is_candidat_available(passage, candidat, creneau,
                                                             heure_debut_preparation_voulue, parametres):
                                    aucune_collision = False
                                    break

                                chosed_salle = None
                                for salle in passage["salle"]:
                                    if is_salle_available(passage, salle, creneau, heure_debut_preparation_voulue):
                                        chosed_salle = salle
                                        break

                                if not chosed_salle:
                                    aucune_collision = False
                                    break

                            if chosed_salle:
                                if is_prof_owerhelmed(passage, chosed_salle, creneaux_from_half_day,
                                                      heure_debut_preparation_voulue + passage["temps_preparation"],
                                                      parametres["prof_max_passage_sans_pause"]):
                                    aucune_collision = False

                            if len(creneaux_from_half_day) == 0:
                                chosed_salle = passage["salle"][0]

                            if aucune_collision and not candidat["absent"]:
                                local_creneau, creneau_created = create_creneau_in_local(candidat["jour"],
                                                                                         heure_debut_preparation_voulue,
                                                                                         candidat, passage,
                                                                                         local_creneau, chosed_salle)
                                creneaux_candidat.append(creneau_created)
                                break

                            heure_debut_preparation_voulue += timedelta(minutes=parametres["intervalle"])

                    if len(creneaux_candidat) == 2:

                        if (creneaux_candidat[1]["debut_preparation"] - creneaux_candidat[0]["fin"]
                                == timedelta(minutes=parametres["temps_pause_eleve"])):
                            break
                        if not break_time:
                            break_time = creneaux_candidat[1]["debut_preparation"] - creneaux_candidat[0]["fin"]
                            swap_passage(passages)
                            local_creneau = delete_creneaux(candidat["id_candidat"], local_creneau)
                            creneaux_candidat.clear()

                        else:
                            if (creneaux_candidat[1]["debut_preparation"] - creneaux_candidat[0]["fin"]
                                    < break_time):
                                break
                            else:
                                break_time = creneaux_candidat[1]["debut_preparation"] - creneaux_candidat[0]["fin"]
                                swap_passage(passages)
                                local_creneau = delete_creneaux(candidat["id_candidat"], local_creneau)
                                creneaux_candidat.clear()

                    else:
                        local_creneau = delete_creneaux(candidat["id_candidat"], local_creneau)
                        creneaux_candidat.clear()

                if len(creneaux_candidat) == 2:
                    for creneau in creneaux_candidat:
                        create_creneau(creneau)

    result = test_calendar_complete()
    flash(result[0], result[1])


def get_data():
    logging.info('main_calendrier')

    response = ask_api("data/delete/creneau", {})
    if response.status_code != 202:
        flash("Une erreur est survenue lors de la suppression des données", "danger")

    response = ask_api("data/fetchmulti", ["candidat", "professeur", "liste_matiere", "choix_matiere",
                                           "matiere", "salle", "creneau", "parametres"])
    if response.status_code != 200:
        flash("Une erreur est survenue lors de la récupération des données", "danger")
    return response.json()


def order_candidats_list(all_candidats):
    list_candidats = []
    for candidat in all_candidats:
        list_candidats.append(candidat)

    list_candidats_per_day = []
    for candidat in list_candidats:
        if candidat["jour"] > len(list_candidats_per_day):
            for _ in range(candidat["jour"] - len(list_candidats_per_day)):
                list_candidats_per_day.append([])
        list_candidats_per_day[candidat["jour"] - 1].append(candidat)

    list_candidats_per_half_day = []
    for list_candidats_a_day in list_candidats_per_day:
        # Order by morning/afternoon
        list_candidats_morning = []
        list_candidats_afternoon = []
        for candidat in list_candidats_a_day:
            if candidat["matin"]:
                list_candidats_morning.append(candidat)
            else:
                list_candidats_afternoon.append(candidat)

        list_candidats = [list_candidats_morning, list_candidats_afternoon]

        list_candidats_morning_ordered = []
        list_candidats_afternoon_ordered = []
        for list_candidats_i in list_candidats:
            for candidat in list_candidats_i:
                if not candidat["tiers_temps"]:
                    if candidat["matin"]:
                        list_candidats_morning_ordered.append(candidat)
                    else:
                        list_candidats_afternoon_ordered.append(candidat)
                else:
                    if candidat["matin"]:
                        list_candidats_morning_ordered.insert(0, candidat)
                    else:
                        list_candidats_afternoon_ordered.insert(0, candidat)
        list_candidats_per_half_day.append([list_candidats_morning_ordered, list_candidats_afternoon_ordered])

    return list_candidats_per_half_day


def get_horaires(candidat, parametres):
    if candidat["matin"]:
        t = datetime.strptime(parametres["heure_debut_matin"], "%H:%M:%S")
        start = timedelta(hours=t.hour, minutes=t.minute)
        t = datetime.strptime(parametres["heure_fin_matin"], "%H:%M:%S")
        end = timedelta(hours=t.hour, minutes=t.minute)
    else:
        t = datetime.strptime(parametres["heure_debut_apres_midi"], "%H:%M:%S")
        start = timedelta(hours=t.hour, minutes=t.minute)
        t = datetime.strptime(parametres["heure_fin_apres_midi"], "%H:%M:%S")
        end = timedelta(hours=t.hour, minutes=t.minute)
    return start, end


def get_infos_about_candidat(candidat, all_choix_matieres, all_matieres, all_professeurs, all_liste_matiere,
                             all_salles):
    # Find the choix matiere correspondant
    choix_matiere = None
    for a_choix_matiere in all_choix_matieres:
        if a_choix_matiere["id_candidat"] == candidat["id_candidat"]:
            choix_matiere = a_choix_matiere

            # Get both matiere
    matiere1, matiere2 = None, None
    for matiere in all_matieres:
        if matiere["id_matiere"] == choix_matiere["matiere1"]:
            matiere1 = matiere
        if matiere["id_matiere"] == choix_matiere["matiere2"]:
            matiere2 = matiere

    # Get prof for each matiere
    professeur_m1, professeur_m2 = [], []
    for professeur in all_professeurs:
        for liste_matiere in all_liste_matiere:
            if liste_matiere["id_professeur"] == professeur["id_professeur"]:
                if matiere1 is not None:
                    if liste_matiere["id_matiere"] == matiere1["id_matiere"]:
                        professeur_m1.append(professeur)
                if matiere2 is not None:
                    if liste_matiere["id_matiere"] == matiere2["id_matiere"]:
                        professeur_m2.append(professeur)

    # salle for each matiere
    salle_m1, salle_m2 = [], []
    salle_m1_n = []
    for a_prof in professeur_m1:
        salle_m1_n.append(a_prof["salle"])
    salle_m2_n = []
    for a_prof in professeur_m2:
        salle_m2_n.append(a_prof["salle"])

    for salle in all_salles:
        if salle["id_salle"] in salle_m1_n:
            salle_m1.append(salle)
        if salle["id_salle"] in salle_m2_n:
            salle_m2.append(salle)

    temps_passage_m1 = timedelta(
        minutes=matiere1["temps_passage"] if not candidat["tiers_temps"] else matiere1["temps_passage_tiers_temps"])
    temps_preparation_m1 = timedelta(
        minutes=matiere1["temps_preparation"] if not candidat["tiers_temps"] else matiere1[
            "temps_preparation_tiers_temps"])

    temps_passage_m2 = timedelta(
        minutes=matiere2["temps_passage"] if not candidat["tiers_temps"] else matiere2["temps_passage_tiers_temps"])
    temps_preparation_m2 = timedelta(
        minutes=matiere2["temps_preparation"] if not candidat["tiers_temps"] else matiere2[
            "temps_preparation_tiers_temps"])

    return {"salle": salle_m1, "matiere": matiere1, "professeur": professeur_m1, "temps_passage": temps_passage_m1,
            "temps_preparation": temps_preparation_m1}, \
        {"salle": salle_m2, "matiere": matiere2, "professeur": professeur_m2, "temps_passage": temps_passage_m2,
         "temps_preparation": temps_preparation_m2}


def get_all_creneau_from_half_day(local_creneau, jour_passage, start, end):
    for creneau in local_creneau:
        creneau["debut_preparation"] = datetime.strptime(creneau["debut_preparation"], '%a %b %d %H:%M:%S %Y') if type(
            creneau["debut_preparation"]) == str else creneau["debut_preparation"]
        creneau["fin_preparation"] = datetime.strptime(creneau["fin_preparation"], '%a %b %d %H:%M:%S %Y') if type(
            creneau["fin_preparation"]) == str else creneau["fin_preparation"]
        creneau["fin"] = datetime.strptime(creneau["fin"], '%a %b %d %H:%M:%S %Y') if type(
            creneau["fin"]) == str else creneau["fin"]

    all_creneaux = local_creneau
    creneaux_from_half_day = []

    for creneau in all_creneaux:
        if creneau["debut_preparation"].day == jour_passage:
            if timedelta(hours=creneau["debut_preparation"].hour) >= start and timedelta(
                    hours=creneau["fin"].hour) <= end:
                creneaux_from_half_day.append(creneau)

    return creneaux_from_half_day


def is_salle_available(passage, salle, creneau, heure_debut_preparation_voulue):
    if creneau["id_salle"] == salle["id_salle"] \
            and not ((heure_debut_preparation_voulue + passage["temps_preparation"]
                      >= timedelta(hours=creneau["fin"].hour, minutes=creneau["fin"].minute))
                     or (heure_debut_preparation_voulue + passage["temps_preparation"] + passage["temps_passage"]
                         <= timedelta(hours=creneau["fin_preparation"].hour,
                                      minutes=creneau["fin_preparation"].minute))):
        return False
    return True


def is_candidat_available(passage, candidat, creneau, heure_debut_preparation_voulue, parametres):
    if creneau["id_candidat"] == candidat["id_candidat"] \
            and not ((heure_debut_preparation_voulue
                      >= timedelta(hours=creneau["fin"].hour, minutes=creneau["fin"].minute) + timedelta(minutes=parametres["temps_pause_eleve"]))
                     or (heure_debut_preparation_voulue + passage["temps_preparation"] +
                         passage["temps_passage"] + timedelta(minutes=parametres["temps_pause_eleve"])
                         <= timedelta(hours=creneau["debut_preparation"].hour,
                                      minutes=creneau["debut_preparation"].minute))):
        return False

    return True


def is_prof_owerhelmed(passage, salle, all_creneaux, heure_debut_passage_voulue, max_passage_sans_pause):
    prof_in_salle = []

    for prof in passage["professeur"]:
        if prof["salle"] == salle["id_salle"]:
            prof_in_salle.append(prof)

    creneau_all_prof = []

    for prof in prof_in_salle:
        creneau_from_a_prof = []
        for creneau in all_creneaux:
            if prof["salle"] == creneau["id_salle"]:
                creneau_from_a_prof.append(creneau)
        creneau_all_prof.append(creneau_from_a_prof)

    for creneau_prof in creneau_all_prof:
        if len(creneau_prof) < max_passage_sans_pause:
            continue

        passage_sans_pause = 0
        debut_passage = heure_debut_passage_voulue
        for i in range(max_passage_sans_pause):
            for creneau in creneau_prof:
                if debut_passage == timedelta(hours=creneau["fin"].hour, minutes=creneau["fin"].minute):
                    passage_sans_pause += 1
                    debut_passage = timedelta(hours=creneau["fin_preparation"].hour,
                                              minutes=creneau["fin_preparation"].minute)
                    break

            if passage_sans_pause == i:
                break

        if passage_sans_pause == max_passage_sans_pause:
            return True

    return False


def create_creneau_in_local(jour_passage, heure_debut_preparation_voulue, candidat, passage, local_creneau, salle):
    heure_debut_preparation_voulue_datetime = datetime.strptime(
        f'{jour_passage}/{datetime.now().month}/{datetime.now().year} ' + str(heure_debut_preparation_voulue),
        '%d/%m/%Y %H:%M:%f')
    fin_preparation_matiere_datetime = datetime.strptime(
        f'{jour_passage}/{datetime.now().month}/{datetime.now().year} ' + str((
                heure_debut_preparation_voulue + passage["temps_preparation"])), '%d/%m/%Y %H:%M:%f')
    fin_passage_matiere_datetime = datetime.strptime(
        f'{jour_passage}/{datetime.now().month}/{datetime.now().year} ' + str((
                heure_debut_preparation_voulue + passage["temps_preparation"] + passage["temps_passage"])),
        '%d/%m/%Y %H:%M:%f')

    creneau = {"id_creneau": "null", "id_candidat": candidat["id_candidat"],
               "id_matiere": passage["matiere"]["id_matiere"], "id_salle": salle["id_salle"],
               "debut_preparation": heure_debut_preparation_voulue_datetime,
               "fin_preparation": fin_preparation_matiere_datetime, "fin": fin_passage_matiere_datetime}

    local_creneau.append(creneau)

    return local_creneau, creneau


def create_creneau(creneau):
    res = main_database.add_creneau(creneau["id_candidat"], creneau["id_matiere"], creneau["id_salle"],
                                    creneau["debut_preparation"], creneau["fin_preparation"], creneau["fin"],
                                    auto_commit=False, ret=True)
    if res[1][1] == 'danger':
        logging.warning(res[1][0])
    return


def delete_creneaux(id_candidat, local_creneau):
    new_local_creneau = []
    for i in range(len(local_creneau)):
        if local_creneau[i]["id_candidat"] != id_candidat:
            new_local_creneau.append(local_creneau[i])

    return new_local_creneau


def swap_passage(passage):
    passage_temp = passage[0]
    passage[0] = passage[1]
    passage[1] = passage_temp

    return passage


def test_calendar_complete():
    response = ask_api("data/fetchmulti",
                       ["creneau", "candidat", "choix_matiere"])
    if response.status_code != 200:
        flash("Une erreur est survenue lors de la récupération des données", "danger")
    all_creneaux, all_candidats, all_choix_matiere = response.json()

    all_choix_matiere_left = deepcopy(all_choix_matiere)

    matiere_left = 0
    for _ in all_choix_matiere:
        if _["matiere1"]:
            matiere_left += 1
        if _["matiere2"]:
            matiere_left += 1

    i = 0
    for choix_matiere in all_choix_matiere:
        candidat = None
        for a_candidat in all_candidats:
            if a_candidat["id_candidat"] == choix_matiere["id_candidat"]:
                candidat = a_candidat
        matiere1, matiere2 = False, False
        for creneau in all_creneaux:
            if creneau["id_candidat"] == choix_matiere["id_candidat"]:
                if creneau["id_matiere"] == choix_matiere["matiere1"]:
                    matiere1 = True
                    matiere_left -= 1
                elif creneau["id_matiere"] == choix_matiere["matiere2"]:
                    matiere2 = True
                    matiere_left -= 1
        if candidat["absent"]:
            if not matiere1:
                matiere_left -= 1
            else:
                matiere1 = True
            if not matiere2:
                matiere_left -= 1
            else:
                matiere2 = True
        if matiere1 and matiere2:
            all_choix_matiere_left.pop(i)
            i -= 1
        i += 1

    if matiere_left > 0:
        logging.warning("Le calendrier n'est pas complet")
        text_creneau = 'créneau' if matiere_left <= 1 else 'créneaux'
        return [f'Le calendrier n\'est pas complet, il manque {matiere_left} ' + text_creneau, 'danger']
    else:
        logging.warning("Le calendrier est complet !")
        return ['Calendrier généré avec succès', 'success']


if (os.getenv("NETWORK_VISU") == "true"):
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-calendar",
        "data": {
            "name": "Génération du calendrier",
            "id": "website-calendar",
            "size": 46,
            "fsize": 30
        },
        "position": {
            "x": 315,
            "y": 632
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website:website-calendar",
        "data": {
            "id": "website:website-calendar",
            "weight": 1,
            "source": "website",
            "target": "website-calendar"
        }
    })
