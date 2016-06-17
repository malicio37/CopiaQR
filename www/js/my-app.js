// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;
var user;
var email;
//var password;
var circuit;
var backend='http://200.21.104.79/C_Obs/backendSlim'
// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true

});


myApp.onPageInit('index2', function (page) {
  var pageContainer = $$(page.container);
  pageContainer.find('.botonSiguiente').on('click', function () {
    email = pageContainer.find('input[name="email"]').val();
    if(email== ""){
      /*
       * Falta la validación completa del email antes de crear
       */
      myApp.alert('Debe ingresar un correo válido');
    }
    else{
      var params= '{"email":"' + email + '"}';
      $$.post(backend +'/users/email', params, function (data) {
        if (data =='false'){
        myApp.alert('El correo ingresado no se encuentra registrado, por favor realice el registro');
          //cargar la página del formulario de inscripcion
          mainView.router.loadPage("registroUsuario.html");
        }
        else{
          //cargar la página de elección de la carrera a trabajar (almacenar en variable local carrera)
          mainView.router.loadPage("login.html");
        }
      });
    }
  });
});


myApp.onPageInit('login', function (page) {

  var pageContainer = $$(page.container);
  pageContainer.find('.botonLogin').on('click', function () {
    password = pageContainer.find('input[name="password"]').val();
    if(password == ""){
      myApp.alert('Debe ingresar la contraseña para continuar');
    }
    else{
      var params= '{"email":"' + email + '",'+ '"password":"' + password + '"}';
      $$.post(backend +'/users/passwd', params, function (data) {
        if (data =='false'){
          myApp.alert('Contraseña incorrecta, intente de nuevo por favor');
          mainView.router.loadPage("login.html");
        }
        else{
          //devuelve el identificador del usuario logeado
          var arreglo=JSON.parse(data);
          user = arreglo.id;
          mainView.router.loadPage("seleccionCarrera.html");
        }
      });
    }
  });
});



myApp.onPageInit('registroUsuario', function (page) {
  var pageContainer = $$(page.container);
  pageContainer.find('input[name="email"]').val(email);
  pageContainer.find('.botonAddUser').on('click', function () {
    var nombres = pageContainer.find('input[name="nombres"]').val();
    var apellidos = pageContainer.find('input[name="apellidos"]').val();
    var fechaNacimiento = pageContainer.find('input[name="fechaNacimiento"]').val();
    var password = pageContainer.find('input[name="password"]').val();
    var color = pageContainer.find('input[name="color"]').val();
    var genero = pageContainer.find('select[name="genero"]').val();

    if(nombres == "" || apellidos =="" || fechaNacimiento == "" || password== "" || color == "" || genero ==""){
      myApp.alert('Debe ingresar todos los campos del formulario');
    }
    else{
      var params= '{"name":"' + nombres + '",' + '"lastname":"' + apellidos + '",'+
      '"birthDate":"' + fechaNacimiento + '",' + '"email":"' + email + '", "password":"' + password  + '",'+ '"color":"' + color + '",'+
      '"gender":"' + genero + '",'+ '"type":"usuario"}';
        $$.post(backend +'/users', params, function (data) {
        if(data.indexOf('error') > -1){

          myApp.alert('usuario no pudo crearse por: ' + data);
          //cargar la página del formulario de inscripcion
          mainView.router.loadPage("inscripcion.html");
        }
        else{
          var arreglo=JSON.parse(data);
          user = arreglo.id;
          //cargar la pagina de inscripcion de carreras despues de mostrar carreras activas
          mainView.router.loadPage("seleccionCarrera.html");
        }
      });

    }
    });
  });


  myApp.onPageInit('seleccionCarrera', function (page) {
    //cargar los valores de carreras previos
    var pageContainer = $$(page.container);
    var params = '{"user_id":'+ user + '}';
    var selectObject= pageContainer.find('select[name="carrerasInscritas"]');
    $$.post(backend +'/inscriptions/user', params, function (data) {
      var arreglo=JSON.parse(data);
      if(Object.keys(arreglo).length==0){
        myApp.alert('No tiene carreras inscritas, solicite su inscripción al administrador');
      }
      else{
        //cargar valores en el select carrerasInscritas
        for(i=0;i < Object.keys(arreglo).length; i++){
          var opcion = document.createElement("option");
          opcion.text = arreglo[i].name;
          opcion.value = arreglo[i].id;
          selectObject.append(opcion);
        }
      }
    });

    pageContainer.find('.botonIngresar').on('click', function () {
        circuit= pageContainer.find('select[name="carrerasInscritas"]').val();
        if(circuit==""){
          myApp.alert('No tiene carreras inscritas, solicite su inscripción al administrador');
        }
        else{

          //$$.get(backend +'/circuits/'+circuit, function (data) {
          //var arreglo=JSON.parse(data);
          //document.getElementById("textoCarrera").innerHTML = arreglo.nombre;
          //pageContainer.find('a[name="textoCarrera"]').val(arreglo.nombre);
          //pageContainer.find('a[name="textoCorreo"]').val(email);
        //});
        mainView.router.loadPage("principal.html");
        }
    });
});

