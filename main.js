/******************POKAZ/USUN***************************************************/
var addElement = (function () {
    //ukryj panel body
    document.querySelector('.aktywnosc .panel-body').style.display = 'none';
    document.querySelector('.posilki .panel-body').style.display = 'none';
    //dodaj akcje
    var addContent = document.getElementsByClassName('add-content');
    for (var i = 0; i < addContent.length; i++) {
        addContent[i].addEventListener('click', function () {
            this.parentElement.nextElementSibling.style.display = 'block';
            var removeContent = this.nextElementSibling
            removeContent.style.display = 'block';
            removeContent.addEventListener('click', function () {
                this.parentElement.nextElementSibling.style.display = 'none';
                this.previousElementSibling.style.display = 'block';
                this.style.display = 'none';
            });
            this.style.display = 'none';
        });
    }
}());

/******************WYSZUKIWANIE I DODAWANIE PRODUKTÓW*******************************
 ***********************************************************************************/
var promisePosilki = new Promise(
    function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'produkty.json', true);
        xhr.addEventListener('load', function () {
            return resolve(xhr.responseText);
        });
        xhr.addEventListener('error', function () {
            return reject(xhr.statusText);
        });
        xhr.send();
    }
);

/***********Obsługa wyszukiwarki*******************/

//tworzene dynamicznych podpowiedzi
function hintService() {
    promisePosilki
        .then(function (data) {
            document.getElementById('search-output').innerHTML = "" //czyści output po każdym zdarzeniu
            var produktyObj = JSON.parse(data);
            var dataLocation = produktyObj[2].data;
            var searchInput = document.getElementById('search').value.toUpperCase(); //Wartosc z pola input z wielkich liter
            var searchContent = document.getElementById('search-content'); //Punkt docelowy
            searchContent.innerHTML = "" //czyśli content za każdym zdarzeniem 
            //filter
            for (var i = 0; i < dataLocation.length; i++) { //robi iteracje po wszystkich elementach 
                var productName = dataLocation[i].nazwa_produktu.toUpperCase();
                if (productName.indexOf(searchInput) > -1) {
                    var optionEl = document.createElement('option');
                    optionEl.className = 'hint';
                    var txtNode = document.createTextNode(dataLocation[i].nazwa_produktu);
                    optionEl.appendChild(txtNode);
                    searchContent.appendChild(optionEl);
                }
                if (searchInput.length === 0) {
                    searchContent.innerHTML = "";
                }
            }
            //wyświetl tylko maksymalnie 10 podpowiedzi
            function showHint() {
                var hintNode = document.getElementsByClassName('hint');
                if (hintNode.length == 0) {
                    return false;
                } else {
                    for (var i = 0; i < hintNode.length; i++) {
                        hintNode[i].style.display = 'none'; //Domyslnie nie wyswietlaj podpowiedzi    
                    }
                    for (var i = 0; i < 10; i++) {
                        hintNode[i].style.display = 'block'; //Pokaż tylko max 10 pierwszych podpowiedzi
                    }
                }
            }
            showHint();
        })
        .catch(function (error) {
            console.log(error);
        });
}

//wywolanie podpowiedzi po zdarzeniu keyup
document.getElementById('search').addEventListener('keyup', function () {
    hintService();
});

