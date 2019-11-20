var datos = [
{"Nombre":"Stalmate","Genero":"Sintetico","Autor":"KxZ","URL":"assets/KzX - Stalemate.mp3"},
{"Nombre":"cytus-op-loom-full","Genero":"Sintetico","Autor":"","URL":"assets/cytus-op-loom-full.mp3"},
{"Nombre":"Megalovania","Genero":"8 bits","Autor":"Toby Fox","URL":"assets/megalovania.mp3"},
{"Nombre":"Waterfall","Genero":"8 bits","Autor":"Toby Fox","URL":"assets/toby fox - UNDERTALE Soundtrack - 31 Waterfall.mp3"},
{"Nombre":"Spider Dance","Genero":"8 bits","Autor":"Toby Fox","URL":"assets/toby fox - UNDERTALE Soundtrack - 59 Spider Dance.mp3"},
{"Nombre":"unidentified","Genero":"Sintetico","Autor":"Lobotomy Corporation","URL":"assets/unidentified-music-54-lobotomy-corporation-ost.mp3"}
];


function creadorTabla(Informacion){
	 // EXTRACT VALUE FOR HTML HEADER.
        // ('Book ID', 'Book Name', 'Category' and 'Price')
        var col = [];
        for (var i = 0; i < datos.length; i++) {
            for (var key in datos[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");
        table.className="table table-striped table-bordered table-sm";
        table.id="dtHorizontalVerticalExample";

        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < datos.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = datos[i][col[j]];
            }
        }

        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("cuadroDatos");
        console.log(divContainer);
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
    }

creadorTabla(datos);