myApp.onPageInit('principal2', function (page) {
  var pageContainer = $$(page.container);
  //ojo
  $$.get(backend +'/circuits/'+ circuit, function (data) {
    var arreglo=JSON.parse(data);
    //document.getElementById("circuitName").innerHTML = "Carrera: " +arreglo.name;
    //document.getElementById("userMail").innerHTML = "Usuario: " + email;
  });
  //obtenga nodosVisitados, si no tiene ninguno del circuito seleccionado que le dé la primera pista
  var params = '{"user_id":'+ user + ', "circuit_id":' + circuit + '}';
  //var circuitName= pageContainer.find('text[name="nombreCarrera"]');
  $$.get(backend +'/nodesdiscovered/visited/'+user+'/'+circuit, function (data) {
    var arreglo=JSON.parse(data);
    if(Object.keys(arreglo).length==0){
      genDiscoveredNode();
    }
  });
});


function genDiscoveredNode(){
  var params = '{"user_id":'+ user + ', "circuit_id":'+circuit+'}';
  $$.post(backend +'/nodesdiscovered/tovisit',params, function (data) {
    var arreglo=JSON.parse(data);
    var longitud= Object.keys(arreglo).length;
    if(longitud==0){
      myApp.alert('FELICIDADES!! haz terminado la Carrera de Observación UAM');
    }
    else {
      var nodo=Math.floor(Math.random() * longitud);
      $$.get(backend +'/questions/node/' + arreglo[nodo].id, function (data2) {
        var arreglo2=JSON.parse(data2);
        var quests= Object.keys(arreglo2).length;
        var pregunta=Math.floor(Math.random() * quests);
        params='{"node_id":'+ arreglo[nodo].id + ', "user_id":'+ user +',"question_id":' + arreglo2[pregunta].id +
                ', "status": 0, "statusDate1" : "'+ getActualDateTime()
                +'", "statusDate2" : null, "statusDate3": null}';
        $$.post(backend +'/nodesdiscovered',params, function (data3) {
          myApp.alert('Tienes una nueva pista!!');
        });
      });
      }
    });
}


function getActualDateTime(){
  var d = new Date();
  var fechaHora=(
      d.getFullYear() + "-" +
      ("00" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d.getDate()).slice(-2) + " " +
      ("00" + d.getHours()).slice(-2) + ":" +
      ("00" + d.getMinutes()).slice(-2) + ":" +
      ("00" + d.getSeconds()).slice(-2)
  );
  return fechaHora;
}

myApp.onPageInit('verPista', function (page) {
  var pageContainer = $$(page.container);
  var params = '{"user_id":'+ user + ', "circuit_id":'+circuit+'}';
  //var circuitName= pageContainer.find('text[name="nombreCarrera"]');
  $$.post(backend +'/nodes/showhint',params, function (data) {
    var arreglo=JSON.parse(data);
      var test="";
      for(i=0;i < Object.keys(arreglo).length; i++){
        test+= arreglo[i].hint + '<br><br>';
      }
      document.getElementById("listaPistas").innerHTML = test;
  });
});


