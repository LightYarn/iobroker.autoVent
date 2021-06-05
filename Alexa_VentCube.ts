//let logOn:          boolean = true;     // Skript Logausgabe ein- (true) / ausschalten (false). Fehler werden immer ausgegeben.
//let forecreation:   boolean = false;    // Default: false. true: Datenpunkte werden überschrieben (wenn z.B. Bezeichnungen geändert wurden)
//
//
//// URL, die abgefragt, bzw. gesendet werden soll:
//let options: { [index: string]: any } =
//{
//    //host: '192.168.1.100',
//}
//
//// OPTIONAL: regelmässige Wiederholungen der Abfrage
//let cronStr:string = "* */6 * * *";
//
//// Datenpunkte anlegen:
//// -----------------------------------------------------------------------------
//let path:string = "test.alexatrigger" + "."; // Pfad unter dem in der Javascript-Instanz die Datenpunkte angelegt werden sollen:
//
//// Datenpunktnamen:
//let idAlexaTrigger:string = path + "alexa_trigger";
//createState(idAlexaTrigger, 0, forecreation, {
//    name: 'Trigger für Alexa',
//    desc: 'Trigger mit Level für Alexa um einen hhtp request zu erzeugen',
//    type: 'number',
//    unit: '',
//    role: 'value'
//});
//
//// Funktionen:
//function setOperatingMode(): void 
//{
//    log("OPERATING MODE: ");
//
//    //var req = http.get(options, function (res) 
//    //{
//    //        if (logOn)
//    //            log('STATUS: ' + res.statusCode); // Statuscode
//    //        if (logOn)
//    //            log('HEADERS: ' + JSON.stringify(res.headers)); // Header (Rückmeldung vom Webserver)
//    //        !// Buffer the body entirely for processing as a whole.
//    //        var bodyChunks = [];
//    //        var chunkLine = 0;
//    //        res.on('data', function (chunk) {
//    //            chunkLine = chunkLine + 1;
//    //            if (logOn)
//    //                log("Zeilennummer: " + chunkLine + " ,Inhalt: " + chunk);
//    //
//    //            // Hier können die einzelnen Zeilen verarbeitet werden...
//    //            bodyChunks.push(chunk);
//    //
//    //        }).on('end', function () {
//    //            if (logOn)
//    //                log("ARRAY mit den einzelnen Zeilen: " + bodyChunks);
//    //            if (logOn)
//    //                log("ARRAY Länge: " + bodyChunks.length);
//    //            !var body = Buffer.concat(bodyChunks);
//    //            !if (logOn)
//    //                log('BODY: ' + body);
//    //            // ...und/oder das Gesamtergebnis.
//    //            !
//    //        });
//    //    });
//    //	
//    //!req.on('error', function (e) 
//    //{ // Fehler abfangen
//    //    log('ERROR: ' + e.message, "warn");
//    //});
//}
//
//// SUBSCRIPTIONS
//// -----------------------------------------------------------------------------
//on({
//    id: "javascript." + instance + "." + idAlexaTrigger,
//    change: 'any'
//}, function (obj)
//{
//        if (logOn)
//        {
//            log("Alexa Trigger wurde geschrieben: " + obj.state.val);
//        }
//    main();
//});
//
//// OPTIONAL: regelmässige Wiederholungen
//// -----------------------------------------------------------------------------
//// Kommentar entfernen, wenn regelmässige Wiederholungen gewünscht sind:
//// schedule(cronStr, main);
//
//// main
//// -----------------------------------------------------------------------------
//function main()
//{
//    setOperatingMode();
//}
//
//// Start Skript:
//// -----------------------------------------------------------------------------
//!// Kommentar entfernen, wenn die Abfrage zum Skriptstart ausgeführt werden soll:
//setTimeout(main, 500);

