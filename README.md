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
       n -|        /-----------------\
          |       /                   \
          |      /                     \
          |     /                       \
          |    /                         \
          |   /                           \
       0 -|  /                             \
          |
          +--------+------------------+----+--> t [s]
              |    |                  |    | 
              t0   t1                 t2   t3

Folgende Parameter können konfiguriert werden:
* Attack: Dauer: `(t1 - t0)`; Steigung: `(t1 - t0) / n`
* Sustain: Dauer: `(t2 - t1)`; Steigung: `0`
* Release: Dauer: `(t2 - t3)`; Steigung: `-(t3 - t2) / n`
* `n (Max Anzahl Clients)`

Es wird in der Config eines der Modelle parametriert: 
- plain: konstante Anzahl Requests, gesteuert durch den Parameter `schedule`
- envelope: Wie hier beschrieben mit Attack, Sustain, Release. Dazu werden folgende Parameter benötigt:
  - probes (Anzahl n)
  - attack-time in seconds (t1 - t0)
  - sustain-time in seconds (t2 - t1)
  - release-time in seconds (t3 - t2)