myApp.onPageInit('escanear', function (page) {
  //cargar las preguntas pendientes por contestar
  var pageContainer = $$(page.container);
  var selectObject= pageContainer.find('select[name="pistasQR"]');
  //
  var params = '{"user_id":'+ user + ', "circuit_id":'+circuit+'}';
  $$.post(backend +'/nodes/showhint',params, function (data) {
    var arreglo=JSON.parse(data);
      //cargar valores en el select carrerasInscritas
      for(i=0;i < Object.keys(arreglo).length; i++){
        var opcion = document.createElement("option");
        opcion.text = arreglo[i].hint;
        opcion.value = arreglo[i].id;
        selectObject.append(opcion);
      }
  });

    pageContainer.find('.botonPasarCodigo').on('click', function () {


      var nodo_id= pageContainer.find('select[name="pistasQR"]').val();
      if(nodo_id==""){
        myApp.alert('No tiene pistar que escanear, debe encontrar una pista antes');
      }
      else{


        /**
        * carga de datos del QR
        */
        var codigo = pageContainer.find('input[name="codeText"]').val();
        if(nodo_id=="" || codigo==""){
          myApp.alert('Debe ingresar un código válido');
        }
        else{
        var params= '{"node_id":' + nodo_id + ', "code":"' + codigo + '"}';
          $$.post(backend +'/nodes/validate', params, function (data) {
            var arreglo=JSON.parse(data);
          if(data == 'false'){
            myApp.alert('El código no corresponde a la pista actual ');
          }
          else{
            //obtener el id del nodo descubierto a actualizar

            $$.get(backend +'/nodesdiscovered/' + user + '/' + nodo_id,  function (data) {
              var nodoDescubierto=JSON.parse(data);
              var nd_id= nodoDescubierto.id;
              var nd_question_id= nodoDescubierto.question_id;
              var nd_statusDate1= nodoDescubierto.statusDate1;
              //put a estado 1
              var params = '{"node_id":'+ nodo_id + ', "user_id":'+user+', "question_id":' + nd_question_id +', "status":1'
                            +', "statusDate1":"'+nd_statusDate1+'","statusDate2":"'+getActualDateTime()+
                            '","statusDate3":null }';
              $$.ajax({
                 url: backend + '/nodesdiscovered/'+nd_id,
                 type: "PUT",
                 contentType: "application/json",
                 data: params,
                 success: function(data, textStatus ){
                   data = JSON.parse(data);
                   myApp.alert('Tienes una nueva pregunta!!');
                   //lo envìa a la página de ver pista a ver la nueva pista generada
                   mainView.router.loadPage("principal.html");
                 },
                 error: function(xhr, textStatus, errorThrown){
                   // We have received response and can hide activity indicator
                   console.log('fallo al actualizar nodo descubierto');
                 }
              });
            });
          }
        });
        }
      }
      });

  });

  document.addEventListener("deviceready", init, false);
  function init() {
      document.querySelector("#startScan").addEventListener("touchend", startScan, false);
      //resultDiv = document.querySelector("#results");
  }

  function startScan() {

      cordova.plugins.barcodeScanner.scan(
          function (result) {
            var codigo = result.text;
            var nodo_id= pageContainer.find('select[name="pistasQR"]').val();

            if(nodo_id=="" || codigo==""){
              myApp.alert('Debe ingresar un código válido');
            }
            else{
            var params= '{"node_id":' + nodo_id + ', "code":"' + codigo + '"}';
              $$.post(backend +'/nodes/validate', params, function (data) {
                var arreglo=JSON.parse(data);
              if(data == 'false'){
                myApp.alert('El código no corresponde a la pista actual ');
              }
              else{
                //obtener el id del nodo descubierto a actualizar

                $$.get(backend +'/nodesdiscovered/' + user + '/' + nodo_id,  function (data) {
                  var nodoDescubierto=JSON.parse(data);
                  var nd_id= nodoDescubierto.id;
                  var nd_question_id= nodoDescubierto.question_id;
                  var nd_statusDate1= nodoDescubierto.statusDate1;
                  //put a estado 1
                  var params = '{"node_id":'+ nodo_id + ', "user_id":'+user+', "question_id":' + nd_question_id +', "status":1'
                                +', "statusDate1":"'+nd_statusDate1+'","statusDate2":"'+getActualDateTime()+
                                '","statusDate3":null }';
                  $$.ajax({
                     url: backend + '/nodesdiscovered/'+nd_id,
                     type: "PUT",
                     contentType: "application/json",
                     data: params,
                     success: function(data, textStatus ){
                       data = JSON.parse(data);
                       myApp.alert('Tienes una nueva pregunta!!');
                       //lo envìa a la página de ver pista a ver la nueva pista generada
                       mainView.router.loadPage("principal.html");
                     },
                     error: function(xhr, textStatus, errorThrown){
                       // We have received response and can hide activity indicator
                       console.log('fallo al actualizar nodo descubierto');
                     }
                  });
                });
              }
            });
            }


          },
          function (error) {
              alert("Scanning failed: " + error);
          }
      );

  };



  myApp.onPageInit('verPregunta', function (page) {
    //cargar las preguntas pendientes por contestar
    var pageContainer = $$(page.container);
    var params = '{"user_id":'+ user + ', "circuit_id":'+circuit+'}';
    var selectObject= pageContainer.find('select[name="preguntas"]');
    $$.post(backend +'/nodesdiscovered/showquestion',params, function (data) {
      var arregloB=JSON.parse(data);

        var test="";
        for(i=0;i < Object.keys(arregloB).length; i++){
          test+= arregloB[i].question + '<br><br>';
        }
        document.getElementById("listaPreguntas").innerHTML = test;
    });
  });


