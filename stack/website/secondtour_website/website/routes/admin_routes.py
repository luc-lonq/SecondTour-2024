import logging
from time import strptime
from flask import Blueprint, render_template, session, request, redirect, url_for, send_file
from flask.helpers import flash
from zipfile import ZipFile
import os
import pandas as pd
from ..function import main_security, main_sessions, main_database, main_calendrier
from ..database.main_database import *
from ..main_website import app

admin_routes = Blueprint('admin_routes', __name__,
                         template_folder='templates',
                         static_folder='static')

UPLOAD_FOLDER = '/app/website/secondtour_website/website/static'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@admin_routes.route('/', methods=['POST', 'GET'])
@admin_routes.route('/accueil', methods=['POST', 'GET'])
def accueil():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-accueil",
            "data": {
                "target": "website-admin:website-admin-accueil"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('generate_button') is not None:
                main_calendrier.generation_calendrier()
        else:
            result = main_calendrier.test_calendar_complete()
            if result:
                flash(result[0], result[1]) if result[1] == "danger" else flash(
                    "Le calendrier est complet !", result[1])
                logging.warning(result[0] if result[1] ==
                                             "danger" else "Le calendrier est complet")
        response = ask_api(
            "data/fetchmulti", ["candidat", "creneau", "serie", "matiere", "professeur", "salle", "parametres"])
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_creneaux, all_series, all_matieres, all_professeurs, all_salles, parametres = response.json()
        all_candidats.sort(key=lambda candidat: candidat['nom'])
        all_creneaux.sort(key=lambda creneau: datetime.strptime(creneau['debut_preparation'], '%a %b %d %H:%M:%S %Y'))
        for creneau in all_creneaux:
            creneau["debut_preparation"] = datetime.strptime(creneau["debut_preparation"],
                                                             '%a %b %d %H:%M:%S %Y') if type(
                creneau["debut_preparation"]) == str else creneau["debut_preparation"]
            creneau["fin_preparation"] = datetime.strptime(creneau["fin_preparation"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin_preparation"]) == str else creneau["fin_preparation"]
            creneau["fin"] = datetime.strptime(creneau["fin"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin"]) == str else creneau["fin"]

        # all_candidats = CANDIDAT.query.order_by(CANDIDAT.nom).all()
        # all_creneaux = CRENEAU.query.order_by(CRENEAU.debut_preparation).all()
        # all_series = SERIE.query.all()
        # all_matieres = MATIERE.query.all()
        # # Serialize table
        # professeurs = PROFESSEUR.query.all()
        # all_professeurs = []
        # for professeur in professeurs:
        #     all_professeurs.append(professeur.as_dict())
        # # Serialize table
        # salles = SALLE.query.all()
        # all_salles = []
        # for salle in salles:
        #     all_salles.append(salle.as_dict())
        return render_template('admin/accueil.html', all_professeurs=all_professeurs,
                               all_candidats=all_candidats, all_creneaux=all_creneaux, all_series=all_series,
                               all_matieres=all_matieres, all_salles=all_salles, jour=parametres[0]["max_jour"],
                               date=datetime.strptime(parametres[0]["date_premier_jour"], '%a %b %d %H:%M:%S %Y'))
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/candidats', methods=['POST', 'GET'])
def candidats():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-candidats",
            "data": {
                "target": "website-admin:website-admin-candidats"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('submit_button') is not None:
                if 'name' in form and 'serie' in form and 'tiers_temps' in form and 'jour' in form and 'matin' in form and 'absent' in form:
                    result = main_database.add_candidat(
                        form['name'], form['serie'], form['tiers_temps'], form['jour'], form['absent'],
                        form['matin'], output=True)
                    if result[2] == 'danger':
                        flash(result[1], result[2])
                        logging.warning(result[0])
                    if result[2] == 'success':
                        flash(result[1], result[2])
                        logging.warning(result[0])
                        if 'matiere1' in form and 'matiere2' in form:
                            if form['matiere1'] or form['matiere2']:
                                second_result = main_database.add_choix_matiere(
                                    result[0]["id_candidat"], form['matiere1'], form['matiere2'])
                                if second_result and second_result[1] == 'danger':
                                    flash(second_result[0], second_result[1])
                                    logging.warning(second_result[0])
                            else:
                                flash(result[1][0], result[1][1])
                                logging.warning(result[1][0])
                        else:
                            flash(result[1][0], result[1][1])
                            logging.warning(result[1][0])

            elif form.get('delete_button') is not None:
                if 'id' in form:
                    if not (r := main_database.delete_candidat(form['id'])):
                        flash('Le candidat a bien été supprimé', 'success')
                    else:
                        flash(r[0], r[1])
                        logging.warning(r[0])
            elif form.get('modif_button') is not None:
                if 'name' in form and 'serie' in form and 'id' in form and 'tiers_temps' in form and 'jour' in form and 'matin' in form and 'absent' in form:
                    if r := main_database.delete_candidat(form['id']):
                        flash(r[0], r[1])
                        logging.warning(r[0])
                    else:
                        result = main_database.add_candidat(
                            form['name'], form['serie'], form['tiers_temps'], form['jour'],
                            form['absent'], form['matin'], output=True)
                        if result[2] == 'danger':
                            flash(result[1], result[2])
                            logging.warning(result[0])
                        else:
                            if 'matiere1' in form and 'matiere2' in form:
                                if form['matiere1'] or form['matiere2']:
                                    second_result = main_database.add_choix_matiere(
                                        result[0]["id_candidat"], form['matiere1'], form['matiere2'])
                                    if second_result[1] != 'danger':
                                        flash(
                                            "Modification correctement effecutée", second_result[1])
                                        logging.warning(
                                            "Modification effectuée")
                                    else:
                                        flash(
                                            second_result[0], second_result[1])
                                        logging.warning(second_result[0])
                                else:
                                    flash(result[1][0], result[1][1])
                                    logging.warning(result[1][0])
                            else:
                                if result[1][1] != "danger":
                                    flash(
                                        "Modification correctement effecutée", result[1][1])
                                    logging.warning("Modification effectuée")
                                else:
                                    flash(result[1][0], result[1][1])
                                    logging.warning(result[1][0])
            elif form.get('delete_all_button') is not None:
                result = main_database.delete_all_candidats()
                flash(result[0], result[1])

            elif request.files:
                uploaded_file = request.files['file']
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
                uploaded_file.save(file_path)

                response = ask_api("data/fetchmulti", ["serie", "matiere", "parametres"])
                all_series, all_matieres, all_parametres = response.json()
                col_names = ['nom', 'serie', 'matiere1', 'matiere2', 'tiers_temps', 'jour', 'matin']
                data = pd.read_csv(file_path, names=col_names, header=None)
                all_candidats = []
                all_choix_matieres = []
                err = False
                # Loop through the Rows
                for i, row in data.iterrows():
                    if i == 0:
                        continue
                    id_serie = None
                    id_matiere1 = None
                    id_matiere2 = None

                    for serie in all_series:
                        if row["serie"] == serie["nom"]:
                            id_serie = serie["id_serie"]
                            break
                    if id_serie is None:
                        flash("Ligne " + str(i + 1) + ": Erreur sur la série", "danger")
                        err = True
                    for matiere in all_matieres:
                        if matiere["id_serie"] == id_serie or id_serie is None:
                            if row["matiere1"] == matiere["nom"]:
                                id_matiere1 = matiere["id_matiere"]
                            if row["matiere2"] == matiere["nom"]:
                                id_matiere2 = matiere["id_matiere"]
                    if id_matiere1 is None:
                        flash("Ligne " + str(i + 1) + ": Erreur sur la matière 1", "danger")
                        err = True
                    if id_matiere2 is None:
                        flash("Ligne " + str(i + 1) + ": Erreur sur la matière 2", "danger")
                        err = True
                    try:
                        if int(row["tiers_temps"]) != 0 and int(row["tiers_temps"]) != 1:
                            flash("Ligne " + str(i + 1) + ": Erreur sur le tiers temps", "danger")
                            err = True
                    except Exception:
                        flash("Ligne " + str(i + 1) + ": Erreur sur le tiers temps", "danger")
                        err = True
                    try:
                        if int(row["matin"]) != 0 and int(row["matin"]) != 1:
                            flash("Ligne " + str(i + 1) + ": Erreur sur le matin", "danger")
                            err = True
                    except Exception:
                        flash("Ligne " + str(i + 1) + ": Erreur sur le matin", "danger")
                        err = True
                    try:
                        if int(row["jour"]) > int(all_parametres[0]["max_jour"]):
                            flash("Ligne " + str(i + 1) + ": Erreur sur le jour", "danger")
                            err = True
                    except Exception:
                        flash("Ligne " + str(i + 1) + ": Erreur sur le jour", "danger")
                        err = True

                    if err is False:
                        all_candidats.append({"id_candidat": i, "nom": row["nom"],
                                              "id_serie": id_serie,
                                              "tiers_temps": "True" if int(row["tiers_temps"]) == 1 else "False",
                                              "absent": 0,
                                              "matin": "True" if int(row["matin"]) == 1 else "False",
                                              "jour": int(row["jour"])})
                        logging.info(all_candidats)
                        all_choix_matieres.append({"id_candidat": i, "matiere1": id_matiere1,
                                                   "matiere2": id_matiere2})
                        logging.info(all_choix_matieres)

                if err is False:
                    main_database.delete_all_candidats()
                    for candidat in all_candidats:
                        main_database.add_candidat_with_id(candidat["id_candidat"], candidat["nom"],
                                                           candidat["id_serie"], candidat["tiers_temps"],
                                                           candidat["jour"], candidat["absent"], candidat["matin"])
                    for choix_matiere in all_choix_matieres:
                        main_database.add_choix_matiere(choix_matiere["id_candidat"], choix_matiere["matiere1"],
                                                        choix_matiere["matiere2"])
                    flash("Les candidats ont été ajouté", "success")




        response = ask_api(
            "data/fetchmulti",
            ["candidat", "choix_matiere", "serie", "matiere", "professeur", "salle", "creneau", "parametres"])
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_choix_matieres, all_series, all_matieres, all_professeurs, all_salles, all_creneaux, parametres = response.json()
        all_candidats.sort(key=lambda candidat: candidat['nom'])
        all_creneaux.sort(key=lambda creneau: creneau['debut_preparation'])

        for creneau in all_creneaux:
            creneau["debut_preparation"] = datetime.strptime(creneau["debut_preparation"],
                                                             '%a %b %d %H:%M:%S %Y') if type(
                creneau["debut_preparation"]) == str else creneau["debut_preparation"]
            creneau["fin_preparation"] = datetime.strptime(creneau["fin_preparation"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin_preparation"]) == str else creneau["fin_preparation"]
            creneau["fin"] = datetime.strptime(creneau["fin"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin"]) == str else creneau["fin"]

        jour = []
        for i in range(parametres[0]["max_jour"]):
            jour.append(i + 1)

        # candidats = CANDIDATS.query.order_by(CANDIDATS.nom).all()
        # all_candidats = []
        # for a_candidat in candidats:
        #     all_candidats.append(a_candidat.as_dict())
        # # Serialize TABLE
        # choix_matieres = CHOIX_MATIERE.query.all()
        # all_choix_matieres = []
        # for a_choix_matiere in choix_matieres:
        #     all_choix_matieres.append(a_choix_matiere.as_dict())
        # # Serialize TABLE
        # all_series = []
        # series = SERIE.query.all()
        # for a_serie in series:
        #     all_series.append(a_serie.as_dict())
        # # Serialize TABLE
        # matieres = MATIERES.query.all()
        # all_matieres = []
        # for a_matiere in matieres:
        #     all_matieres.append(a_matiere.as_dict())

        # all_professeurs = PROFESSEUR.query.all()
        # all_salles = SALLE.query.all()
        # all_creneaux = CRENEAU.query.order_by(CRENEAU.debut_preparation).all()
        return render_template('admin/candidats.html', all_candidats=all_candidats,
                               all_choix_matieres=all_choix_matieres, all_series=all_series, all_matieres=all_matieres,
                               all_professeurs=all_professeurs, all_salles=all_salles, all_creneaux=all_creneaux,
                               max_jour=jour)
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/salles', methods=['POST', 'GET'])
def salles():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-salles",
            "data": {
                "target": "website-admin:website-admin-salles"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('submit_button') is not None:
                if 'numero' in form:
                    result = main_database.add_salle(form['numero'])
                    flash(result[0], result[1])
                    logging.warning(result[0])
            elif form.get('modify_button') is not None:
                if 'id' in form and 'numero' in form:
                    if r := main_database.update_salle(form['id'], form['numero']):
                        flash(r[0], r[1])
                        logging.warning(r[0])
            elif form.get('delete_button') is not None:
                if 'id' in form:
                    if r := main_database.delete_salle(form['id']):
                        flash(r[0], r[1])
                        logging.warning(r[0])

            elif request.files:
                main_database.delete_all_salles()
                uploaded_file = request.files['file']
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
                uploaded_file.save(file_path)

                col_names = ['salle']
                data = pd.read_csv(file_path, names=col_names, header=None)
                err = False
                # Loop through the Rows
                for i, row in data.iterrows():
                    if i == 0:
                        continue
                    result = main_database.add_salle(row['salle'])
                    if result[1] == 'danger':
                        err = True

                if err:
                    main_database.delete_all_salles()
                else:
                    flash("Les salles ont été ajouté", "success")

        response = ask_api("data/fetchmulti", ["candidat", "choix_matiere",
                                               "serie", "matiere", "professeur", "salle", "creneau", "parametres"])
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_choix_matieres, all_series, all_matieres, all_professeurs, all_salles, all_creneaux, parametres = response.json()
        all_creneaux.sort(key=lambda creneau: datetime.strptime(creneau['debut_preparation'], '%a %b %d %H:%M:%S %Y'))
        for creneau in all_creneaux:
            creneau["debut_preparation"] = datetime.strptime(creneau["debut_preparation"],
                                                             '%a %b %d %H:%M:%S %Y') if type(
                creneau["debut_preparation"]) == str else creneau["debut_preparation"]
            creneau["fin_preparation"] = datetime.strptime(creneau["fin_preparation"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin_preparation"]) == str else creneau["fin_preparation"]
            creneau["fin"] = datetime.strptime(creneau["fin"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin"]) == str else creneau["fin"]

        matieres_loge = {}
        for matiere in all_matieres:
            if matiere["loge"]:
                matieres_loge[matiere["id_matiere"]] = matiere["loge"]
        logging.info(matieres_loge)


        # all_matieres = MATIERES.query.all()
        # all_creneaux = CRENEAU.query.order_by(CRENEAU.debut_preparation).all()
        # # Serialize table
        # creneaux = CRENEAU.query.order_by(CRENEAU.debut_preparation).all()
        # all_creneaux = []
        # for creneau in creneaux:
        #     all_creneaux.append(creneau.as_dict())

        # all_candidats = CANDIDATS.query.all()

        # # Serialize table
        # professeurs = PROFESSEUR.query.all()
        # all_professeurs = []
        # for professeur in professeurs:
        #     all_professeurs.append(professeur.as_dict())
        # # Serialize table
        # salles = SALLE.query.all()
        # all_salles = []
        # for salle in salles:
        #     all_salles.append(salle.as_dict())

        # all_choix_matieres = CHOIX_MATIERE.query.all()
        # all_liste_matiere = LISTE_MATIERE.query.all()
        # all_series = SERIE.query.all()

        return render_template('admin/salles.html', all_salles=all_salles, all_professeurs=all_professeurs,
                               all_matieres=all_matieres, all_creneaux=all_creneaux, all_candidats=all_candidats,
                               all_choix_matieres=all_choix_matieres,
                               all_series=all_series, jour=parametres[0]["max_jour"],
                               date=datetime.strptime(parametres[0]["date_premier_jour"], '%a %b %d %H:%M:%S %Y'),
                               matieres_loge=matieres_loge)
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/professeurs', methods=['POST', 'GET'])
def professeurs():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-professeurs",
            "data": {
                "target": "website-admin:website-admin-professeurs"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('submit_button') is not None:
                if 'name' in form and 'salle' in form:
                    result = main_database.add_professeur(
                        form['name'], form['salle'],
                        form['matiere'])
                    flash(result[0], result[1])
                    logging.warning(result[0])

            elif form.get('delete_button') is not None:
                if 'id' in form:
                    if r := main_database.delete_professeur(form['id']):
                        flash(r[0], r[1])
                        logging.warning(r[0])
            elif form.get('modify_button') is not None:
                if 'prof_id' in form and 'name' in form and 'salle' in form:
                    # result = main_database.delete_professeur(form['prof_id'])
                    result = main_database.update_professeur_wep(form['prof_id'],
                                                                 form['name'], form['salle'],
                                                                 form['matiere'])
                    flash(result[0], result[1])
                    logging.warning(result[0])

            elif form.get('delete_all_button') is not None:
                result = main_database.delete_all_professeurs()
                flash(result[0], result[1])

            elif request.files:
                uploaded_file = request.files['file']
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
                uploaded_file.save(file_path)

                response = ask_api("data/fetchmulti", ["serie", "matiere"])
                all_series, all_matieres = response.json()
                col_names = ['nom', 'serie', 'matiere']
                data = pd.read_csv(file_path, names=col_names, header=None)
                all_professeurs = []
                err = False
                # Loop through the Rows
                for i, row in data.iterrows():
                    if i == 0:
                        continue
                    id_serie = None
                    id_matiere = None

                    for serie in all_series:
                        if row["serie"] == serie["nom"]:
                            id_serie = serie["id_serie"]
                            break
                    if id_serie is None:
                        flash("Ligne " + str(i + 1) + ": Erreur sur la série", "danger")
                        err = True
                    for matiere in all_matieres:
                        if matiere["id_serie"] == id_serie or id_serie is None:
                            if row["matiere"] == matiere["nom"]:
                                id_matiere = matiere["id_matiere"]
                    if id_matiere is None:
                        flash("Ligne " + str(i + 1) + ": Erreur sur la matière", "danger")
                        err = True

                    if err is False:
                        all_professeurs.append({"nom": row["nom"], "matiere": id_matiere})

                if err is False:
                    main_database.delete_all_professeurs()
                    for professeur in all_professeurs:
                        main_database.add_professeur(professeur["nom"], None, professeur["matiere"])
                    flash("Les professeurs ont été ajouté", "success")

        response = ask_api("data/fetchmulti", ["candidat", "matiere", "professeur", "salle",
                                               "creneau", "serie"])
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_matieres, all_professeurs, all_salles, all_creneaux, all_series = response.json()
        all_professeurs.sort(key=lambda professeur: professeur['nom'])
        all_creneaux.sort(key=lambda creneau: creneau['debut_preparation'])
        for creneau in all_creneaux:
            creneau["debut_preparation"] = datetime.strptime(creneau["debut_preparation"],
                                                             '%a %b %d %H:%M:%S %Y') if type(
                creneau["debut_preparation"]) == str else creneau["debut_preparation"]
            creneau["fin_preparation"] = datetime.strptime(creneau["fin_preparation"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin_preparation"]) == str else creneau["fin_preparation"]
            creneau["fin"] = datetime.strptime(creneau["fin"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin"]) == str else creneau["fin"]
        all_matieres_filtered = []
        for matiere in all_matieres:
            matiere["nom"] = matiere["nom"].replace(" - None", "")
            all_matieres_filtered.append(matiere)
        all_matieres = all_matieres_filtered
        # all_horaires = []
        # for horaire in all_horaires_unsort:
        #     all_horaires.append({
        #         'id_horaire': horaire['id_horaire'],
        #         'horaire_arr1': strptime(horaire['horaire_arr1']),
        #         'horaire_dep1': strptime(horaire['horaire_dep1']),
        #         'horaire_arr2': strptime(horaire['horaire_arr2']),
        #         'horaire_dep2': strptime(horaire['horaire_dep2']),
        #         'horaire_arr3': strptime(horaire['horaire_arr3']),
        #         'horaire_dep3': strptime(horaire['horaire_dep3']),
        #     })
        # print(all_horaires)

        # # Serialize PROFESSEUR
        # profs = PROFESSEUR.query.order_by(PROFESSEUR.nom).all()
        # all_profs = []
        # for a_professeur in profs:
        #     all_profs.append(a_professeur.as_dict())
        # # Serialize TABLE
        # matieres = MATIERES.query.all()
        # all_matieres = []
        # for a_matiere in matieres:
        #     all_matieres.append(a_matiere.as_dict())
        # all_salles = SALLE.query.all()
        # all_creneaux = CRENEAU.query.order_by(CRENEAU.debut_preparation).all()
        # all_candidats = CANDIDATS.query.all()

        # all_horaires = HORAIRES.query.all()

        # liste_matieres = LISTE_MATIERE.query.all()
        # all_liste_matiere = []
        # for liste_matiere in liste_matieres:
        #     all_liste_matiere.append(liste_matiere.as_dict())
        return render_template('admin/professeurs.html', all_profs=all_professeurs, all_matieres=all_matieres,
                               all_salles=all_salles, all_creneaux=all_creneaux, all_candidats=all_candidats,
                               all_series=all_series)
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/series', methods=['POST', 'GET'])
def series():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-series",
            "data": {
                "target": "website-admin:website-admin-series"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('submit_button') is not None:
                if 'serie' in form:
                    result = main_database.add_serie(
                        form['serie'], True)
                    flash(result[0][0], result[0][1])
                    logging.warning(result[0][0])
            elif form.get('modify_button') is not None:
                if 'id' in form and 'serie' in form:
                    if r := main_database.update_serie(form['id'], form['serie']):
                        flash(r[0], r[1])
                        logging.warning(r[0])
            elif form.get('delete_button') is not None:
                if 'id' in form:
                    if r := main_database.delete_serie(form['id']):
                        flash(r[0], r[1])
                        logging.warning(r[0])

        response = ask_api(
            "data/fetchmulti", ["candidat", "serie", "matiere", "salle", "choix_matiere"])
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_series, all_matieres, all_salle, all_choix_matieres = response.json()
        all_candidats.sort(key=lambda candidat: candidat['nom'])
        all_series.sort(key=lambda serie: serie['nom'])

        # all_series = SERIE.query.order_by(SERIE.nom).all()
        # all_candidats = CANDIDATS.query.order_by(CANDIDATS.nom).all()
        # all_salle = SALLE.query.all()
        # all_matieres = MATIERES.query.all()
        # all_choix_matieres = CHOIX_MATIERE.query.all()
        return render_template('admin/series.html', all_series=all_series, all_candidats=all_candidats,
                               all_salle=all_salle, all_matieres=all_matieres, all_choix_matieres=all_choix_matieres)
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/matieres', methods=['POST', 'GET'])
def matieres():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-matieres",
            "data": {
                "target": "website-admin:website-admin-matieres"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('submit_button') is not None:
                if 'name' in form and 'serie' in form and 'temps_preparation' in form and 'temps_passage' in form and 'temps_preparation_tiers_temps' in form and 'temps_passage_tiers_temps' in form:
                    result = main_database.add_matiere(
                        form['name'], form['serie'], form['temps_preparation'], form['temps_preparation_tiers_temps'],
                        form['temps_passage'], form['temps_passage_tiers_temps'],
                        form['loge'] if 'loge' in form else None)
                    flash(result[0], result[1])
                    logging.warning(result[0])
            elif form.get('modif_button') is not None:
                if 'id' in form and 'matiereName' in form and 'serie' in form and 'temps_preparation' in form and 'temps_preparation_tiers_temps' in form and 'temps_passage' in form and 'temps_passage_tiers_temps' in form:
                    if r := main_database.update_matiere(form['id'], form['matiereName'], form['serie'],
                                                         form['temps_preparation'],
                                                         form['temps_preparation_tiers_temps'], form['temps_passage'],
                                                         form['temps_passage_tiers_temps'],
                                                         form['loge'] if 'loge' in form else None):
                        flash(r[0], r[1])
                        logging.warning(r[0])

            elif form.get('delete_button') is not None:
                if 'id' in form:
                    if r := main_database.delete_matiere(form['id']):
                        flash(r[0], r[1])
                        logging.warning(r[0])

        response = ask_api(
            "data/fetchmulti",
            ["candidat", "serie", "matiere", "salle", "choix_matiere", "professeur"])
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_series, all_matieres, all_salles, all_choix_matieres, all_profs = response.json()
        all_candidats.sort(key=lambda candidat: candidat['nom'])
        all_matieres.sort(key=lambda matiere: matiere['nom'])

        # all_matieres = MATIERES.query.order_by(MATIERES.nom).all()
        # all_series = SERIE.query.all()
        # all_salles = SALLE.query.all()
        # all_candidats = CANDIDATS.query.order_by(CANDIDATS.nom).all()
        # all_choix_matieres = CHOIX_MATIERE.query.all()
        return render_template('admin/matieres.html', all_matieres=all_matieres, all_series=all_series,
                               all_salles=all_salles, all_candidats=all_candidats,
                               all_choix_matieres=all_choix_matieres, all_profs=all_profs,)
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/creneau', methods=['POST', 'GET'])
def creneau():
    if (os.getenv("NETWORK_VISU") == "true"):
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website:website-admin",
            "data": {
                "target": "website:website-admin"
            }
        })
        requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
            "type": "trigger",
            "name": "website-admin:website-admin-creneau",
            "data": {
                "target": "website-admin:website-admin-creneau"
            }
        })

    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            form = request.form
            if form.get('submit_button') is not None:
                if 'candidat' in form and 'matiere' in form and 'salle' in form and 'debut' in form and 'fin_prepa' in form and 'fin' in form:
                    result = main_database.add_creneau(
                        form['candidat'], form['matiere'], form['salle'], form['debut'], form["fin_prepa"], form['fin'])
                    flash(result[0], result[1])
                    logging.warning(result[0])
            elif form.get('modify_button') is not None:
                if 'last_creneau_id' in form and 'candidat' in form and 'matiere' in form and 'salle' in form and 'debut' in form and 'fin_prepa' in form and 'fin' in form:
                    if not (res := main_database.delete_creneau(form['last_creneau_id'])):
                        result = main_database.add_creneau(
                            form['candidat'], form['matiere'], form['salle'], form['debut'], form["fin_prepa"],
                            form['fin'])
                        flash('Le créneau a correctement été modifiée', 'success')
                        logging.warning(result[0])
                    else:
                        flash(res[0], res[1])
                        logging.warning(res[0])
            elif form.get('delete_button') is not None:
                if 'id' in form:
                    if res := main_database.delete_creneau(form['id']):
                        flash(res[0], res[1])
                        logging.warning(res[0])
                    else:
                        flash("Le créneau a bien été supprimé", "success")
                        logging.warning("Le créneau a bien été supprimé")
            elif form.get('delete_all_button') is not None:
                result = main_database.delete_all_creneaux()
                flash(result[0], result[1])

        response = ask_api("data/fetchmulti", ["candidat", "serie", "matiere",
                                               "salle", "choix_matiere", "professeur", "creneau", "parametres"])
        logging.info(response.json())
        if response.status_code != 200:
            flash("Une erreur est survenue lors de la récupération des données", "danger")
        all_candidats, all_series, all_matieres, all_salles, all_choix_matieres, all_professeur, all_creneau, parametres = response.json()
        all_creneau.sort(key=lambda creneau: creneau['id_candidat'])
        for creneau in all_creneau:
            creneau["debut_preparation"] = datetime.strptime(creneau["debut_preparation"],
                                                             '%a %b %d %H:%M:%S %Y') if type(
                creneau["debut_preparation"]) == str else creneau["debut_preparation"]
            creneau["fin_preparation"] = datetime.strptime(creneau["fin_preparation"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin_preparation"]) == str else creneau["fin_preparation"]
            creneau["fin"] = datetime.strptime(creneau["fin"], '%a %b %d %H:%M:%S %Y') if type(
                creneau["fin"]) == str else creneau["fin"]

        all_creneau_deb = all_creneau.copy()
        all_creneau.sort(key=lambda creneau: creneau['debut_preparation'])
        all_candidats.sort(key=lambda candidat: candidat['nom'])

        # Serialize table
        # creneaux = CRENEAU.query.order_by(CRENEAU.id_candidat).all()
        # all_creneau = []
        # for creneau in creneaux:
        #     all_creneau.append(creneau.as_dict())
        # all_creneau_deb = CRENEAU.query.order_by(
        #     CRENEAU.debut_preparation).all()
        # # Serialize table
        # candidats = CANDIDATS.query.order_by(CANDIDATS.nom).all()
        # all_candidats = []
        # for candidat in candidats:
        #     all_candidats.append(candidat.as_dict())
        # # Serialize table
        # matieres = MATIERES.query.all()
        # all_matieres = []
        # for a_matiere in matieres:
        #     all_matieres.append(a_matiere.as_dict())
        # # Serialize table
        # salles = SALLE.query.all()
        # all_salles = []
        # for salle in salles:
        #     all_salles.append(salle.as_dict())
        # # Serialize table
        # choix_matieres = CHOIX_MATIERE.query.all()
        # all_choix_matieres = []
        # for choix_matiere in choix_matieres:
        #     all_choix_matieres.append(choix_matiere.as_dict())
        # # Serialize table
        # series = SERIE.query.all()
        # all_series = []
        # for serie in series:
        #     all_series.append(serie.as_dict())
        # # Serialize table
        # professeurs = PROFESSEUR.query.all()
        # all_professeur = []
        # for professeur in professeurs:
        #     all_professeur.append(professeur.as_dict())

        # liste_matieres = LISTE_MATIERE.query.all()
        # all_liste_matieres = []
        # for liste_matiere in liste_matieres:
        #     all_liste_matieres.append(liste_matiere.as_dict())
        return render_template('admin/creneau.html', all_professeur=all_professeur, all_creneau=all_creneau,
                               all_candidats=all_candidats, all_matieres=all_matieres, all_salles=all_salles,
                               all_creneau_deb=all_creneau_deb, all_series=all_series,
                               all_choix_matieres=all_choix_matieres, parametres=parametres[0])
    else:
        return redirect(url_for('main_routes.connexion'))


@admin_routes.route('/parametres', methods=['POST', 'GET'])
def parametres():
    if main_security.test_session_connected(session, True):
        if request.method == 'POST':
            logging.info("POST")
            form = request.form
            if form.get('modify_button') is not None:
                if 'jour' in form and 'debut_matin' in form and 'fin_matin' in form and 'debut_apresmidi' in form and 'fin_apresmidi' in form and 'intervalle' in form and 'pause' in form and 'passage' in form and 'date_debut' in form and 'loge_apresmidi' in form:
                    date_debut = datetime(year=datetime.now().year, month=7, day=int(form['date_debut']))
                    result = main_database.change_parametres(
                        form['jour'], form['debut_matin'], form['fin_matin'], form['debut_apresmidi'], form['loge_apresmidi'],
                        form["fin_apresmidi"], form['intervalle'], form['pause'], form['passage'], date_debut.strftime('%Y-%m-%d'))
                    flash(result[0], result[1])
                    logging.warning(result[0])
            elif form.get('delete_button') is not None:
                result = main_database.delete_all_content()
                flash(result[0], result[1])
                logging.warning(result[0])


    response = ask_api("data/fetch/parametres", [])
    if response.status_code != 200:
        flash("Une erreur est survenue lors de la récupération des données", "danger")

    logging.info(response.json())
    parametres = response.json()[0]
    parametres["heure_debut_matin"] = datetime.strptime(parametres["heure_debut_matin"], '%H:%M:%S') if type(
        parametres["heure_debut_matin"]) == str else parametres["heure_debut_matin"]
    parametres["heure_fin_matin"] = datetime.strptime(parametres["heure_fin_matin"], '%H:%M:%S') if type(
        parametres["heure_fin_matin"]) == str else parametres["heure_fin_matin"]
    parametres["heure_debut_apres_midi"] = datetime.strptime(parametres["heure_debut_apres_midi"], '%H:%M:%S') if type(
        parametres["heure_debut_apres_midi"]) == str else parametres["heure_debut_apres_midi"]
    parametres["heure_loge_apres_midi"] = datetime.strptime(parametres["heure_loge_apres_midi"], '%H:%M:%S') if type(
        parametres["heure_loge_apres_midi"]) == str else parametres["heure_loge_apres_midi"]
    parametres["heure_fin_apres_midi"] = datetime.strptime(parametres["heure_fin_apres_midi"], '%H:%M:%S') if type(
        parametres["heure_fin_apres_midi"]) == str else parametres["heure_fin_apres_midi"]

    horaire_list = []
    for h in range(7, 20):
        for m in range(0, 60, 10):
            horaire = str(h) + "h" + str(m)
            horaire_list.append(datetime.strptime(horaire, "%Hh%M"))
    horaire_list.append(datetime.strptime('20h00', "%Hh%M"))
    logging.info(horaire_list)

    return render_template('admin/parametres.html', parametres=parametres, horaire=horaire_list)


@admin_routes.route('/deconnexion')
def deconnexion():
    if session['email']:
        session.pop('email', None)
    if session['password']:
        session.pop('password', None)
    flash('Vous avez correment été déconnecté', 'primary')
    logging.warning('Deconnexion reussie')
    return redirect(url_for('main_routes.index'))


if (os.getenv("NETWORK_VISU") == "true"):
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin",
        "data": {
            "name": "Admin",
            "id": "website-admin",
            "size": 46,
            "fsize": 30
        },
        "position": {
            "x": 580,
            "y": 736
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website:website-admin",
        "data": {
            "id": "website:website-admin",
            "weight": 1,
            "source": "website",
            "target": "website-admin"
        }
    })

    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-account",
        "data": {
            "name": "Comptes",
            "id": "website-admin-account",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 453,
            "y": 825
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-account",
        "data": {
            "id": "website-admin:website-admin-account",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-account"
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-creneau",
        "data": {
            "name": "Créneaux",
            "id": "website-admin-creneau",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 505,
            "y": 874
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-creneau",
        "data": {
            "id": "website-admin:website-admin-creneau",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-creneau"
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-professeurs",
        "data": {
            "name": "Professeurs",
            "id": "website-admin-professeurs",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 562,
            "y": 888
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-professeurs",
        "data": {
            "id": "website-admin:website-admin-professeurs",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-professeurs"
        }
    })

    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-candidats",
        "data": {
            "name": "Candidats",
            "id": "website-admin-candidats",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 624,
            "y": 888
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-candidats",
        "data": {
            "id": "website-admin:website-admin-candidats",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-candidats"
        }
    })

    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-matieres",
        "data": {
            "name": "Matières",
            "id": "website-admin-matieres",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 677,
            "y": 874
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-matieres",
        "data": {
            "id": "website-admin:website-admin-matieres",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-matieres"
        }
    })

    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-series",
        "data": {
            "name": "Séries",
            "id": "website-admin-series",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 716,
            "y": 850
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-series",
        "data": {
            "id": "website-admin:website-admin-series",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-series"
        }
    })

    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-accueil",
        "data": {
            "name": "Accueil",
            "id": "website-admin-accueil",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 738,
            "y": 792
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-accueil",
        "data": {
            "id": "website-admin:website-admin-accueil",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-accueil"
        }
    })

    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "node",
        "name": "website-admin-salles",
        "data": {
            "name": "Salles",
            "id": "website-admin-salles",
            "size": 28,
            "fsize": 20
        },
        "position": {
            "x": 752,
            "y": 736
        }
    })
    requests.post("http://" + os.getenv("LOCAL_IP") + ":3000/add", json={
        "type": "edge",
        "name": "website-admin:website-admin-salles",
        "data": {
            "id": "website-admin:website-admin-salles",
            "weight": 1,
            "source": "website-admin",
            "target": "website-admin-salles"
        }
    })
