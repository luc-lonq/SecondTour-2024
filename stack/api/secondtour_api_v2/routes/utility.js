const express = require('express')
const router = express.Router()

router.route('/createtables').get(async (red, res) => {
  await db.query(`create table if not exists salle
    (
      id_salle int auto_increment primary key,
      numero varchar (50) not null,
      constraint UNQ_NUMERO unique (numero)
    );`).catch(e => {
    res.status(500).send(e)
  })


  await db.query(`create table if not exists utilisateur
            (
                id_utilisateur int auto_increment
                    primary key,
                email          varchar(200) not null,
                password       varchar(200) not null,
                admin          tinyint(1)   not null,
                constraint UNQ_utilisateur_email
                    unique (email)
            );`).catch(e => {
    res.status(500).send(e)
  })

  await db.query(`create table if not exists serie
            (
                id_serie    int auto_increment
                    primary key,
                nom         varchar(50) not null,
                constraint UNQ_NOM
                    unique (nom)
            );`).catch(e => {
    res.status(500).send(e)
  })

  await db.query(`create table if not exists matiere
            (
                id_matiere                    int auto_increment
                    primary key,
                id_serie                      int         not null,
                nom                           varchar(30) not null,
                temps_preparation             int         not null,
                temps_preparation_tiers_temps int         not null,
                temps_passage                 int         not null,
                temps_passage_tiers_temps     int         not null,
                loge                          int         null,
                constraint UNQ_NOM_SERIE_TPS_PREPA
                    unique (nom, id_serie, temps_preparation, temps_passage),
                constraint fk_matiere_salle
                    foreign key (loge) references salle (id_salle),
                constraint fk_matiere_serie
                    foreign key (id_serie) references serie (id_serie)
            );`).catch(e => {
    res.status(500).send(e)
  })


  await db.query(`create table if not exists parametres
            (
                id_parametre                int auto_increment
                    primary key,
                max_jour                    tinyint(1) not null,
                heure_debut_matin           time       not null,
                heure_fin_matin             time       not null,
                heure_debut_apres_midi      time       not null,
                heure_loge_apres_midi       time       not null,
                heure_fin_apres_midi        time       not null,
                intervalle                  int        not null,
                temps_pause_eleve           int        not null,
                prof_max_passage_sans_pause tinyint(1) not null,
                date_premier_jour           date       not null
            );`).catch(e => {
    res.status(500).send(e)
  })

  await db.query(`create table if not exists candidat
            (
                id_candidat int auto_increment
                    primary key,
                nom         varchar(200) not null,
                prenom      varchar(150) not null,
                id_serie    int          not null,
                tiers_temps tinyint(1)   not null,
                absent      tinyint(1)   not null,
                matin       tinyint(1)   not null,
                jour        tinyint(1)   not null,
                constraint fk_candidat_id_serie_serie
                    foreign key (id_serie) references serie (id_serie)
            );`).catch(e => {
    res.status(500).send(e)
  })


  await db.query(`create table if not exists professeur
            (
                id_professeur int auto_increment
                    primary key,
                nom           varchar(30) not null,
                prenom        varchar(30) not null,
                salle         int         null,
                matiere       int         null,
                constraint fk_professeur__matiere
                    foreign key (matiere) references matiere (id_matiere),
                constraint fk_professeur__salle_salle
                    foreign key (salle) references salle (id_salle)
            );`).catch(e => {
    res.status(500).send(e)
  })


  await db.query(`create table if not exists choix_matiere
            (
                id_choix_matiere int auto_increment
                    primary key,
                id_candidat      int not null,
                matiere1         int null,
                matiere2         int null,
                constraint UNQ_CANDIDAT
                    unique (id_candidat),
                constraint fk_choix_matiere_id_candidat
                    foreign key (id_candidat) references candidat (id_candidat),
                constraint fk_choix_matiere_matiere1
                    foreign key (matiere1) references matiere (id_matiere),
                constraint fk_choix_matiere_matiere2
                    foreign key (matiere2) references matiere (id_matiere)
            );`).catch(e => {
    res.status(500).send(e)
  })


  await db.query(`create table if not exists creneau
            (
                id_creneau        int auto_increment
                    primary key,
                id_candidat       int      not null,
                id_matiere        int      not null,
                id_salle          int      not null,
                debut_preparation datetime not null,
                fin_preparation   datetime not null,
                fin               datetime not null,
                constraint UNQ_CANDIDAT_MATIERE
                    unique (id_candidat, id_matiere),
                constraint UNQ_CANDIDAT_PREPA
                    unique (id_candidat, debut_preparation),
                constraint fk_creneau_id_candidat
                    foreign key (id_candidat) references candidat (id_candidat),
                constraint fk_creneau_id_matiere
                    foreign key (id_matiere) references matiere (id_matiere),
                constraint fk_creneau_id_salle
                    foreign key (id_salle) references salle (id_salle)
            );`).catch(e => {
    res.status(500).send(e)
  })


  res.status(200).send({'utility':'createtables'})
})


