# Installation
## nvm (node, npm)
Zur Installation von `node` und `npm` installiert man am besten `nvm`:

see [https://github.com/nvm-sh/nvm]
> `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash`

or 

> `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash`

Ist `nvm` lauffähig, kann eine Version von node installiert werden:
> `nvm ls-remote`

listet alle verfügbaren Versionen auf

> `nvm install 12`

installiert die latest (stable) Version von nodejs: `v12.19.0   (Latest LTS: Erbium)`

## Typescript
Installation:
> `npm i -g typescript`

## Konfiguration und bauen
Um mit `npm start` die Anwendung zu starten, sollte vorher die config.yaml angepasst werden (Dokumentationsiehe `config/config-sample.yaml`).

Zum Bauen zuerst `npm install` und dann  `npm run build` aufrufen. Im Erfolgsfall wird ein Verzeichnis /build angelegt, in dem die compilierten JavaScript-Dateien liegen.

Nun kann `npm start` zum Start der Applikation verwendet werden.

Während der Entwicklungszeit kann `npm run start:dev` verwendet werden (nodemon)


## Docker
Das Docker-File kann genutzt werden, um ein Image zu bauen. Der Server wird auf Port: 28090 gebunden.

# Umgebungsvariablen
Die Anwendung ben�tigt zwei Config Files: `httpstatus-config.yaml` (allgemeine Konfiguration) und `httpstatus-hosts-config.yaml` (Konfiguration der Hosts, die gemonitort werden).
In OSCP liegen diese Files als configmaps und nicht innerhalb des Containers. Daher wird hierfpr die Variable `CONFIGPATH` ausgewertet. In diesem Pfad werden die Dateien erwartet