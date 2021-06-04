# Impfzentrum Niedersachsen Bookmarklet
[Bookmarklets](https://de.wikipedia.org/wiki/Bookmarklet) für das [Impfportal Niedersachsen](https://www.impfportal-niedersachsen.de/portal/#/appointment/public).

## Erklärung
### Was ist ein Bookmarklet?
[Bookmarklets](https://de.wikipedia.org/wiki/Bookmarklet) sind JavaScript Programme, die auf einer Webseite ausgeführt werden können.

## Installation
### Bookmarklet
#### Desktop Rechner
Den Link in die Browser Favoritenleiste ziehen. Anschließend das Impfportal öffnen und den Link aus der Favoritenleiste aufrufen.

### Graesemonkey
[Greasemonkey](https://www.greasespot.net/)
Ein neues Graesemonkey Benutzerscript erstellen und den Inhalt auf (/src/Js/Bookmarklet.js) reinkopieren.

## Features
### Automatische Suche nach neuen Terminen
Das Formular für die Suche muss geöffnet sein und anschließend kann die automatische Suche gestartet werden, indem der Button ![Button Automatisch Suchen](/doc/img/searchButton.jpg) angeklickt wird
Sobald ein freier Termin gefunden wurde, ertönt eine Sirene, so dass der Benutzer informiert wird und sich für diesen Impftermin anmelden kann.

### Automatisches Formular ausfüllen
Nach der Konfiguration lässt sich dieses Bookmarklet oder Greasemonkey Script auch zum automatischen Ausfüllen des Formulars nutzen.

## Konfiguration
Aktuell kann die Konfiguration nur im Build-Prozess (npm build) oder im Greasemonkey Script durchgeführt werden. Daher stehen dem einfachen Benutzer auch nur wenige Möglichkeiten zur Verfügung.

Die Konfiguration kann in der ``window.bookmarkletconfig``-Variable durchgeführt werden:

| Config                        | Description                                          | Default                                                          |
| ----------------------------- |:----------------------------------------------------:| ----------------------------------------------------------------:|
| siren                         | Pfad zur Sirenen-Datei                               | https://upload.wikimedia.org/wikipedia/commons/4/49/Sirene.ogg   |
| searchIntervalSecondsMin      | Mindestanzahl an Sekunden vor der nächsten Suche     | 1                                                                |
| searchIntervalSecondsMax      | Maximalanzahl an Sekunden vor der nächsten Suche     | 30                                                               |
| autofill                      | Formular automatisch ausfüllen aktiv?                | Nein                                                             |
| autofill_form                 | Formular Werte für das automatische ausfüllen        | Nein                                                             |
| autofill_form.privacy         | Checkbox Datenschutz setzen                          | Ja                                                               |
| autofill_form.birthday        | Geburtsdatum ausfüllen                               | 01.01.1970                                                       |
| autofill_form.prio_work       | Priorität 2                                          | Nein                                                             |
| autofill_form.prio_medical    | Medizinische Priorität                               | Nein                                                             |


## Optimierungen
### Automatisches Ausfüllen des Anmeldeformulars
Die SMS-Verifikation kann nicht so leicht umgangen werden. Aber das darauf folgende Formular lässt sich mit wenig Aufwand ebenfalls automatisch ausfüllen. Hier werden allerdings mehr Test-Daten benötigt.
### Konfigurationserstellung
Die Konfiguration kann aktuell nur im Greasemonkey Script oder im Build Prozess angepasst werden. Für einen normalen Benutzer ist das nicht umsetzbar. Eine einfache HTML/JavaScript-Umgebung sollte ausreichend sein, um die Konfiguration vornehmen zu können.
### Mutation-Oberserver anstatt sleep
Anstatt bei bestimmten Ereignissen auf deren Fertigstellung mit festgelegten Sleep-Werten zu arbeiten, wäre es besser einen MutationOberserver zu nutzen.

### Credits
- Sirene: [Datei](https://de.wikipedia.org/wiki/Datei:Sirene.ogg) von [GeoTrinity](https://commons.wikimedia.org/wiki/User:GeoTrinity)