router.route('/init').get(async (req, res) => {
    serie = await db.query(`SELECT * FROM serie`).catch(e => {
        res.status(500).send(e)
    })
    if (serie.length === 0)
        return {'error': 'utility/init', 'on': 'serie'}


    matiere = await db.query(`SELECT * FROM matiere`).catch(e => {
        res.status(500).send(e)
    })
    if (matiere.length === 0)
        return {'error': 'utility/init', 'on': 'matiere'}

    parametres = await db.query(`SELECT * FROM parametres`).catch(e => {
        res.status(500).send(e)
    })
    if (parametres.length === 0)
        return {'error': 'utility/init', 'on': 'parametres'}

    utilisateur = await db.query(`SELECT * FROM utilisateur`).catch(e => {
        res.status(500).send(e)
    })
    if (utilisateur.length === 0)
        return {'error': 'utility/init', 'on': 'utilisateur'}

    await db.query(`insert into serie (id_serie, nom)
                    values (1, 'Générale');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into serie (id_serie, nom)
                    values (2, 'Technologique STI2D');`).catch(e => {
        res.status(500).send(e)
    })

    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (1, 1, 'SES', 20, 30, 30, 40, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (2, 1, 'Mathématiques', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (3, 1, 'Philosophie', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (4, 1, 'HLP', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (5, 1, 'HGGSP', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (6, 1, 'SVT', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (7, 1, 'Physique-Chimie', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (8, 1, 'SI', 60, 80, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (9, 1, 'NSI', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (10, 1, 'Anglais', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (11, 1, 'AMC', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (12, 1, 'Français', 20, 30, 30, 40, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (13, 1, 'Espagnol', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (14, 2, 'SIN', 60, 80, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (15, 2, 'ITEC', 60, 80, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (16, 2, 'EE', 60, 80, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (17, 2, 'AC', 60, 80, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (18, 2, 'Mathématiques-Physiques', 30, 40, 30, 40, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (19, 2, 'Philosophie', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })

    await db.query(`insert into parametres (id_parametre, max_jour, heure_debut_matin, heure_fin_matin,
                                            heure_debut_apres_midi, heure_loge_apres_midi,
                                            heure_fin_apres_midi, intervalle, temps_pause_eleve,
                                            prof_max_passage_sans_pause,
                                            date_premier_jour)
                    values (1, 1, '08:00', '13:00', '14:00', '13:00', '20:00', 10, 30, 5, '2024-07-09');`).catch(e => {
        res.status(500).send(e)
    })

    await db.query(`insert into utilisateur (id_utilisateur, email, password, admin)
                    values (1, 'admin@ac-poitiers.fr', '$p5k2$3e8$AfpOzesj$.KoGR.raCRkA3gne.aZrF1bQobRfdSIH',
                            true);`).catch(e => {
        res.status(500).send(e)
    })

    res.status(200).send({'utility': 'init'})
})

router.route('/fixtures').get(async (req, res) => {
    await db.query(`insert into serie (id_serie, nom)
                    values (1, 'Générale');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into serie (id_serie, nom)
                    values (2, 'Technologique STI2D');`).catch(e => {
        res.status(500).send(e)
    })


    await db.query(`insert into salle (id_salle, numero)
                    values (1, 'A001');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (2, 'A002');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (3, 'A003');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (4, 'A004');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (5, 'A005');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (6, 'A006');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (7, 'A007');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (8, 'A008');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (9, 'A009');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (10, 'A010');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (11, 'A011');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (12, 'A012');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (13, 'A013');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (14, 'A014');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (15, 'A015');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (16, 'A016');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (17, 'A017');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (18, 'A018');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (19, 'A019');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (20, 'A020');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (21, 'A021');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (22, 'A022');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (23, 'A023');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (24, 'A024');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (25, 'A025');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (26, 'A026');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (27, 'A027');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (28, 'A028');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (29, 'A029');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (30, 'A030');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (31, 'A031');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (32, 'A032');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (33, 'A033');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (34, 'A034');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (35, 'A035');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (36, 'A036');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (37, 'A037');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (38, 'A038');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (39, 'A039');`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into salle (id_salle, numero)
                    values (40, 'A040');`).catch(e => {
        res.status(500).send(e)
    })


    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (1, 'AVINIO', 'Romain', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (2, 'BARTHOLOME', 'Jules', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (3, 'BERTHEOT', 'Tonin', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (4, 'BOISSON', 'Tony', 2, 1, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (5, 'BONNIN', 'Titouan', 2, 1, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (6, 'BRUNEAU', 'Shana', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (7, 'BUCHHEIT', 'Guillaume', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (8, 'CAILLER', 'Noah', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (9, 'FOUQUET', 'Gauthier', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (10, 'FRELAND', 'Louis', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (11, 'HERRY', 'Tifany', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (12, 'LOUGUET', 'Antoine', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (13, 'MANELPHE', 'Arthur', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (14, 'MILLET', 'Lucas', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (15, 'MOREAU', 'Lou', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (16, 'REDON', 'Tom', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (17, 'RIMBAUD', 'Hugo', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (18, 'TEXIER', 'Benoit', 2, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (19, 'AKDENIZ', 'Beyza', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (20, 'AUDOIN', 'Tom', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (21, 'BARTHONNET', 'Donovan', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (22, 'BEAUCOUR', 'Maéline', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (23, 'BELIVIER', 'Hanna', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (24, 'BENADIE', 'Emilie-Rose', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (25, 'BERRIAU', 'Gabriel', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (26, 'DESSONNAUD-TAMY', 'Capucine', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (27, 'BONHOURE', 'Mathis', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (28, 'BONNET', 'Louise', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (29, 'BOUAN', 'Hugo', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (30, 'BOURNET', 'Luca', 1, 1, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (31, 'BRAYNAS', 'Solane', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (32, 'CHALLAS', 'Alexis', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (33, 'CHAUSSAT', 'Lorenzo', 1, 0, 1, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (34, 'COEFFIC', 'Noé', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (35, 'DECO', 'Baptiste', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (36, 'DELACROIX', 'Alexander', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (37, 'DI MARIA-REINARD', 'Amoti', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (38, 'DJAKOVITCH', 'Inès', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (39, 'DJERDJAR', 'Gabin', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (40, 'DRAPEAU', 'Teddy', 1, 1, 1, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (41, 'EDOUARD LUQUE', 'Nolane', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (42, 'EL IDRISSI', 'Amina', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (43, 'FEAO', 'Upaleto', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (44, 'FOURRE--DEGRE', 'Julien', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (45, 'GAINCHE', 'Amaury', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (46, 'GENDREAU', 'Luna', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (47, 'GERALDES BAPTISTA', 'Océane', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (48, 'GOUINEAU', 'Omérine', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (49, 'GOUJON', 'Emma', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (50, 'GUILLOZO', 'Lucie', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (51, 'GURBUZ', 'Mélissa', 1, 1, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (52, 'HERAUD', 'Louise', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (53, 'HOLLANDE SANSON', 'Keliah', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (54, 'JUCHEREAU', 'Camille', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (55, 'LEDOUX', 'Mélina', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (56, 'LEGER', 'Victor', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (57, 'MAZUREK', 'Loane', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (58, 'PAIN', 'Clarence', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (59, 'PAUTROT', 'Nino', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (60, 'PLAUQUIN', 'Emma', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (61, 'PYDO', 'Aymeric', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (62, 'SCHLUMBERGER', 'Jeanne', 1, 0, 0, 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (63, 'ALTER', 'Annaëlle', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (64, 'ANDRADE', 'Angel', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (65, 'BATIER', 'Louis', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (66, 'BOUCHENY', 'Mathias', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (67, 'BRUNET', 'Axel', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (68, 'DA SILVA', 'Enzo', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (69, 'FIERRARD', 'Elise', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (70, 'GENOUD', 'Philomène', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (71, 'GUIET', 'Camille', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (72, 'HENNETON', 'Malcom', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (73, 'HENSTOCK', 'Sebastian', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (74, 'HOUDE', 'Marion', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (75, 'LAUNETTE', 'Damien', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (76, 'LOU', 'Loan', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (77, 'LOZACH', 'Lysandre', 1, 1, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (78, 'MICHALLET-FERRIER', 'Tania', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (79, 'MILOUD OULD BOUZIANE', 'Mattys', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (80, 'MINET', 'Léandre', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (81, 'MONTERRAIN', 'Killian', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (82, 'ORGE', 'Laura', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (83, 'PASSARD', 'Camille', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (84, 'PELISSON', 'Camille', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (85, 'PETIT', 'Morgane', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (86, 'PICQUOT', 'Samuel', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (87, 'POIRET', 'Robin', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (88, 'PONIENSKI', 'Lola', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (89, 'REBERE-AGION', 'Léane', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (90, 'RENARD', 'Audélie', 1, 1, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (91, 'ROY', 'Baptiste', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (92, 'ROYER', 'Paul', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (93, 'SA', 'Jénawé', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (94, 'SABATIER', 'Amandine', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (95, 'SALANOVA', 'Lilou', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (96, 'SERCEAU', 'Lylia', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (97, 'SHAIPOV', 'Akhmed', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (98, 'SIMON', 'Daniel', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (99, 'SIMONNET', 'Clara', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (100, 'SIOU--MALOISEL', 'Youenn', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (101, 'TEIXEIRA', 'Lola', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (102, 'TERNUS', 'Manolo', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (103, 'TESSIER', 'Alexis', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (104, 'TREPOS', 'Guilhem', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (105, 'VASSAUX', 'Manon', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (106, 'VERGELOT', 'Erine', 1, 1, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (107, 'YILMAZ', 'Teoman', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into candidat (id_candidat, nom, prenom, id_serie, tiers_temps, absent, matin, jour)
                    values (108, 'ZAIM', 'Ilyass', 1, 0, 0, 0, 1);`).catch(e => {
        res.status(500).send(e)
    })


    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (1, 1, 'SES', 20, 30, 30, 40, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (2, 1, 'Mathématiques', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (3, 1, 'Philosophie', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (4, 1, 'HLP', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (5, 1, 'HGGSP', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (6, 1, 'SVT', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (7, 1, 'Physique-Chimie', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (8, 1, 'SI', 60, 80, 20, 30, 40);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (9, 1, 'NSI', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (10, 1, 'Anglais', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (11, 1, 'AMC', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (12, 1, 'Français', 20, 30, 30, 40, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (13, 1, 'Espagnol', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (14, 2, 'SIN', 60, 80, 20, 30, 40);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (15, 2, 'ITEC', 60, 80, 20, 30, 40);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (16, 2, 'EE', 60, 80, 20, 30, 40);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (17, 2, 'AC', 60, 80, 20, 30, 40);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (18, 2, 'Mathématiques-Physiques', 30, 40, 30, 40, null);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into matiere (id_matiere, id_serie, nom, temps_preparation, temps_preparation_tiers_temps,
                                         temps_passage, temps_passage_tiers_temps, loge)
                    values (19, 2, 'Philosophie', 20, 30, 20, 30, null);`).catch(e => {
        res.status(500).send(e)
    })


    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (1, 'BOISSEAU', 'François-Robert', 1, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (2, 'BRIAUD', 'Benedicte', 2, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (3, 'CAQUINEAU', 'Didier', 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (4, 'GEORGES', 'Camille', 4, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (5, 'JASKULA', 'Thomas', 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (6, 'BRACHET', 'Cyrille', 6, 2);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (7, 'FORGET', 'Thomas', 7, 2);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (8, 'LAHBIB', 'Olivier', 8, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (9, 'LESTABLE', 'Christine', 9, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (10, 'PELLICER-ESQUIEU', 'Antoine', 10, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (11, 'NAVARON', 'Remi', 11, 4);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (12, 'COSSE', 'Eric', 12, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (13, 'DURAND', 'Marie', 13, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (14, 'LACRAMPE', 'Herve Alexandre', 14, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (15, 'LAROCHE', 'Olivier', 15, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (16, 'CHASTANG', 'Charlotte', 16, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (17, 'LAVIE', 'Pascal', 17, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (18, 'POMPOUGNAC', 'Alexandre', 18, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (19, 'BERNAND', 'Nadege', 19, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (20, 'TOUSSAINT', 'Arnaud', 20, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (21, 'PORCHET', 'Philippe', 21, 8);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (22, 'GOGUET', 'Johnny', 22, 9);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (23, 'FOUGERE', 'Lauranne', 23, 10);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (24, 'SURAUD', 'Marie', 24, 11);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (25, 'SCHWARTZ', 'Elodie', 25, 12);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (26, 'DELFINI', 'Benoit', 26, 13);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (27, 'PERRON', 'Pascal', 27, 14);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (28, 'PROUST', 'Laurent', 28, 14);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (29, 'VIART', 'Philippe', 29, 15);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (30, 'GROSS', 'Jean-Noel', 30, 16);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (31, 'MADEC', 'Olivier', 31, 17);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (32, 'OUALA', 'Hafid', 32, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (33, 'BAERT', 'Philippe', 32, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (34, 'BAUX', 'Pierre', 33, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (35, 'BELRHITRI', 'Yahya', 33, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (36, 'CHEVAL', 'Sophie', 34, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (37, 'GOLIGER', 'Georges', 34, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (38, 'VOISIN', 'Mederic', 35, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (39, 'SIBOTTIER', 'Denis', 35, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into professeur (id_professeur, nom, prenom, salle, matiere)
                    values (40, 'FOURCASSIE', 'Tolsan', 36, 19);`).catch(e => {
        res.status(500).send(e)
    })


    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (1, 19, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (2, 15, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (3, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (4, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (5, 17, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (6, 16, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (7, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (8, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (9, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (10, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (11, 19, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (12, 15, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (13, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (14, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (15, 15, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (16, 15, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (17, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (18, 14, 18);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (19, 5, 2);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (20, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (21, 7, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (22, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (23, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (24, 4, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (25, 4, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (26, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (27, 3, 8);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (28, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (29, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (30, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (31, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (32, 5, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (33, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (34, 3, 9);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (35, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (36, 3, 8);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (37, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (38, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (39, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (41, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (42, 3, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (43, 2, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (44, 9, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (45, 12, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (46, 11, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (47, 3, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (48, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (49, 4, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (50, 7, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (51, 5, 4);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (52, 1, 4);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (53, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (54, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (55, 5, 11);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (56, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (57, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (58, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (59, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (60, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (61, 3, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (62, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (63, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (64, 2, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (65, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (66, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (67, 5, 10);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (68, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (69, 2, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (70, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (71, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (72, 2, 10);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (73, 5, 10);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (74, 1, 11);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (75, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (76, 2, 8);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (77, 9, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (78, 5, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (79, 9, 8);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (80, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (81, 1, 11);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (82, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (83, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (84, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (85, 3, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (86, 5, 11);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (87, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (88, 5, 4);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (89, 7, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (90, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (91, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (92, 5, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (93, 5, 4);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (94, 5, 4);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (95, 1, 3);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (96, 1, 11);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (97, 3, 6);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (98, 7, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (99, 3, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (100, 5, 10);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (101, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (102, 6, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (103, 3, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (104, 3, 5);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (105, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (106, 5, 1);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (107, 2, 7);`).catch(e => {
        res.status(500).send(e)
    })
    await db.query(`insert into choix_matiere (id_candidat, matiere1, matiere2)
                    values (108, 2, 13);`).catch(e => {
        res.status(500).send(e)
    })

    await db.query(`insert into parametres (id_parametre, max_jour, heure_debut_matin, heure_fin_matin,
                                            heure_debut_apres_midi, heure_loge_apres_midi,
                                            heure_fin_apres_midi, intervalle, temps_pause_eleve,
                                            prof_max_passage_sans_pause,
                                            date_premier_jour)
                    values (1, 1, '08:00', '13:00', '14:00', '13:00', '20:00', 10, 30, 5, '2024-07-09');`).catch(e => {
        res.status(500).send(e)
    })

    await db.query(`insert into utilisateur (id_utilisateur, email, password, admin)
                    values (1, 'admin@ac-poitiers.fr', '$p5k2$3e8$AfpOzesj$.KoGR.raCRkA3gne.aZrF1bQobRfdSIH',
                            true);`).catch(e => {
        res.status(500).send(e)
    })

    res.status(200).send({'utility': 'fixtures'})
})

module.exports = router