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
   *
   * @type {{searchIntervalSecondsMax: number, searchIntervalSecondsMin: number, siren: string, autofill_form: {birthday: string, prio_medical: boolean, privacy: boolean, prio_work: boolean}, autofill: boolean}}
   */
  var config = ( window.hasOwnProperty('bookmarkletconfig') ) ? window.bookmarkletconfig : {
    'siren': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Sirene.ogg',
    'searchIntervalSecondsMin': 1,
    'searchIntervalSecondsMax': 30,
    'autofill': false,
    'autofill_form': {
      'privacy': true,            // acknowledge privacy settings
      'birthday': '01.01.1970',   // birthday of single user
      'prio_work': false,         // does a working priority exist?
      'prio_medical': false,      // does a medical priority exist?
    }
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
   *
   * @type {HTMLAudioElement}
   */
  const siren = new Audio(config.siren);

  /**
   * Play the siren sound (must be granted by the user)
   * @return {Promise<void>}
   */
  const playSiren = () => siren.play();

  /**
   * Stop playing the siren
   */
  const muteSiren = () => siren.pause();

  /**
   * Submit the startSearching for new dates form
   *
   * @return {Promise<void>}
   */
  const check = async () => {
    findButtonByText("Suchen").dispatchEvent(clickEvent);
    await sleep(500);
    stopIfFound();
  };

  /**
   * Stop the event
   */
  const stopIfFound = () => {
    if  (!document.getElementsByClassName("centrum")[0].classList.contains("unavailable"))  {
      // stop looking for new events
      stop();
      // Play some music
      playSiren();
      // send an alert message to the user
      alert("Gefunden!!");
    }
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
      div.appendChild( button('ausfüllen', 'autofillButton',() => {
        fill();
        console.log(this);
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
          event.target.innerText = "Sirene pausieren";
        }
        // stop
        else {
          muteSiren();
          event.target.innerText = "Sirene testen";
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

      // check first checkbox: privacy agreement
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
        config.autofill_form.hasOwnProperty('birthday') === false
        || config.autofill_form.birthday === null
        || config.autofill_form.birthday.length === 0
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
        config.autofill_form.hasOwnProperty('prio_work')
        && config.autofill_form.prio_work === true ) {

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
        config.autofill_form.hasOwnProperty('prio_medical')
        && config.autofill_form.prio_medical === true ) {

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

      // Postleitzahl
      elementDispatcher(
        document.getElementById("mat-input-0"),
        el => {
          el.value = 49086;
          el.dispatchEvent(inputEvent);
        },
        "Postleitzahl"
      );

      // start the startSearching process
      startSearching();

    } catch (e) {
      alert("Ein Fehler ist aufgetreten: " + e.message);
    }

  };

  /**
   * Start the startSearching process
   */
  const startSearching = () => {

    // activate stop button
    elementDispatcher(
      document.getElementById('toggleButton'),
      el => el.innerText = 'automatische Suche beenden',
      'toggleButton'
    );

    running = true;

    search();
  };

  /**
   * Search
   * @return {Promise<void>}
   */
  const search = async () => {
    await check();

    if (running === true) {
      await sleep(
        getRandomInt( config.searchIntervalSecondsMin, config.searchIntervalSecondsMax ) * 1000
      );
      await search();
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