package com.uniovi.tests;

//Paquetes Java
import java.util.List;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;

//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class UOChatTests {
	// En Windows (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens
	// automÃ¡ticas)):
	// Rutas Miguel
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "D:\\Universidad\\SDI\\Pruebas Selenium\\geckodriver024win64.exe";
	// Rutas Nerea
	// static String PathFirefox65 = "/Archivos de programa/Mozilla
	// Firefox/firefox.exe";
	// static String Geckdriver024 = "/Users/nerea/Documents/2 SEMESTRE/SDI/5. Web
	// testing con
	// Selenium/PL-SDI-Sesión5-material/PL-SDI-Sesión5-material/geckodriver024win64.exe";

	// ComÃºn a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "https://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// Se eliminan las bases de datos existentes
		PO_InitAplication.reiniciarBBDD(driver, "peticiones");
		PO_InitAplication.reiniciarBBDD(driver, "usuarios");
		System.out.println("Se han borrado las bases de datos");
		
		//Se registran los usuarios necesarios
		driver.navigate().to(URL);
		PO_InitAplication.insertUsers(driver);
		System.out.println("Se han insertado todos los usuarios");

		//Se insertan todas las peticiones de amistad
		//Los usuarios del 9 al 6 enviaran solicitudes
		// a los usuarios del 2 al 4 inclusives 
		PO_InitAplication.insertAmistades(driver);
		System.out.println("Se han insertado todas las peticiones de amistad");
		
		//Se aceptaran todas las amistades del user 2
		PO_InitAplication.aceptarAmistades(driver, 2);
		System.out.println("Se han aceptado todas las peticiones de amistad del usuario 2");


	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01.
	// Registro de Usuario con datos válidos
	@Test
	public void PR01() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_RegisterView.fillForm(driver, "prueba@hotmail.com", "Prueba", "Prueba", "123456", "123456");
		// Comprobamos que nos dan un mensaje de registro realizado
		PO_View.checkElement(driver, "text", "Usuario registrado correctamente");
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");

	}

	// PR02.
	// Registro de usuarios con datos invalidos
	// email, nombre o apellidos vacio
	@Test
	public void PR02() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con email vacio.
		PO_RegisterView.fillForm(driver, "", "Prueba2", "Prueba2", "123456", "123456");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Rellenamos el formulario con nombre vacio.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "", "Prueba2", "123456", "123456");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Rellenamos el formulario con apellido vacio.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "", "123456", "123456");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Rellenamos el formulario con contraseña vacia.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "Prueba2", "", "123456");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Rellenamos el formulario con recontraseña vacia.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "Prueba2", "123456", "");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Dejamos el formulario vacio.
		PO_RegisterView.fillForm(driver, "", "", "", "", "");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");

	}

	// PR03.
	// Resitro de usuario con datos invalidos
	// contraseña invalida repetida
	@Test
	public void PR03() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con contraseña repetida erronea.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "Prueba2", "123456", "222222");
		PO_View.checkElement(driver, "text", "Las contraseñas no coinciden");
	}

	// PR04.
	// Registro de Usuario con datos invalidos
	// Email existente
	@Test
	public void PR04() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_RegisterView.fillForm(driver, "prueba@hotmail.com", "Prueba", "Prueba", "123456", "123456");
		// Comprobamos que nos dan un mensaje de error por email existente
		PO_View.checkElement(driver, "text", "Debe escoger otro email");

	}

	// PR05.
	// Inicio de sesión con datos válidos
	// Usuario estandar
	@Test
	public void PR05() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
	}

	// PR06.
	// Inicio de sesión con datos inválidos
	// email y contraseña vacios
	@Test
	public void PR06() {
		PO_LoginView.fillForm(driver, "", "123456");
		// Comprobamos que seguimos en la pagina
		SeleniumUtils.textoPresentePagina(driver, "Identificación de usuario");
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "");
		// Comprobamos que seguimos en la pagina
		SeleniumUtils.textoPresentePagina(driver, "Identificación de usuario");

	}

	// PR07.
	// Inicio de sesión con datos inválidos
	// Contraseña incorrecta
	@Test
	public void PR07() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "2222222");
		// Comprobamos que seguimos en la pagina
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}

	// PR08.
	// Inicio de sesión con datos inválidos
	// Email no existente
	@Test
	public void PR08() {
		PO_LoginView.fillForm(driver, "emailNoExistente@hotmail.com", "123456");
		// Comprobamos que seguimos en la pagina
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}

	// PR09.
	// Salir de sesion
	// Redirigir a login
	@Test
	public void PR09() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		PO_HomeView.clickOption(driver, "/desconectarse", "class", "btn btn-primary");
		PO_View.checkElement(driver, "text", "Identificación de usuario");
		SeleniumUtils.textoNoPresentePagina(driver, "Usuarios");

	}

	// PR10.
	// Boton cerrar sesion no visible si no esta loggeado
	@Test
	public void PR10() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		// Salimos de sesion
		PO_HomeView.clickOption(driver, "/desconectarse", "class", "btn btn-primary");
		// Comprobamos que no detecta el link de desconectarse
		PO_HomeView.clickNoOption(driver, "/desconectarse");
	}

	// PR11.
	// Mostrar usuarios del sistema
	@Test
	public void PR11() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		// Comprobamos todos los usuarios en la aplicacion
		PO_UserListView.comprobarTodosLosUsuarios(driver);

	}

	// PR12.
	// Busqueda de campo vacio
	// Se muestra todo
	@Test
	public void PR12() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		PO_UserListView.makeASearch(driver, "");
		PO_UserListView.comprobarPrimeraPagina(driver);
	}

	// PR13.
	// Busqueda con nombre inexistente
	// No muestra nada
	@Test
	public void PR13() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		// Si hay uno o mas usuarios estos tendran esta opcion
		SeleniumUtils.textoPresentePagina(driver, "Agregar Amigo");
		PO_UserListView.makeASearch(driver, "UnicornioSubmarino");
		// Al no aparecer ninguno no debe aparecer esta opcion
		SeleniumUtils.textoNoPresentePagina(driver, "Agregar Amigo");

	}

	// PR14.
	// Busqueda que aparezca lo que se debe
	@Test
	public void PR14() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		// Si hay uno o mas usuarios estos tendran esta opcion
		SeleniumUtils.textoPresentePagina(driver, "Agregar Amigo");

		// Hacemos Busqueda por email
		PO_UserListView.makeASearch(driver, "prueba@hotmail.com");
		// Al no aparecer ninguno no debe aparecer esta opcion
		SeleniumUtils.textoPresentePagina(driver, "Prueba");
		SeleniumUtils.textoPresentePagina(driver, "Agregar Amigo");

		// Hacemos busqueda por nombre
		PO_UserListView.makeASearch(driver, "Prueba2");
		// Al no aparecer ninguno no debe aparecer esta opcion
		SeleniumUtils.textoPresentePagina(driver, "prueba2@email.com");
		SeleniumUtils.textoPresentePagina(driver, "Agregar Amigo");

		// Hacemos busqueda por apellido
		PO_UserListView.makeASearch(driver, "2Prueba");
		// Al no aparecer ninguno no debe aparecer esta opcion
		SeleniumUtils.textoPresentePagina(driver, "prueba2@email.com");
		SeleniumUtils.textoPresentePagina(driver, "Agregar Amigo");

	}

	// PR15.
	// Enviar solicitud de amistad y comprobar que existe
	@Test
	public void PR15() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		// Se envia la solicitud a un usuario
		PO_FriendsView.sendFriendRequest(driver, "prueba0@email.com");
		// Comprobamos que sale el mensaje de confirmacion
		PO_View.checkElement(driver, "text", "Peticion enviada");

		// Salimos de Sesion y vamos al del receptor para comprobar que le ha llegado
		// la invitacion
		PO_HomeView.clickOption(driver, "/desconectarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba0@email.com", "123456");
		PO_NavView.checkNavMode(driver, "mPeticionesAmistad");
		// Comprobamos que aparece la invitacion
		SeleniumUtils.textoPresentePagina(driver, "prueba@hotmail.com");
		SeleniumUtils.textoPresentePagina(driver, "Aceptar");

	}

	// PR16.
	// Enviar amistad a un usuario al que ya se envio una
	@Test
	public void PR16() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Usuarios");
		// Se envia la solicitud a un usuario
		PO_FriendsView.sendFriendRequest(driver, "prueba0@email.com");
		// Comprobamos que sale el mensaje de confirmacion
		PO_View.checkElement(driver, "text", "Ya existe una peticion de ese tipo o no es valida");
	}

	// PR017.
	// Listar invitaciones de amistad
	@Test
	public void PR17() {
		PO_LoginView.fillForm(driver, "prueba3@email.com", "123456");
		PO_NavView.checkNavMode(driver, "mPeticionesAmistad");

		// Comprobamos que aparece cada invitacion
		SeleniumUtils.textoPresentePagina(driver, "prueba6@email.com");

		// Comprobamos que aparece la invitacion
		SeleniumUtils.textoPresentePagina(driver, "prueba7@email.com");

		// Comprobamos que aparece la invitacion
		SeleniumUtils.textoPresentePagina(driver, "prueba8@email.com");
		// Comprobamos que aparece la invitacion
		SeleniumUtils.textoPresentePagina(driver, "prueba9@email.com");

		
	}

	// PR18.
	// Aceptar amistad y comprobar que desaparece
	@Test
	public void PR18() {
		// Ir a la lista de amigos
		PO_LoginView.fillForm(driver, "prueba0@email.com", "123456");
		PO_NavView.checkNavMode(driver, "mPeticionesAmistad");
		// Aceptar la invitacion
		PO_FriendsView.aceptFriendRequest(driver, "prueba@hotmail.com");
		// Comprobar que ahora somos amigos
		SeleniumUtils.textoPresentePagina(driver, "prueba@hotmail.com");
		PO_View.checkElement(driver, "text", "La peticion ha sido aceptada correctamente");

		// Ir a la lista de solicitudes y comprobar que ya no esta ahi
		PO_NavView.checkNavMode(driver, "mPeticionesAmistad");
		SeleniumUtils.textoNoPresentePagina(driver, "prueba@hotmail.com");

	}

	// PR19.
	// Mostrar listado de amistades
	@Test
	public void PR19() {
		// Ir a la lista de amigos
		PO_LoginView.fillForm(driver, "prueba0@email.com", "123456");
		PO_NavView.checkNavMode(driver, "mListaDeAmigos");
		SeleniumUtils.textoPresentePagina(driver, "prueba@hotmail.com");
		SeleniumUtils.textoPresentePagina(driver, "Lista de Amigos");
	}

	// P20.
	// Acceder a la opcion a lista de de usuarios
	// No se estará autenticado
	@Test
	public void PR20() {
		driver.navigate().to("https://localhost:8081/usuarios");
		// Comprobamos que nos redirige a identificacion
		SeleniumUtils.textoPresentePagina(driver, "Identificación de usuario");
	}

	// PR21.
	// Acceder a la opcion de listado de invitaciones de amistad
	// No se estará autenticado
	@Test
	public void PR21() {
		driver.navigate().to("https://localhost:8081/usuario/amistad");
		// Comprobamos que nos redirige a identificacion
		SeleniumUtils.textoPresentePagina(driver, "Identificación de usuario");
	}

	// PR22.
	// Acceder a la lista de amigos de otro usuario
	// Se mostrará mensaje la accion indebida
	@Test
	public void PR22() {

		driver.navigate().to("https://localhost:8081/usuario/amigos");
		// Comprobamos que nos redirige a identificacion
		SeleniumUtils.textoPresentePagina(driver, "Identificación de usuario");
	}

	// PR23.
	// Inicio de sesión con datos válidos
	@Test
	public void PR23() {
		assertTrue("PR23 sin hacer", false);
	}

	// PR24.
	// Inicio de sesión con datos inválidos
	// Usuario no existente en la aplicación
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);
	}

	// PR25.
	// Acceder a la lista de amigos de un usuario
	// Que al menos tenga tres amigos
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);
	}

	// PR26.
	// Acceder a la lista de amigos de un usuario
	// Realizar un filtrado para encontrar a un amigo por nombre
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);
	}

	// PR27
	// Acceder a la lista de mensajes de un amigo “chat”
	// La lista debe contener al menos tres mensajes.
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);
	}

	// PR028
	// Acceder a la lista de mensajes de un amigo “chat” y crear un nuevo mensaje
	// validar que mensaje aparece en la lista de mensajes
	@Test
	public void PR28() {
		assertTrue("PR29 sin hacer", false);
	}

	// PR029
	// Idenficiarse como usuario y enviar mensaje a un amigo
	// Identificarse como el otro usuario y comprobar que el mensaje ha llegado
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);
	}

	// PR030.
	// Idenficiarse como usuario y enviar 3 mensajes a un amigo
	// Identificarse como el otro usuario y comprobar que el mensaje ha llegado
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);
	}

	// PR031.
	// Idenficiarse como usuario y enviar mensaje al ultimo amigo
	// Logearse como el segundo usuario y comprobar que el chat aparece el primero
	// Logearse como un tercer usuario y enviar un mensaje al primero.
	// Loguearse como el primer usuario y comprobar que el char aparece el primero
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);
	}

}
