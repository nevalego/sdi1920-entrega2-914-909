var token;
var URLbase = "https://localhost:8081/api";
$( "#contenedor-principal" ).load( "widget-login.html");
if ( Cookies.get('token') != null ){
    token = Cookies.get('token');
    var url = new URL(window.location.href);
    var w = url.searchParams.get("w");
    if ( w == "login"){
        $( "#contenedor-principal" ).load("widget-login.html");
    }
    /**
    if ( w == "canciones"){
        $( "#contenedor-principal" ).load("widget-canciones.html");
    }
     */
}