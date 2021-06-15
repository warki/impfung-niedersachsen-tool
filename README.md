# Impfportal Niedersachsen Bookmarklet und Greasemonkey Script
[Bookmarklets](https://de.wikipedia.org/wiki/Bookmarklet) für das [Impfportal Niedersachsen](https://www.impfportal-niedersachsen.de/portal/#/appointment/public), um nicht mehr selbst nach neuen Terminen suchen zu müssen. 
Das Tool überprüft automatisch alle paar Sekunden, ob ein neuer Impftermin freigeworden ist und löst bei Erfolg ein Sirenen Geräusch aus. Anschließend kann der Termin vom Benutzer gebucht werden.
So kann man die Suche in einem Browser-Tab im Hintergrund offen lassen und muss nur noch auf die Sirene warten.

## Erklärung
### Was ist ein Bookmarklet?
[Bookmarklets](https://de.wikipedia.org/wiki/Bookmarklet) sind JavaScript Programme, die auf einer Webseite ausgeführt werden können.

## Anleitung
1. Installation durchführen (siehe Installation)
2. [Impfportal Niedersachsen](https://www.impfportal-niedersachsen.de/portal/#/appointment/public) aufrufen
3. Das Bookmarklet starten (siehe Installation)
4. Das Formular auf dem Impfportal manuell ausfüllen (falls im Bookmarklet konfiguriert, dann kann das Ausfüllen auch automatisch erfolgen)
5. Seite mit der Eingabe der Postleitzahl aufrufen, Postleitzahl eintragen und nun die "automatische Suche starten", indem der Button "automatische Suche starten" angeklickt wird
6. Sobald nun ein freier Impfstoff gefunden wurde, ertönt eine Sirene
7. Nun den Impfstoff auswählen
8. legitimieren über SMS/Telefon
9. Persönliche Daten eingeben
10. Termin aus dem Kalender auswählen
    Sollten in diesem Kalender keine freien Termine angezeigt werden (ein Datum mit freien Terminen ist grün markiert), kann auch hier die automatische Suche gestartet werden. Diese wechselt zwischen den Monaten hin und her und aktualisiert so die freien Termine. 
    Sobald dann ein Termin gefunden wurde, ertönt die gleiche Sirene


## Installation
### Bookmarklet
#### Desktop Rechner
[Installations-Seite öffnen](https://warki.github.io/impfung-niedersachsen-tool/).
Den Link in die Browser Favoritenleiste ziehen. Anschließend das Impfportal öffnen und den Link aus der Favoritenleiste aufrufen.

#### Browser Konsole auf Desktop Rechnern
Den Quellcode aus der [Bookmarklet.js-Datei](src/Js/Bookmarklet.js) in die Browser Konsole (meistens F12) kopieren. Hier ist auch eine Anpassung der Parameter möglich.

### Greasemonkey
[Greasemonkey](https://www.greasespot.net/)
Ein neues Greasemonkey Benutzerscript erstellen und den Inhalt aus [Bookmarklet.js-Datei](src/Js/Bookmarklet.js) reinkopieren.

## Features
### Automatische Suche nach freien Impfstoffen
Das Formular für die Suche muss geöffnet sein und anschließend kann die automatische Suche gestartet werden, indem der Button ![Button Automatisch Suchen](/doc/img/searchButton.jpg) angeklickt wird.
Sobald ein freier Termin gefunden wurde, ertönt eine Sirene, sodass der Benutzer informiert wird und sich für diesen Impftermin anmelden kann.

### Automatische Suche nach freien Terminen des gewählten Impfstoffs
Leider reicht für die meisten die Zeit zwischen gefundenem Impfstoff, anschließende Validierung und Termin bestätigen nicht aus. Diese Personen sehen keine freien Termine im Kalender.
Daher kann die Suche bei der Terminauswahl ebenfalls automatisch erfolgen. Hierzu den Button "automatische Suche starten" erneut anklicken, wenn die Termin Seite sichtbar ist.
Sobald ein freier Termin gefunden wurde, ertönt eine Sirene, sodass der Benutzer informiert wird und sich für diesen Impftermin anmelden kann.


### Automatisches Formular ausfüllen
Nach der Konfiguration lässt sich dieses Bookmarklet oder Greasemonkey Script auch zum automatischen Ausfüllen des Formulars nutzen.

## Konfiguration
Die Konfiguration kann in einer ``window.bookmarkletconfig``-Variable, im Build-Prozess (npm build) oder im Greasemonkey Script durchgeführt werden. 
Daher stehen dem einfachen Benutzer auch nur wenige Möglichkeiten zur Verfügung.

| Config                        | Description                                               | Default                                                          |
| ----------------------------- |:---------------------------------------------------------:| ----------------------------------------------------------------:|
| siren                         | Pfad zur Sirenen-Datei                                    | https://upload.wikimedia.org/wikipedia/commons/4/49/Sirene.ogg   |
| searchIntervalSecondsMin      | Mindestanzahl an Sekunden vor der nächsten Suche          | 1                                                                |
| searchIntervalSecondsMax      | Maximalanzahl an Sekunden vor der nächsten Suche          | 30                                                               |
| autofill                      | Formular automatisch ausfüllen aktiv?                     | Nein                                                             |
| autofill_form                 | Formular Werte für das automatische ausfüllen             | Nein                                                             |
| autofill_form.privacy         | Checkbox Datenschutz setzen                               | Ja                                                               |
| autofill_form.birthday        | Geburtsdatum ausfüllen                                    | 01.01.1970                                                       |
| autofill_form.prio_work       | Priorität 2                                               | Nein                                                             |
| autofill_form.prio_medical    | Medizinische Priorität                                    | Nein                                                             |
| autofill_form.salutation      | Anrede (mögliche Werte: Herr/Frau/Divers)                 | Divers                                                           |
| autofill_form.firstName       | Vorname                                                   |                                                                  |
| autofill_form.lastName        | Nachname                                                  |                                                                  |
| autofill_form.zip             | Postleitzahl                                              |                                                                  |
| autofill_form.street          | Straße                                                    |                                                                  |
| autofill_form.housenumber     | Hausnummer                                                |                                                                  |
| autofill_form.additional      | Weitere Anschriftdaten                                    |                                                                  |
| autofill_form.email           | E-Mail Adresse                                            |                                                                  |
| autofill_form.phone           | Telefonnummer (nötig fürs CAPTCHA)                        |                                                                  |
| autofill_form.infoBy          | Wie soll die Bestätigung verschickt werden? (email/post)  |                                                                  |
| autofill_form.sms             | SMS-Erinnerung                                            |                                                                  |

Die Konfiguration muss vor dem Start des Bookmarklets in der ``window.bookmarkletconfig``-Variable durchgeführt werden:

```javascript
window.bookmarkletconfig = {
    'siren': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Sirene.ogg',
    'searchIntervalSecondsMin': 1,
    'searchIntervalSecondsMax': 1,
    'autofill': true,
    'autofill_form': {
      'privacy': true,              // Datenschutz akzeptiert
      'birthday': '02.01.1970',     // Geburtsdatum
      'prio_work': false,           // Prio Arbeit
      'prio_medical': false,        // Prio medizinisch
      'salutation': 'Divers',       // Anrede: Auswahl aus Herr/Frau/Divers
      'firstName': 'Max',           // Vorname
      'lastName': 'Musterman',      // Nachname
      'street': 'Bergstraße',       // Straße
      'zip': '12345',               // Postleitzahl 
      'housenumber': '1',           // Hausummer
      'additional': '',             // Weitere Anschriftdaten
      'email': 'info@exmaple.tld',  // E-Mail-Adresse
      'phone': '0123456789',        // Handynummer 
      'infoBy': 'email',            // Bestätigung verschicken per E-Mail (Wert: email) oder Post (Wert: post)
      'sms': false,                 // SMS-Benachrichtigung verschicken? (Werte: true|false)
    }
};
```

## Optimierungen
### Konfigurationserstellung
Die Konfiguration kann aktuell nur im Greasemonkey Script oder im Build Prozess angepasst werden. Für einen normalen Benutzer ist das nicht umsetzbar. Eine einfache HTML/JavaScript-Umgebung sollte ausreichend sein, um die Konfiguration vornehmen zu können.
### Mutation-Oberserver anstatt sleep
Anstatt bei bestimmten Ereignissen auf deren Fertigstellung mit festgelegten Sleep-Werten zu arbeiten, wäre es besser einen MutationOberserver zu nutzen.
### AudioPromise überprüfen
Es sollte überprüft werden, ob eine Audiodatei automatisiert abgespielt werden kann. Vorher keinen Suchdurchlauf starten.
### Anleitungen
Eine einfache Benutzeranleitung für Desktop oder Mobile Browser erstellen.

### Missbrauch
Um die dahinter liegende API nicht zu überbeanspruchen, bitte die Abrufintervalle in einem vernünftigen Maß halten. 
Ebenso möchte ich explizit keinen Captcha-Solver oder ähnliches einbauen, damit die Buchung der Termine nicht vollautomatisiert stattfinden kann. 

### Credits
- Sirene: [Datei](https://de.wikipedia.org/wiki/Datei:Sirene.ogg) von [GeoTrinity](https://commons.wikimedia.org/wiki/User:GeoTrinity) unter [Creative-Commons Namensnennung - Weitergabe unter gleichen Bedingungen 3.0 nicht portierbar](https://creativecommons.org/licenses/by-sa/3.0/deed.de) lizensiert.