myApp.onPageInit('response', function (page) {
  //cargar las preguntas pendientes por contestar
  var pageContainer = $$(page.container);
  var params = '{"user_id":'+ user + ', "circuit_id":'+circuit+'}';
  var selectObject= pageContainer.find('select[name="preguntas"]');
  $$.post(backend +'/nodesdiscovered/showquestion',params, function (data) {
    var arregloB=JSON.parse(data);
      //cargar valores en el select carrerasInscritas
      for(i=0;i < Object.keys(arregloB).length; i++){
        var opcion = document.createElement("option");
        opcion.text = arregloB[i].question;
        opcion.value = arregloB[i].id;
        selectObject.append(opcion);
      }
  });
  pageContainer.find('.botonResponder').on('click', function () {
      var question= pageContainer.find('select[name="preguntas"]').val();
      if(question==""){
        myApp.alert('No tiene preguntas que contestar, debe encontrar un nodo antes');
      }
      else{
        var respuesta = pageContainer.find('input[name="response"]').val();
        var respTemp=replaceall(respuesta,' ','');
        if(respTemp==""){
          myApp.alert('Debe ingresar un respuesta válida');
        }
        else{
          //normalizar respuesta
          respuesta=respuesta.toUpperCase();
          respuesta=replaceall(respuesta,'Á','A');
          respuesta=replaceall(respuesta,'É','E');
          respuesta=replaceall(respuesta,'Í','I');
          respuesta=replaceall(respuesta,'Ó','O');
          respuesta=replaceall(respuesta,'Ú','U');
          //validar la respuesta
          var params= '{"question_id":' + question +', "answer":"' + respuesta + '"}';
            $$.post(backend +'/questions/validate', params, function (data) {
              var arregloB=JSON.parse(data);
            if(data == 'false'){
              myApp.alert('Respuesta incorrecta, trate nuevamente ');
            }
            else{
              //obtener el id del nodo descubierto a actualizar
              var params = '{"user_id":'+ user + ', "circuit_id":'+circuit+', "question_id":' + question + '}';

              $$.post(backend +'/nodesdiscovered/getid', params, function (data) {
                var nodoDescubierto=JSON.parse(data);
                var nd_id= nodoDescubierto.id;
                var nd_node_id= nodoDescubierto.node_id;
                var nd_statusDate1= nodoDescubierto.statusDate1;
                var nd_statusDate2= nodoDescubierto.statusDate2;
                //put a estado 2
                var params = '{"node_id":'+ nd_node_id + ', "user_id":'+user+', "question_id":' + question +', "status":2'
                              +', "statusDate1":"'+nd_statusDate1+'","statusDate2":"'+nd_statusDate2+
                              '","statusDate3":"'+ getActualDateTime() + '"}';

                $$.ajax({
                   url: backend + '/nodesdiscovered/'+nd_id,
                   type: "PUT",
                   contentType: "application/json",
                   data: params,
                   success: function(data, textStatus ){
                     data = JSON.parse(data);
                     //generar nueva pista
                     myApp.alert('Respuesta correcta!! ');
                     genDiscoveredNode();
                     //lo envìa a la página de ver pista a ver la nueva pista generada
                     mainView.router.loadPage("principal.html");
                   },
                   error: function(xhr, textStatus, errorThrown){
                     // We have received response and can hide activity indicator
                     console.log('fallo al actualizar nodo descubierto');
                   }
                });

              });
            }
          });
        }
      }
  });
});

