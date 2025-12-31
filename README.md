# Installation

## Installation and Start
```
npm i
npm start
```
Start in debug mode:
>`npm run start:dev`

Start wir a dedicated log level:
>`LOGLEVEL=INFO npm start`

# Umgebungsvariablen
Die Anwendung benötigt zwei Config Files: `httpstatus-config.yaml` (allgemeine Konfiguration) und `httpstatus-hosts-config.yaml` (Konfiguration der Hosts, die gemonitort werden).
In OSCP liegen diese Files als configmaps und nicht innerhalb des Containers. Daher wird hierfpr die Variable `CONFIGPATH` ausgewertet. In diesem Pfad werden die Dateien erwartet

## Lastprofil
Das folgende Lastprofil ist implementiert:


        Anzahl Probes
          ^
          |
          |
          |
       n -|              /-----------------\
          |             /                   \
          |            /                     \
          |           /                       \
          |          /                         \
          |         /                           \
       0 -|   ------                             -----------
          |
          +---+----+-----+-----------------+----+----------+-----> t [s]
              |    |     |                 |    |          |
              t0   t1    t2                t3   t4         t5

Folgende Parameter können konfiguriert werden:
* `(t1 - t0) = delta_0 [s]`
* `(t2 - t1) = delta_1 [s]`
* `(t3 - t2) = delta_2 [s]`
* `(t4 - t3) = delta_3 [s]`
* `(t5 - t4) = delta_4 [s]`
* `n (Max Anzahl Clients)`