//wyszukiwanie produktu    
function searchFunction() {
    promisePosilki
        .then(function (data) {
            var produktyObj = JSON.parse(data);
            var dataLocation = produktyObj[2].data;
            var searchInput = document.getElementById('search').value.toUpperCase(); //Wartosc z pola input z dodana opcja wielkich liter
            var output = document.getElementById('search-output');
            output.innerHTML = "" //czyśli content za każdym zdarzeniem
            document.getElementById('search-content').innerHTML = "";

            for (var i = 0; i < dataLocation.length; i++) {
                var nazwa = dataLocation[i].nazwa_produktu.toUpperCase();

                if (nazwa.indexOf(searchInput) > -1) {
                    var el = document.createElement('tr');
                    el.innerHTML = '<th>' + dataLocation[i].nazwa_produktu + '</th><th>' + dataLocation[i].typ + '</th><th>' + dataLocation[i].wartosc_kalorii + '</th><th><input class="ile" type="text"/></th><th><button class="btn btn-success add-button" type="button">Dodaj do listy</button></th>';
                    output.appendChild(el);
                }
                if (searchInput.length === 0) {
                    output.innerHTML = "";
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });
};

//zdarzenie wyszukiwania dla przycisku szukaj
document.getElementById('search-button').addEventListener('click', function () {
    searchFunction();
});

//blokuje zdarzenie wyszukiwania dla wcisnięcia enter w wyszukiwarce
document.getElementById('search').addEventListener('keypress', function (event) {
    if (event.keyCode === 10 || event.keyCode === 13) {
        event.preventDefault();
    }


});

//zdarzenie wyszukiwania dla kliknięcia w podpowiedż
document.getElementById('search-content').addEventListener('click', function (event) {
    if (event.target.className === 'hint') {
        promisePosilki
            .then(function (data) {
                var produktyObj = JSON.parse(data);
                var dataLocation = produktyObj[2].data;
                var hintValue = event.target.value.toUpperCase(); //Wartosc z pola option z hints z dodana opcja wielkich liter
                var output = document.getElementById('search-output');
                output.innerHTML = "" //czyśli content za każdym zdarzeniem
                document.getElementById('search-content').innerHTML = ""; //czyści podpowiedzi za każdym zdarzeniem    
                for (var i = 0; i < dataLocation.length; i++) {
                    var nazwa = dataLocation[i].nazwa_produktu.toUpperCase();
                    if (hintValue == nazwa) {
                        var el = document.createElement('tr');
                        el.innerHTML = '<th>' + dataLocation[i].nazwa_produktu + '</th><th>' + dataLocation[i].typ + '</th><th>' + dataLocation[i].wartosc_kalorii + '</th><th><input class="ile" type="text"/><span class="glyphicon glyphicon-exclamation-sign"></span></th><th><button class="btn btn-success add-button" type="button">Dodaj do listy</button></th>';
                        output.appendChild(el);
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
});

/***********Obsługa dodawania produktów*************/

//Dodanie przedmiotu do listy
document.addEventListener('click', function (event) {
    var tar = document.getElementsByClassName('add-button');
    for (var i = 0; i < tar.length; i++) {
        if (event.button == 0 && event.target == tar[i]) { //Jezeli jest klikniecie lewym przyciskiem myszy
            promisePosilki
                .then(function (data) {
                    //Zmienne globalne
                    var nameValue = event.target.parentNode.parentNode.firstChild.textContent;
                    var produktyObj = JSON.parse(data);
                    var dataLocation = produktyObj[2].data;
                    var ileGram = event.target.parentNode.previousSibling.firstChild;
                    
                    //przerwanie dzialania skryptu w chwili, gdy pole 'ile' jest zle wypelnione
                    var parametrAttribute = ileGram.getAttribute('status');
                    if (parametrAttribute == 'invalid') {
                        bladWalidacji();
                        return false;
                    }
                    
                    //wstawianie wartości do tabeli
                    var output = document.getElementById('selected-items'); //output node
                    var el = document.createElement('div');
                    el.className = 'col-md-12 food-item';
                    el.innerHTML = '<div><img class="img-link"/></div><div><div class="item-title"><p>Nazwa produktu</p></div><p class="naz"></p></div><div><div class="item-title"><p>Kalorie</p></div><input class="sum-cal" disabled/></div><div><div class="item-title"><p>Węglowodany</p></div><input class="sum-weg" disabled></div><div><div class="item-title"><p>Białko</p></div><input class="sum-bia" disabled></div><div><div class="item-title"><p>Tłuszcze</p></div><input class="sum-tlu" disabled></div><div><div class="item-title"><p>Usuń</p></div><button class="btn btn-danger item-remove"><span class="glyphicon glyphicon-remove"></span></button></div>';
                    output.appendChild(el);

                    for (var j = 0; j < dataLocation.length; j++) {
                        var name = dataLocation[j].nazwa_produktu;
                        //zlicza wartości i dodaje do tabel
                        if (name == nameValue) {
                            var naz = dataLocation[j].nazwa_produktu
                            var lin = dataLocation[j].link
                            var kal = dataLocation[j].wartosc_kalorii
                            var weg = dataLocation[j].weglowodany
                            var bia = dataLocation[j].bialko
                            var tlu = dataLocation[j].tluszcze
                            kal = Math.round(kal / 100 * ileGram.value);
                            weg = Math.round(weg / 100 * ileGram.value);
                            bia = Math.round(bia / 100 * ileGram.value);
                            tlu = Math.round(tlu / 100 * ileGram.value);
                            var nazNode = document.getElementsByClassName('naz');
                            var linNode = document.getElementsByClassName('img-link');
                            var kalNode = document.getElementsByClassName('sum-cal');
                            var wegNode = document.getElementsByClassName('sum-weg');
                            var biaNode = document.getElementsByClassName('sum-bia');
                            var tluNode = document.getElementsByClassName('sum-tlu');
                            for (var k = 0; k < wegNode.length; k++) {
                                nazNode[k].textContent = naz;
                                nazNode[k].className = 'naz-done';
                                linNode[k].src = lin;
                                linNode[k].className = 'media-object img-responsive img-link-done';
                                kalNode[k].value = kal;
                                kalNode[k].className = 'sum-kal-done';
                                wegNode[k].value = weg;
                                wegNode[k].className = 'sum-weg-done';
                                biaNode[k].value = bia;
                                biaNode[k].className = 'sum-bia-done';
                                tluNode[k].value = tlu;
                                tluNode[k].className = 'sum-tlu-done';
                            }
                        }
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }
});

//Usunięcie przedmiotu z listy
document.addEventListener('click', function (event) {
    var tar = document.getElementsByClassName('item-remove');
    for (var i = 0; i < tar.length; i++) {
        if (event.button == 0 && event.target == tar[i]) {
            var el = event.target
            el.parentNode.parentNode.parentNode.removeChild(el.parentNode.parentNode);
        }
    }
});



/***************************DODAWANIE AKTYWNOŚCI FIZYCZNEJ**********************
 *******************************************************************************/

var promiseAktywnosc = new Promise(
    function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'aktywnosc.json', true);
        xhr.addEventListener('load', function () {
            return resolve(xhr.responseText);
        });
        xhr.addEventListener('error', function () {
            return reject(xhr.statusText);
        });
        xhr.send();
    }
);

function pokazAktywnosc() {
    promiseAktywnosc
        .then(function (data) {
            var output = document.getElementById('aktywnosc-option');
            var produktyObj = JSON.parse(data);
            var dataLocation = produktyObj[2].data;
            for (var i = 0; i < dataLocation.length; i++) {
                var nazwa = dataLocation[i].nazwa_aktywnosci;
                var el = document.createElement('option');
                el.className = 'formy-aktywnosci';
                el.textContent = nazwa;
                output.appendChild(el);
            }

            //Dodaj aktywnosc
            document.getElementById('dodaj-aktywnosc').addEventListener('click', function () {
                var czas = document.getElementById('czas');
                var selectArea = document.getElementById('aktywnosc-option').value;
                var output = document.getElementById('dodana-aktywnosc');
                
                //przerwanie dzialania skryptu w chwili, gdy ktores pole 'parametr' jest zle wypelnione
                var parametrClass = document.querySelectorAll('.aktywnosc .parametr');
                    for (var i = 0; i < parametrClass.length; i++) {
                        var parametrAttribute = parametrClass[i].getAttribute('status');
                        if (parametrAttribute == 'invalid') {
                            bladWalidacji();
                            return false;
                        }
                    }
                //dodaje aktywnosc
                for (var i = 0; i < dataLocation.length; i++) { //robi petle po danych z aktywnosci
                    if (dataLocation[i].nazwa_aktywnosci == selectArea) {
                        var spalone_kalorie = dataLocation[i].spalone_kalorie;
                        spalone_kalorie = Math.round(spalone_kalorie * czas.value / 60); //tutaj zaktualizowac formule zliczajaca spalone kalorie w zaleznosci od czasu
                        var item = document.createElement('div');
                        item.className = 'col-md-6 pojedyncza-aktywnosc';
                        item.innerHTML = '<div><p>Nazwa aktywności</p><p>' + dataLocation[i].nazwa_aktywnosci + '</p></div><div><p>Ilość spalonych kalorii</p><input class="wartosc-aktywnosci" value=' + spalone_kalorie + ' disabled/></div><div><p>Usuń</p><button class="btn btn-danger glyphicon glyphicon-remove usun-aktywnosc"></button></div>';
                        output.appendChild(item);
                    }
                }
            });
            //Usun aktywnosc

            document.addEventListener('click', function (event) {
                var tar = document.getElementsByClassName('usun-aktywnosc');
                for (var i = 0; i < tar.length; i++) {
                    if (event.button == 0 && event.target == tar[i]) {
                        var el = event.target
                        el.parentNode.parentNode.parentNode.removeChild(el.parentNode.parentNode);
                    }
                }
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}
pokazAktywnosc();


/***********************************OBLICZENIA************************************
 **********************************************************************************/
document.getElementById('oblicz').addEventListener('click', function () {

    //zmienne globalne
    var men = document.getElementById('men');
    var woman = document.getElementById('woman');
    var wiek = document.getElementById('wiek');
    var wzrost = document.getElementById('wzrost');
    var waga = document.getElementById('waga');
    var PPM //podstawowa przemiana materii
    var k //wspolczynnik przeliczeniowy
    var klasaKalorie = 'sum-kal-done'; //Klasa dla pola z waroscia kalorii
    var klasaWeglowodany = 'sum-weg-done'; //Klasa dla pola z waroscia weglowodanow
    var klasaBialka = 'sum-bia-done'; //Klasa dla pola z waroscia bialek
    var klasaTluszcze = 'sum-tlu-done'; //Klasa dla pola z waroscia tluszczy
    var kalorie //calkowita ilosc kalorii z pozywienia
    var weglowodany //calkowita ilosc weglowodanow z pozywienia
    var bialka //calkowita ilosc bialka z pozywienia
    var tluszcze //calkowita ilosc tluszczow z pozywienia
    var wartoscAktywnosci //Calkowita wartosc aktywnosci fizycznej

    //przerwanie dzialania skryptu w chwili, gdy ktores pole 'parametr' jest zle wypelnione
    var parametrClass = document.querySelectorAll('.podstawowe-informacje .parametr');
    for (var i = 0; i < parametrClass.length; i++) {
        var parametrAttribute = parametrClass[i].getAttribute('status');
        if (parametrAttribute == 'invalid') {
            bladWalidacji();
            return false;
        }
    }

    /*Obliczanie podstawowej przemiany materii*/
    if (men.checked) {
        PPM = 66.47 + (13.75 * waga.value) + (5 * wzrost.value) - (6.75 * wiek.value); //uaktualnienie PPM dla meszczyzn
    } else if (woman.checked) {
        PPM = 665.9 + (9.56 * waga.value) + (1.85 * wzrost.value) - (4.67 * wiek.value); //Uaktualnienie PPM dla kobiet
    }

    /*obliczanie wspolczynnika k do calkowitej przemiany materii*/
    if (document.getElementById('brak-aktywnosci').checked) {
        k = 1.2;
    } else if (document.getElementById('niska-aktywnosc').checked) {
        k = 1.4;
    } else if (document.getElementById('umiarkowana-aktywnosc').checked) {
        k = 1.6;
    } else if (document.getElementById('srednia-aktywnosc').checked) {
        k = 1.75;
    } else if (document.getElementById('duza-aktywnosc').checked) {
        k = 2;
    } else if (document.getElementById('najwieksza-aktywnosc').checked) {
        k = 2.2;
    }

    /*Obliczanie makroskładników i kalorii*/
    function liczKalorie(klasa) {
        var parNode = document.getElementsByClassName(klasa);
        var makro = 0;
        for (var i = 0; i < parNode.length; i++) {
            makro += parNode[i].value * 1; //razy 1, zeby sumowalo jak wartosci numeryczne, nie jako ciag znakow
        }
        return Math.round(makro);
    }
    kalorie = liczKalorie(klasaKalorie);
    weglowodany = liczKalorie(klasaWeglowodany);
    bialka = liczKalorie(klasaBialka);
    tluszcze = liczKalorie(klasaTluszcze);

    /*obliczanie aktywnosci fizycznej*/
    function liczAktywnosc() {
        var aktywnoscNode = document.getElementsByClassName('wartosc-aktywnosci');
        var wartosc = 0
        for (var i = 0; i < aktywnoscNode.length; i++) {
            wartosc += aktywnoscNode[i].value * 1
        }
        return wartosc;
    }
    wartoscAktywnosci = liczAktywnosc();

    /*wstawianie wyników do pol*/
    function wstawianieWynikow() {
        document.getElementById('ppm').value = Math.round(PPM);
        document.getElementById('cpm').value = Math.round(PPM * k);
        document.getElementById('bilans').value = Math.round(PPM * k - wartoscAktywnosci + kalorie);
        document.getElementById('kalorie').value = kalorie;
        document.getElementById('weglowodany').value = weglowodany;
        document.getElementById('bialka').value = bialka;
        document.getElementById('tluszcze').value = tluszcze;
    }
    wstawianieWynikow();

    //Pokazywanie zawartości wyników
    var wyniki = document.getElementById('wyniki');
    wyniki.style.display = 'block';
    var wynikiOffset = wyniki.offsetTop;
    window.scrollTo(0, wynikiOffset);
});


/********************WALIDACJA*********************************************************
**************************************************************************************/
function validate() {
    var input = document.querySelectorAll('.parametr');
    //dodaje parametr status 
    var setStatus = (function () {
        for (var i = 0; i < input.length; i++) {
            var attribute = input[i].getAttribute('type').toUpperCase();
            if (attribute == 'TEXT') {
                input[i].setAttribute('status', 'invalid');
                if(input[i].value.match(/\d/g) && input[i].value.length!=0){//sprawdza czy pola sa dobrze wypelnione po odswiezeniu przegladarki
                    input[i].setAttribute('status', 'valid');
                }
            }
            if (attribute == 'RADIO') {
                //ustawienia domyslne podczas gdy ktoras z opcji jest juz zaznaczona (np przy odswiezaniu strony)
                if (input[i].classList.contains('plec')) {
                    var plec = document.getElementsByClassName('plec');
                    if (input[i].checked == true) {
                        for (var k = 0; k < plec.length; k++) {
                            plec[k].setAttribute('status', 'valid');
                        }
                    }
                }
                if (input[i].classList.contains('tryb-zycia')) {
                    var trybZycia = document.getElementsByClassName('tryb-zycia');
                    if (input[i].checked == true) {
                        for (var l = 0; l < trybZycia.length; l++) {
                            trybZycia[l].setAttribute('status', 'valid');
                        }
                    }
                }
                //ustawienia po wykonaniu akcji(dodaje status valid do wszystkich inputów)
                input[i].addEventListener('change', function () {
                    if (this.classList.contains('plec')) {
                        var plecInput = document.getElementsByClassName('plec');
                        for (var j = 0; j < plecInput.length; j++) {
                            plecInput[j].setAttribute('status', 'valid');
                            plecInput[j].classList.remove('input-radio-invalid');
                        }
                    }
                    if (this.classList.contains('tryb-zycia')) {
                        var trybZyciaInput = document.getElementsByClassName('tryb-zycia');
                        for (var k = 0; k < trybZyciaInput.length; k++) {
                            trybZyciaInput[k].setAttribute('status', 'valid');
                            trybZyciaInput[k].classList.remove('input-radio-invalid');
                        }
                    }

                });
            }
        }
    }());

    //dodaje zdarzenia dla podstawowych informacji i inputu #czas
    var addBasicEvent = (function () {
        for (var i = 0; i < input.length; i++) {
            var attribute = input[i].getAttribute('type').toUpperCase();
            if (attribute == 'TEXT') {
                input[i].addEventListener('blur', function () {
                    textInputValidation(this);
                });
                input[i].addEventListener('keyup', function () {
                    textInputValidation(this);
                });
            }
        }
        //dodaje zdarzenie dla przycisku oblicz
        document.getElementById('oblicz').addEventListener('click', function () {
            for (var i = 0; i < input.length; i++) {
                var attribute = input[i].getAttribute('type').toUpperCase();
                if (attribute == 'TEXT') {
                    textInputValidation(input[i]);
                }
                if (attribute == 'RADIO') {
                    radioInputValidation(input[i]);
                }
            }
        });
        //dodaje zdarzenia dla inputu #czas
        document.getElementById('czas').addEventListener('keyup', function(){
            textInputValidation(this);
        });
        document.getElementById('czas').addEventListener('blur', function(){
            textInputValidation(this);
        });
        document.getElementById('dodaj-aktywnosc').addEventListener('click', function(){
            var el = document.getElementById('czas');
            textInputValidation(el)
        });
    }())
    
    //walidacja dla pola ilosc(odrebna regula)
    var addProduktyEvent = (function(){
        document.addEventListener('click', function(event){
            var tar = document.getElementsByClassName('add-button');
            for(var i=0; i<tar.length; i++){
                if (event.button == 0 && event.target == tar[i]){
                    var input = event.target.parentElement.previousElementSibling.firstChild;
                    textInputValidation(input);
                }    
            }    
        });
        document.addEventListener('keyup', function(event){
            var tar = document.getElementsByClassName('ile');
            for(var i=0; i<tar.length; i++){
                if (event.target == tar[i]){
                    var input = event.target;
                    textInputValidation(input);
                }    
            }    
        });
    }());
    
    //walidacja pol typu text
    function textInputValidation(input) {
        if (input.value.match(/\D/g) || input.value.length == 0) {
            input.nextElementSibling.style.display = 'block';
            input.setAttribute('status', 'invalid');
            if (input.classList.contains('input-text-invalid')) {
                return false;
            } else {
                input.classList.add('input-text-invalid');
            }
        } else {
            input.nextElementSibling.style.display = 'none';
            input.classList.remove('input-text-invalid');
            input.setAttribute('status', 'valid')
        }
    }

    //walidacja pol typu radio
    function radioInputValidation(input) {
        var currAttr = input.getAttribute('status');
        if (input.classList.contains('plec')) {
            if (currAttr == 'invalid') {
                input.classList.add('input-radio-invalid');
            } else {
                input.classList.remove('input-radio-invalid');
            }
        }
        if (input.classList.contains('tryb-zycia')) {
            if (currAttr == 'invalid') {
                input.classList.add('input-radio-invalid');
            } else {
                input.classList.remove('input-radio-invalid');
            }
        }
    }
};
//wywolanie calej walidacji
document.addEventListener('DOMContentLoaded', validate())

//wyświetlanie okna dialogowego, gdy wystapi jakis blad
function bladWalidacji() {
    document.getElementById('error').style.display = 'block';
    //Zamyka okno bledu
    document.querySelector('#error button').addEventListener('click', function () {
        document.getElementById('error').style.display = 'none';
    });
}
