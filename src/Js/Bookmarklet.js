// ==UserScript==
// @name            Impfportal Niedersachsen Auto Clicker
// @grant          none
// @version  			 1
// @author         wit
// @match          https://www.impfportal-niedersachsen.de/portal/
// ==/UserScript==

(() => {

  /**
   * Configuration
   * Merge window.bookmarkletconfig into this default configuration
   *
   * @type {{searchIntervalSecondsMax: number, searchIntervalSecondsMin: number, siren: string, autofill_form: {birthday: string, zip: string, lastName: string, prio_medical: boolean, additional: string, privacy: boolean, prio_work: boolean, infoBy: string, firstName: string, housenumber: string, phone: string, street: string, sms: boolean, salutation: string, email: string}, autofill: boolean}}
   */
  const DefaultConfig = {
    'siren': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Sirene.ogg',
    'searchIntervalSecondsMin': 1,
    'searchIntervalSecondsMax': 5,
    'autofill': false,
    'autofill_form': {
      'privacy': true,            // acknowledge privacy settings
      'birthday': '01.01.1970',   // birthday of single user
      'prio_work': false,         // does a working priority exist?
      'prio_medical': false,      // does a medical priority exist?
      'salutation': 'Divers',     // possible values for salutation: Herr/Frau/Divers
      'zip': '',
      'firstName': '',            //
      'lastName': '',             //
      'street': '',               //
      'housenumber': '',          //
      'additional': '',           // additional street address
      'email': '',                // e-mail
      'phone': '',                // phone number
      'infoBy': 'email',          // email or post are possible values
      'sms': false,               // send sms reminder
    },
  };

  /**
   * User defined configuration
   *
   */
  const WindowConfig = (window.hasOwnProperty('bookmarkletconfig')) ? window.bookmarkletconfig : {};

  /**
   * Configuration
   * Merge window.bookmarkletconfig into default configuration
   *
   * @type {{searchIntervalSecondsMax: number, searchIntervalSecondsMin: number, siren: string, autofill_form: {birthday: string, zip: string, lastName: string, prio_medical: boolean, additional: string, privacy: boolean, prio_work: boolean, infoBy: string, firstName: string, housenumber: string, phone: string, street: string, sms: boolean, salutation: string, email: string}, autofill: boolean}}
   */
  const config = {
    ...DefaultConfig,
    ...WindowConfig
  };
  if ( WindowConfig.hasOwnProperty('autofill_form') ) {
    config.autofill_form = {
      ...DefaultConfig.autofill_form,
      ...WindowConfig.autofill_form
    };
  }

  /**
   * Map Label Content to input
   *
   * @type {{zip: string, infoByEmail: string, lastName: string, infoByPost: string, additional: string, houseNumber: string, emailRepeat: string, firstName: string, phone: string, street: string, sms: string, salutation: string, email: string}}
   */
  const Mapping = {
    phone: 'Telefon',
    zip: '',
    salutation: '',
    firstName: '',
    lastName: '',
    street: '',
    houseNumber: '',
    additional: '',
    email: '',
    emailRepeat: '',
    infoByEmail: '',
    infoByPost: '',
    sms: '',
  };

  /**
   * Temporary holding the interval value
   * @type {number|null}
   */
  let myInterval = null;


  /**
   * @type {boolean}
   */
  window.loaded = ( window.hasOwnProperty('loaded') ) ? window.loaded : false;

  /**
   * @type {boolean}
   */
  let running = false;

  /* ********************************************************************************************************************
  * HTML Events
  /* ********************************************************************************************************************
  */
  /**
   * Click Event
   * @type {Event}
   */
  const clickEvent = document.createEvent("HTMLEvents");

  /**
   * Change Event
   * @type {Event}
   */
  const changeEvent = document.createEvent("HTMLEvents");
  changeEvent.initEvent("change", true, false)

  /**
   * Input Event
   * @type {Event}
   */
  const inputEvent = document.createEvent("HTMLEvents");
  inputEvent.initEvent("input", true, false)

  /**
   * Submit Event
   * @type {Event}
   */
  const submitEvent = document.createEvent("HTMLEvents");
  submitEvent.initEvent("submit", true, false)


  /**
   * Find an element by the given text and HTML-Type
   *
   * @param {string} text
   * @param {string} type
   * @return {HTMLElement|null}
   */
  const findElementByText = (text, type) =>
    [...document.querySelectorAll(type)]
      .find(element => element.textContent.includes(text))
  ;

  /**
   *
   * @param {string} label
   * @return {HTMLInputElement}
   */
  const findInputByLabel = (label) =>
    findElementByText(label, "span")
      .closest(".mat-form-field-infix").querySelector('input')
  ;

  /**
   * Find a link with the given text
   *
   * @param {string} text
   * @return {*}
   */
  const findLinkByText = text => findElementByText(text, "a");

  /**
   * Find a Button with the given Text
   *
   * @param {string} text
   * @return {*}
   */
  const findButtonByText = text => findElementByText(text, "button");

  /**
   * Find a Birthday Picker, which is currently visible
   *
   * @return {HTMLElement|null}
   */
  const findBirthdayButton = () =>
    [...document.querySelectorAll("mat-datepicker-toggle")]
      .find(element =>  element.offsetWidth > 0 && element.offsetHeight > 0 )

  /**
   * is the given element currently visible?
   *
   * @param element
   * @return {boolean}
   */
  const isHtmlElementVisible = element => typeof element !== 'undefined' && element !== null && element.offsetWidth > 0 && element.offsetHeight > 0;

  /**
   *
   * @return {HTMLElement|null}
   */
  const findMonthSwitchButton = () => document.querySelector('.calendar .mat-focus-indicator:not(.mat-button-disabled)');

  /**
   *
   * @type {HTMLAudioElement}
   */
  const siren = new Audio(config.siren);

  /**
   * Play the siren sound (must be granted by the user)
   * @return {Promise<void>}
   */
  const playSiren = () => {
    siren.play();
    document.getElementById('sirenToggleButton').innerText = "Sirene pausieren";
  }

  /**
   * Stop playing the siren
   */
  const muteSiren = () => {
    siren.pause();
    document.getElementById('sirenToggleButton').innerText = "Sirene testen";
  }

  /**
   * Submit the startSearching for new dates form
   *
   * @return {Promise<void>}
   */
  const checkPageZip = async () => {

    if ( stopIfFoundOnPageZip() === false ) {
      elementDispatcher(
        findButtonByText("Suchen"),
        async button => {
          button.dispatchEvent(clickEvent);
          await sleep(500);
          stopIfFoundOnPageZip();
        },
        "Impfstoff Suchen Button nicht gefunden"
      );
    }

  };
  /**
   * Submit the startSearching for new dates form
   *
   * @return {Promise<void>}
   */
  const checkPageDates = async () => {

    if ( stopIfFoundOnDates() === false ) {
      elementDispatcher(
        findMonthSwitchButton(),
        async button => {
          button.click();
          await sleep(500);
          stopIfFoundOnDates();
        },
        "Monatswechsel Button nicht gefunden"
      );
    }

  };

  /**
   * Stop the event
   */
  const stopIfFoundOnPageZip = () => {

    if  (!document.getElementsByClassName("centrum")[0].classList.contains("unavailable"))  {
      startFoundProcedure();
      return true;
    }

    return false;
  }

  /**
   * Stop the event
   */
  const stopIfFoundOnDates = () => {

    if  (document.querySelectorAll('.dayfree').length > 0)  {
      startFoundProcedure();
      return true;
    }

    return false;
  }

  /**
   * Initialize the found procedure (play the siren, stop searching, alert user)
   */
  const startFoundProcedure = () => {
    // stop looking for new events
    stop();
    // Play some music
    playSiren();
    // send an alert message to the user
    alert("Gefunden!");
  }

  /**
   * Stop the startSearching interval
   */
  const stop = () => {
    clearInterval(myInterval);

    // activate stop button
    elementDispatcher(
      document.getElementById('toggleButton'),
      el => el.innerText = 'automatische Suche starten',
      'toggleButton'
    );

    running = false;

  };
  clickEvent.initEvent("click", true, false)

  /**
   * if element is given, call callback. Otherwise throw an error
   * @param {HTMLElement} element
   * @param {function} callback
   * @param {string} title
   */
  const elementDispatcher = (element, callback, title) => {
    if ( typeof element !== "undefined" && element !== null) {
      callback(element);
    } else {
      throw new Error("Element " + title + " nicht gefunden! Script bricht nun ab.");
    }
  }

  /**
   * Proceed to next page
   */
  const nextPage = () => {
    elementDispatcher(
      findButtonByText("Weiter"),
      el => el.dispatchEvent(clickEvent),
      "Weiter zur nächsten Seite"
    );
  }


  /**
   * Create new button
   *
   * @param {string} text
   * @param {string} text
   * @param {string} id
   * @param {function} clickCallback
   * @return {HTMLAnchorElement}
   */
  const button = (text, id, clickCallback) => {

    // Create Element
    let el = document.createElement('a');
    el.textContent = text;
    el.className = 'mat-focus-indicator mat-raised-button mat-button-base mat-primary';
    el.style.marginRight = '10px';
    el.id = id;

    // add click Event
    el.addEventListener('click', clickCallback);

    return el;
  };

  /**
   * Sleep for some milliseconds
   *
   * @param {number} ms
   * @return {Promise<unknown>}
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * create all event buttons
   *
   * @return {HTMLDivElement}
   */
  const buttons = () => {

    // create wrapper element
    let div = document.createElement('div');

    if ( config.autofill === true ) {

      // autofill the form with data
      div.appendChild( button('Formular ausfüllen', 'autofillButton',() => {
        fill();
      }));

    }

    // start startSearching process
    div.appendChild( button('automatisch suchen','toggleButton', () => {

      // startSearching
      if ( running === true ) {
        stop();
      }
      // stop
      else {
        startSearching();
      }

    }) );

    // toggle siren playing
    div.appendChild( button('Sirene testen','sirenToggleButton',
      /**
       *
       * @param {MouseEvent} event
       */
      (event) => {

        // Sirene gestoppt?
        if ( siren.paused === true ) {
          playSiren();
        }
        // stop
        else {
          muteSiren();
        }

      }) );


    return div;
  };


  /**
   * Run the proce
   */
  const fill = async () => {

    try {

      // Privacy acknowledged?
      if ( config.autofill_form.privacy !== true ) {
        return;
      }

      // checkPageZip first checkbox: privacy agreement
      elementDispatcher(
        document.getElementById("mat-checkbox-1-input"),
        el => el.dispatchEvent(clickEvent),
        "Datenschutzerklärung"
      );

      // submit first page
      nextPage();

      // submit second page
      nextPage();

      if (
        config.autofill_form.birthday.length === 0
      ) {
        return;
      }

      // birthday Button
      elementDispatcher(
        findBirthdayButton(),
        el => el.dispatchEvent(clickEvent),
        "Geburtstagsauswahl Button"
      );

      elementDispatcher(
        document.getElementsByClassName("mat-calendar-body-cell-content")[0],
        el => el.dispatchEvent(clickEvent),
        "Beliebiges Geburtstags Datum gewählt"
      );

      elementDispatcher(
        document.getElementById("mat-input-2"),
        el => el.value = config.autofill_form.birthday,
        "Geburtstags Datum"
      );

      // weiter
      nextPage();

      // Prio 3: work
      if (
        config.autofill_form.prio_work === true
      ) {

        // mark radio
        elementDispatcher(
          document.getElementById("mat-radio-2-input"),
          el => el.dispatchEvent(changeEvent),
          "Berufliche Berechtigungsgruppe"
        );

        await sleep(500);

        // Verstanden
        elementDispatcher(
          findButtonByText("Verstanden"),
          el => el.dispatchEvent(clickEvent),
          "Medizinisch berechtigt => Verstanden"
        );

      }

      // weiter
      nextPage();

      // Prio 2:
      if (
        config.autofill_form.prio_medical === true
      ) {

        // Medizinisch berechtigt
        elementDispatcher(
          document.getElementById("mat-radio-9-input"),
          el => el.dispatchEvent(changeEvent),
          "Medizinisch berechtigt"
        );

        await sleep(500);

        // Verstanden
        elementDispatcher(
          findButtonByText("Verstanden"),
          el => el.dispatchEvent(clickEvent),
          "Medizinisch berechtigt => Verstanden"
        );

        // Medizinisch berechtigt
        elementDispatcher(
          document.getElementById("mat-radio-12-input"),
          el => el.dispatchEvent(changeEvent),
          "Medizinisch berechtigt 2"
        );

      }

      // weiter
      nextPage();

      // weiter
      nextPage();

     // Zip entry
     if ( config.autofill_form.zip.length > 0 ) {

       // Postleitzahl
       elementDispatcher(
         document.getElementById("mat-input-0"),
         el => {
           el.value = config.autofill_form.zip;
           el.dispatchEvent(inputEvent);
         },
         "Postleitzahl"
       );

       // start the startSearching process
       startSearching();

       fillPersonal().then(r => console.log(r));

     }

    } catch (e) {
      alert("Ein Fehler ist aufgetreten: " + e.message);
    }

  };

  /**
   * fill the personal form with data
   */
  const fillPersonal = async () => {

    try {

      // fill phone number
      if ( config.autofill_form.phone.length > 0 ) {
        elementDispatcher(
          document.getElementById('mat-input-1'),
          el => {
            el.value = config.autofill_form.phone;
            el.dispatchEvent(inputEvent);
          },
          'Telefonnummer'
        );
      }

      // fill salutation
      if ( config.autofill_form.salutation.length > 0 ) {
        // Salutation click
        elementDispatcher(
          document.getElementById('mat-select-2'),
          el => el.dispatchEvent(clickEvent),
          'Anrede Button'
        );

        // wait until the dropdown is open
        await sleep(500);

        // Salutation Value
        elementDispatcher(
          findElementByText(config.autofill_form.salutation, 'span.mat-option-text'),
          el => el.dispatchEvent(clickEvent),
          'Anrede ' + config.autofill_form.salutation
        );

        // wait until the dropdown is open
        await sleep(500);

      }

      // Firstname
      if ( config.autofill_form.firstName.length > 0 ) {
        elementDispatcher(
          document.getElementById("mat-input-8"),
          el => {
            el.value = config.autofill_form.firstName;
            el.dispatchEvent(inputEvent);
          },
          "Vorname"
        );
      }

      // Nachname
      if ( config.autofill_form.lastName.length > 0 ) {
        elementDispatcher(
          document.getElementById("mat-input-9"),
          el => {
            el.value = config.autofill_form.lastName;
            el.dispatchEvent(inputEvent);
          },
          "Nachname"
        );
      }

      // Straße
      if ( config.autofill_form.street.length > 0 ) {
        elementDispatcher(
          document.getElementById("mat-input-21"),
          el => {
            el.value = config.autofill_form.street;
            el.dispatchEvent(submitEvent);
          },
          "Straße"
        );
      }

      // Hausnummer
      if ( config.autofill_form.housenumber.length > 0 ) {
        elementDispatcher(
          document.getElementById("mat-input-11"),
          el => {
            el.value = config.autofill_form.housenumber;
            el.dispatchEvent(inputEvent);
          },
          "Hausnummer"
        );
      }

      // Adresszusatz
      if ( config.autofill_form.additional.length > 0 ) {
        elementDispatcher(
          document.getElementById("mat-input-12"),
          el => {
            el.value = config.autofill_form.additional;
            el.dispatchEvent(inputEvent);
          },
          "Adresszusatz"
        );
      }

      if ( config.autofill_form.email ) {

        elementDispatcher(
          document.getElementById('mat-input-15'),
          el => {
            el.value = config.autofill_form.email;
            el.dispatchEvent(inputEvent);
          },
          "E-Mail-Adresse"
        );

        elementDispatcher(
          document.getElementById('mat-input-19'),
          el => {
            el.value = config.autofill_form.email;
            el.dispatchEvent(inputEvent);
          },
          "E-Mail-Adresse Bestätigung"
        )

      }

      // E-mail confirmation
      if ( config.autofill_form.infoBy === "email" ) {
        elementDispatcher(
          document.getElementById("mat-radio-15"),
          el => el.dispatchEvent(clickEvent),
          "E-Mail Bestätigung"
        );
      }
      // postal confirmation
      else if ( config.autofill_form.infoBy === "post" ) {
        elementDispatcher(
          document.getElementById("mat-radio-16"),
          el => el.dispatchEvent(clickEvent),
          "Briefbestätigung"
        );
      }

      // SMS reminder
      if ( config.autofill_form.sms ) {
        elementDispatcher(
          document.getElementById("mat-checkbox-2"),
          el => el.checked = "checked",
          "SMS-Erinnerung"
        );
      }

    } catch (e) {
      alert("Ein Fehler ist aufgetreten: " + e.message);
    }

  };

  /**
   * Start the startSearching process
   */
  const startSearching = () => {

    // current page
    if ( isHtmlElementVisible(findButtonByText("Suchen")) ) {
      searchOnPageZip();
    }
    else if ( isHtmlElementVisible( findMonthSwitchButton() ) ) {
      searchOnPageDates();
    }
    else {
      alert("Falsche Seite! Bitte auf die Postleitzahl oder Terminauswahl Seite gehen");
      return;
    }

    // activate stop button
    elementDispatcher(
      document.getElementById('toggleButton'),
      el => el.innerText = 'automatische Suche beenden',
      'toggleButton'
    );

    running = true;

  };

  /**
   * Search on page zip
   * @return {Promise<void>}
   */
  const searchOnPageZip = async () => {
    await checkPageZip();

    if (running === true) {
      await sleep(
        getRandomInt( config.searchIntervalSecondsMin, config.searchIntervalSecondsMax ) * 1000
      );
      await searchOnPageZip();
    }
  }

  /**
   * Search on Page dates
   * @return {Promise<void>}
   */
  const searchOnPageDates = async () => {
    await checkPageDates();

    if (running === true) {
      await sleep(
        getRandomInt( config.searchIntervalSecondsMin, config.searchIntervalSecondsMax ) * 1000
      );
      await searchOnPageDates();
    }
  }

  /**
   * Returns a random Integer
   * @param {number} min
   * @param {number} max
   * @return {number}
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   */
  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }


  /**
   *
   */
  const init = () => {

    try {

      // multiple inits?
      if ( window.loaded === true ) {
        throw new Error("Bookmarklet bereits geladen!");
      }

      // Set menu buttons
      elementDispatcher(
        document.getElementsByTagName('mat-toolbar'),
        el => {
          elementDispatcher(
            el[0].children[0],
            inner => inner.appendChild(buttons()),
            "toolbar content"
          );
        },
        "Toolbar"
      );

      window.loaded = true;

    } catch (e) {
      alert("Ein Fehler ist aufgetreten: " + e.message);
    }
  };

  // wait for dom load complete
  if(document.readyState === "complete") {
    init();
  } else {
    // if dom is not loaded, wait for load event
    window.addEventListener("load", () => {
      init();
    });
  }

})();