function replaceall(str,replace,with_this)
{
    var str_hasil ="";
    var temp;
    for(var i=0;i<str.length;i++)
    {
        if (str[i] == replace)
        {
            temp = with_this;
        }
        else
        {
                temp = str[i];
        }
        str_hasil += temp;
    }
    return str_hasil;
}


myApp.onPageInit('puntuacion', function (page) {
  var pageContainer = $$(page.container);
  var texto;
  $$.get(backend +'/circuits/score/'+circuit, function (data) {
    var arreglo=JSON.parse(data);
    texto="De un total de "+ arreglo.total + " nodos a visitar has completado ";
  });
  $$.get(backend +'/nodesdiscovered/score/'+user+'/'+circuit, function (data) {
    var arreglo=JSON.parse(data);
    texto+= Object.keys(arreglo).length + ".</br></br> A continuación los nombres de los nodos que has completado: </br></br>";
    for(i=0;i < Object.keys(arreglo).length; i++){
      texto+= arreglo[i].name + '<br>';
    }
    document.getElementById("listaPuntuacion").innerHTML = texto;
  });
});


myApp.onPageInit('score', function (page) {
  var pageContainer = $$(page.container);
  var texto="";
  $$.get(backend +'/circuits/totalscore/'+circuit, function (data) {
    var arreglo=JSON.parse(data);
    var longitud= Object.keys(arreglo).length;
    var top=5;
    if(longitud == 0){
      myApp.alert('Carrera de Observación UAM','Ningún participante tiene nodos visitados aún!! ');
    }
    else{
      if(longitud < 4){
        top=Object.keys(arreglo).length;
      }

      //generar la tabla del ranking

      texto='<table>	<tr>		<td>Pos.</td>		<td>Usuario</td>		<td>Nodos</td>	</tr>';
      for(i=0;i < top; i++){
        texto+= '<tr><td>'+ (i+1) + '</td><td>' + arreglo[i].email + '</td><td>'+ arreglo[i].cantidad+ '</td></tr>';
      }
      document.getElementById("totalScore").innerHTML = texto;
    }
  });
});

function signOut() {
  user='';
  email='';
  circuit='';
  mainView.router.loadPage("index.html");
};


myApp.onPageInit('verMapa', function (page) {
  var map;
  	map = L.map('mapid').setView([5.0672036513457535, -75.5031082034111], 16);
  	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFsaWNpbzM3IiwiYSI6ImNpcGlzNmlpdDAxc3F0ZW00NXNnMGI0MTQifQ.EUkOOib26_TXpRN39uVvDQ', {
  		maxZoom: 18,
  		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
  			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  		id: 'malicio37.0dp70o3a'
  	}).addTo(map);
    $$.get(backend +'/users/locationvisited/'+user +'/'+circuit, function (data) {
      var locations=JSON.parse(data);
      for(i=0;i < Object.keys(locations).length; i++){
        var marker = L.marker([ locations[i].latitude , locations[i].longitude ]).addTo(map);
        var nombre='"'+[locations[i].name]+'"';
        marker.bindPopup(nombre).openPopup();
      }
    });
});
