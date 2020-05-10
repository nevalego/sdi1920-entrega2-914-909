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

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class NotaneitorTests {
	// En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas)):
	// Rutas Miguel
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "D:\\Universidad\\SDI\\Pruebas Selenium\\geckodriver024win64.exe";
	// Rutas Nerea
	// static String PathFirefox65 = "/Archivos de programa/Mozilla
	// Firefox/firefox.exe";
	// static String Geckdriver024 = "/Users/nerea/Documents/2 SEMESTRE/SDI/5. Web
	// testing con
	// Selenium/PL-SDI-Sesi�n5-material/PL-SDI-Sesi�n5-material/geckodriver024win64.exe";

	// Común a Windows y a MACOSX
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
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		// PO_View.setTimeout(3);

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01.
	// Registro de Usuario con datos v�lidos
	@Test
	public void PR01() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_RegisterView.fillForm(driver, "prueba@hotmail.com", "Prueba", "Prueba", "123456", "123456");
		// Comprobamos que nos dan un mensaje de registro realizado
		PO_View.checkElement(driver, "text", "Usuario registrado correctamente");
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la secci�n privada
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
		// Rellenamos el formulario con contrase�a vacia.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "Prueba2", "", "123456");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Rellenamos el formulario con recontrase�a vacia.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "Prueba2", "123456", "");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");
		// Dejamos el formulario vacio.
		PO_RegisterView.fillForm(driver, "", "", "", "", "");
		SeleniumUtils.textoPresentePagina(driver, "Registrar usuario");

	}

	// PR03.
	// Resitro de usuario con datos invalidos
	// contrase�a invalida repetida
	@Test
	public void PR03() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con contrase�a repetida erronea.
		PO_RegisterView.fillForm(driver, "prueba2@hotmail.com", "Prueba2", "Prueba2", "123456", "222222");
		PO_View.checkElement(driver, "text", "Las contrase�as no coinciden");
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
	// Inicio de sesi�n con datos v�lidos
	// Usuario estandar
	@Test
	public void PR05() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la secci�n privada
		PO_View.checkElement(driver, "text", "Usuarios");
	}

	// PR06.
	// Inicio de sesi�n con datos inv�lidos
	// email y contrase�a vacios
	@Test
	public void PR06() {
		PO_LoginView.fillForm(driver, "", "123456");
		// Comprobamos que seguimos en la pagina
		SeleniumUtils.textoPresentePagina(driver, "Identificaci�n de usuario");
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "");
		// Comprobamos que seguimos en la pagina
		SeleniumUtils.textoPresentePagina(driver, "Identificaci�n de usuario");

	}

	// PR07.
	// Inicio de sesi�n con datos inv�lidos
	// Contrase�a incorrecta
	@Test
	public void PR07() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "2222222");
		// Comprobamos que seguimos en la pagina
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}

	// PR08.
	// Inicio de sesi�n con datos inv�lidos
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
		// Comprobamos que entramos en la secci�n privada
		PO_View.checkElement(driver, "text", "Usuarios");
		PO_HomeView.clickOption(driver, "/desconectarse", "class", "btn btn-primary");
		PO_View.checkElement(driver, "text", "Identificaci�n de usuario");
		SeleniumUtils.textoNoPresentePagina(driver, "Usuarios");

	}

	// PR10.
	// Boton cerrar sesion no visible si no esta loggeado
	@Test
	public void PR10() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la secci�n privada
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
		// Comprobamos que entramos en la secci�n privada
		PO_View.checkElement(driver, "text", "Usuarios");

		// Clickamos segunda pagina
		PO_UserListView.clickPagination(driver, 2);

		// Comprobamos que son visibles todos los usuarios
		SeleniumUtils.textoPresentePagina(driver, "prueba@hotmail.com");

	}

	// PR12.
	// Busqueda de campo vacio
	// Se muestra todo
	@Test
	public void PR12() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la secci�n privada
		PO_View.checkElement(driver, "text", "Usuarios");
		PO_UserListView.makeASearch(driver, "");
		SeleniumUtils.textoPresentePagina(driver, "Prueba");
	}

	// PR13.
	// Busqueda con nombre inexistente
	// No muestra nada
	@Test
	public void PR13() {
		PO_LoginView.fillForm(driver, "prueba@hotmail.com", "123456");
		// Comprobamos que entramos en la secci�n privada
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
		assertTrue("PR14 sin hacer", false);
	}

	// PR15.
	// Enviar solicitud de amistad y comprobar que existe
	@Test
	public void PR15() {
		assertTrue("PR15 sin hacer", false);
	}

	// PR16.
	// Enviar amistad a un usuario al que ya se envio una
	@Test
	public void PR16() {
		assertTrue("PR16 sin hacer", false);
	}

	// PR017.
	// Listar invitaciones de amistad
	@Test
	public void PR17() {
		assertTrue("PR17 sin hacer", false);
	}

	// PR18.
	// Aceptar amistad y comprobar que desaparece
	@Test
	public void PR18() {
		assertTrue("PR18 sin hacer", false);
	}

	// PR19.
	// Mostrar listado de amistades
	@Test
	public void PR19() {
		assertTrue("PR19 sin hacer", false);
	}

	// P20.
	// Acceder a la opcion a lista de de usuarios
	// No se estar� autenticado
	@Test
	public void PR20() {
		assertTrue("PR20 sin hacer", false);
	}

	// PR21.
	// Acceder a la opcion de listado de invitaciones de amistad
	// No se estar� autenticado
	@Test
	public void PR21() {
		assertTrue("PR21 sin hacer", false);
	}

	// PR22.
	// Acceder a la lista de amigos de otro usuario
	// Se mostrar� mensaje la accion indebida
	@Test
	public void PR22() {
		assertTrue("PR22 sin hacer", false);
	}

	// PR23. Sin hacer /
	@Test
	public void PR23() {
		assertTrue("PR23 sin hacer", false);
	}

	// PR24. Sin hacer /
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);
	}

	// PR25. Sin hacer /
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);
	}

	// PR26. Sin hacer /
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);
	}

	// PR27. Sin hacer /
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);
	}

	// PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);
	}

	// PR030. Sin hacer /
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);
	}

	// PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);
	}

}
