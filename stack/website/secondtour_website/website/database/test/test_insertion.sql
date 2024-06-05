-- INSERTION DES salleS--
INSERT INTO salle
VALUES (1, 'D100');
INSERT INTO salle
VALUES (2, 'D101');
INSERT INTO salle
VALUES (3, 'D003');
INSERT INTO salle
VALUES (4, 'D004');
INSERT INTO salle
VALUES (5, 'D005');
INSERT INTO salle
VALUES (6, 'D006');
INSERT INTO salle
VALUES (7, 'D007');
INSERT INTO salle
VALUES (8, 'D008');
INSERT INTO salle
VALUES (9, 'D009');
INSERT INTO salle
VALUES (10, 'D010');
INSERT INTO salle
VALUES (11, 'D011');
INSERT INTO salle
VALUES (12, 'D012');

-- INSERTION DES serieS--
INSERT INTO serie
VALUES (1, 'Générale', 'Mathématiques', 'SVT');
INSERT INTO serie
VALUES (2, 'Générale', 'Physique', 'SI');
INSERT INTO serie
VALUES (3, 'Technologique', 'STI2D', NULL);

-- INSERTION DES matiere--
INSERT INTO matiere
VALUES (1, 1, 'Mathématiques', 'Mathématiques - Mathématiques/SVT', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (2, 1, 'SVT', 'SVT - Mathématiques/SVT', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (3, 1, 'Français', 'Français - Mathématiques/SVT', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (4, 1, 'Philosophie', 'Philosophie - Mathématiques/SVT', 30, 40, 30, 40, NULL);

INSERT INTO matiere
VALUES (5, 2, 'Physique', 'Physique - Physique/SI', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (6, 2, 'SI', 'SI - Physique/SI', 60, 60, 30, 40, 1);
INSERT INTO matiere
VALUES (7, 2, 'Français', 'Français - Physique/SI', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (8, 2, 'Philosophie', 'Philosophie - Physique/SI', 30, 40, 30, 40, NULL);

INSERT INTO matiere
VALUES (9, 3, '2I2D', '2I2D - STI2D', 60, 60, 30, 40, 2);
INSERT INTO matiere
VALUES (10, 3, 'Mathématiques/Physique', 'Mathématiques/Physique - STI2D', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (11, 3, 'Français', 'Français - STI2D', 30, 40, 30, 40, NULL);
INSERT INTO matiere
VALUES (12, 3, 'Philosophie', 'Philosophie - STI2D', 30, 40, 30, 40, NULL);

-- INSERTION DES candidat--
INSERT INTO candidat
VALUES (1, 'Oumiri', 'Hakim', 1, true, false);
INSERT INTO choix_matiere
VALUES (1, 1, 1, 2);

INSERT INTO candidat
VALUES (2, 'Garland', 'Gamelin', 1, true, false);
INSERT INTO choix_matiere
VALUES (2, 2, 1, 3);

INSERT INTO candidat
VALUES (3, 'Huon', 'Guimond', 2, false, false);
INSERT INTO choix_matiere
VALUES (3, 3, 5, 6);

INSERT INTO candidat
VALUES (4, 'Pinette', 'Agathe', 3, false, false);
INSERT INTO choix_matiere
VALUES (4, 4, 9, 10);

INSERT INTO candidat
VALUES (5, 'Allain', 'Clothilde', 3, false, false);
INSERT INTO choix_matiere
VALUES (5, 5, 9, 10);

INSERT INTO candidat
VALUES (6, 'Jalbert', 'Arienne', 3, false, false);
INSERT INTO choix_matiere
VALUES (6, 6, 9, 10);

INSERT INTO candidat
VALUES (7, 'Bernard', 'Noémie', 3, false, false);
INSERT INTO choix_matiere
VALUES (7, 7, 9, 11);

INSERT INTO candidat
VALUES (8, 'Gousse', 'Maurice', 1, false, false);
INSERT INTO choix_matiere
VALUES (8, 8, 1, 3);

INSERT INTO candidat
VALUES (9, 'Le mendes', 'Isaac', 1, false, false);
INSERT INTO choix_matiere
VALUES (9, 9, 2, 3);

INSERT INTO candidat
VALUES (10, 'Guillot', 'Henri', 1, false, false);
INSERT INTO choix_matiere
VALUES (10, 10, 1, 2);

INSERT INTO candidat
VALUES (11, 'Foucher', 'Charlotte', 2, false, false);
INSERT INTO choix_matiere
VALUES (11, 11, 5, 6);

INSERT INTO candidat
VALUES (12, 'Duhamel', 'Claire', 2, false, false);
INSERT INTO choix_matiere
VALUES (12, 12, 5, 6);

INSERT INTO candidat
VALUES (13, 'Pons', 'Sebastien', 2, false, false);
INSERT INTO choix_matiere
VALUES (13, 13, 5, 6);

INSERT INTO candidat
VALUES (14, 'Vincent', 'Noémie', 2, false, false);
INSERT INTO choix_matiere
VALUES (14, 14, 5, 7);

INSERT INTO candidat
VALUES (15, 'Lefebvre', 'Gilles', 3, false, false);
INSERT INTO choix_matiere
VALUES (15, 15, 9, 10);

INSERT INTO candidat
VALUES (16, 'Devaux', 'Marine', 3, false, false);
INSERT INTO choix_matiere
VALUES (16, 16, 9, 10);

INSERT INTO candidat
VALUES (17, 'Labbe', 'David', 3, false, false);
INSERT INTO choix_matiere
VALUES (17, 17, 9, 10);

INSERT INTO candidat
VALUES (18, 'Gomes', 'Aimé', 3, false, false);
INSERT INTO choix_matiere
VALUES (18, 18, 9, 10);

INSERT INTO candidat
VALUES (19, 'Ribeiro', 'Alfred', 3, false, false);
INSERT INTO choix_matiere
VALUES (19, 19, 9, 10);

INSERT INTO candidat
VALUES (20, 'Romero', 'Julio', 3, false, false);
INSERT INTO choix_matiere
VALUES (20, 20, 9, 12);

INSERT INTO candidat
VALUES (21, 'Leroy', 'Benoît', 3, false, false);
INSERT INTO choix_matiere
VALUES (21, 21, 10, 11);

INSERT INTO candidat
VALUES (22, 'Dias', 'Gilles', 3, false, false);
INSERT INTO choix_matiere
VALUES (22, 22, 10, 11);

INSERT INTO candidat
VALUES (23, 'Lemaire', 'Alain', 3, true, false);
INSERT INTO choix_matiere
VALUES (23, 23, 10, 9);

-- INSERTION DES professeurS--
-- INSERT INTO professeur
-- VALUES (NULL, 1, 'Hubert', 'Jean', 1, 2); --PROF WITH ACCOUNT ALREADY MADE MANUALLY
-- MATHS G
INSERT INTO professeur
VALUES (1, 'De Renaud', 'Julien', 3);
INSERT INTO liste_matiere
VALUES (1, 1, 1);
-- SVT G
INSERT INTO professeur
VALUES (2, 'Pelletier-aubert', 'Aimé', 4);
INSERT INTO liste_matiere
VALUES (2, 2, 2);
-- FRANCAIS G
INSERT INTO professeur
VALUES (3, 'Langlois', 'Marie-Charlotte', 5);
INSERT INTO liste_matiere
VALUES (3, 3, 3);
INSERT INTO liste_matiere
VALUES (4, 3, 7);
-- PHILO G
INSERT INTO professeur
VALUES (4, 'Lacroix', 'Daisy', 6);
INSERT INTO liste_matiere
VALUES (5, 4, 4);
INSERT INTO liste_matiere
VALUES (6, 4, 8);
-- PYSIQUE G
INSERT INTO professeur
VALUES (5, 'Goncalves', 'Denis', 7);
INSERT INTO liste_matiere
VALUES (7, 5, 5);
-- SI G
INSERT INTO professeur
VALUES (6, 'Renault', 'Thomas', 8);
INSERT INTO liste_matiere
VALUES (8, 6, 6);
-- 2I2D STI2D
INSERT INTO professeur
VALUES (7, 'Legendre', 'Rémy', 9);
INSERT INTO liste_matiere
VALUES (9, 7, 9);
-- MATHS/PHYSIQUE 2I2D
INSERT INTO professeur
VALUES (8, 'Adam', 'Paul', 10);
INSERT INTO professeur
VALUES (9, 'Périer', 'Valérie', 10);
INSERT INTO liste_matiere
VALUES (10, 8, 10);
INSERT INTO liste_matiere
VALUES (11, 9, 10);

--INSERTION DES HORAIRES--
--  INSERT INTO HORAIRES
-- VALUES 
--INSERT INTO HORAIRES
--VALUES (NULL, datetime('2021-12-24 08:00'), datetime('2021-12-24 22:00'), datetime('2021-12-25 08:00'), datetime('2021-12-25 22:00'), datetime('2021-12-26 08:00'), datetime('2021-12-26 22:00'), 1);




-- GENERATION AUTOMATIQUE APRES --
-- INSERT INTO CRENEAU(id_creneau, id_candidat, id_matiere, id_salle, debut_preparation, fin_preparation, fin)
-- VALUES (NULL, 1, 1, 2, datetime('2021-12-24 09:00'), datetime('2021-12-24 09:30'), datetime('2021-12-24 10:00'));

-- INSERT INTO CRENEAU(id_creneau, id_candidat, id_matiere, id_salle, debut_preparation, fin_preparation, fin)
-- VALUES (NULL, 1, 1, 2, datetime('2021-12-25 09:00'), datetime('2021-12-25 09:30'), datetime('2021-12-25 10:00'));