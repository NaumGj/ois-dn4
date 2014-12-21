var request = require('request');
var cheerio = require('cheerio');

for(var i=451; i<=465; i++){
    request('http://zdravniki.org/zdravniki?page='+i, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('a.doctor').each(function(i, element){
                var ime = $(this);
                var specijalizacije = ime.next();
                var delavnoMesto = specijalizacije.next();
                if(specijalizacije.text() && delavnoMesto.text() && delavnoMesto.text().charAt(0) != '5' && delavnoMesto.text().charAt(0) != '4' && delavnoMesto.text().charAt(0) != '3' && delavnoMesto.text().charAt(0) != '2' && delavnoMesto.text().charAt(0) != '1'){
                    var lokacija = delavnoMesto.text().split(' ').join('-').toLowerCase().split(",")[0];
                    lokacija = lokacija.replace(/š/g,"s").replace(/č/g,"c").replace(/ž/g,"z");
                    najdiLokacijo(lokacija, ime, specijalizacije);
                }
            });
        }
    });
}

function najdiLokacijo(lokacija, ime, specijalizacija){
    request('http://zdravniki.org/lokacije/'+lokacija, function (error, response, html) {
        // console.log(lokacija);
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('td.key').each(function(i, element){
                if($(this).text()==="Naslov"){
                    var naslov = $(this).next();
                    console.log(ime.text().split(",")[0] + "," + specijalizacija.text().split(",")[0] + "," + naslov.text().replace(/(\n)/g, " "));
                }
            });
        }
    });
}
