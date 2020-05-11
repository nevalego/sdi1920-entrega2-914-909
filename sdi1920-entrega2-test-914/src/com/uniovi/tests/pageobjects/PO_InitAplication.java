package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_InitAplication extends PO_NavView{
	private static String URLBorrado = "https://localhost:8081/api/eliminarColeccion?coleccion=";
	
	static public void reiniciarBBDD(WebDriver driver, String bbdd) {
		driver.navigate().to(URLBorrado+bbdd);
	}

	public static void insertUsers(WebDriver driver) {
		for(int i = 0; i<10; i++) {
			PO_HomeView.clickOption(driver, "/registrarse", "class", "btn btn-primary");
			PO_RegisterView.fillForm(driver, "prueba"+i+"@email.com", "Prueba"+i, i+"Prueba", "123456", "123456");
		}
	}
	
	public static void insertAmistades(WebDriver driver) {
		for(int i = 9; i>5; i--) {
			insertAmistadesFrom(driver, i);
		}
	}
	
	public static void insertMensajes(WebDriver driver) {
		driver.navigate().to("https://localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "prueba2@hotmail.com", "123456");
		// Comprobamos que entramos en la sección privada
		PO_View.checkElement(driver, "text", "Cerrar sesión");
		// Comprobamos que estamos en la lista de sus amigos		
		PO_NavView.checkNavMode(driver, "navAmigos");
		SeleniumUtils.textoPresentePagina(driver, "Amigos");
		// Abrir conversación
		driver.findElement(By.id("abrirConversacion")).click();
		// Escribir mensajes
		driver.findElement(By.id("agregar-mensaje")).sendKeys("Hola, ¿que tal?");
		driver.findElement(By.id("boton-enviar")).click();
		driver.findElement(By.id("boton-enviar")).click();
		driver.findElement(By.id("agregar-mensaje")).sendKeys("Me llamo Julia");
		driver.findElement(By.id("boton-enviar")).click();
		driver.findElement(By.id("agregar-mensaje")).sendKeys("¿ Y tu?");
		driver.findElement(By.id("boton-enviar")).click();
		
	}
	
	public static void aceptarAmistades(WebDriver driver, int user) {
		PO_LoginView.fillForm(driver, "prueba"+user+"@email.com", "123456");
		for(int i = 6; i<10; i++) {
			PO_NavView.checkNavMode(driver, "mPeticionesAmistad");
			PO_FriendsView.aceptFriendRequest(driver,"prueba"+i+"@email.com");
		}
	}
	
	private static void insertAmistadesFrom(WebDriver driver, int from) {
		PO_LoginView.fillForm(driver, "prueba"+from+"@email.com", "123456");
		for(int i = 1; i<5; i++) {
			PO_FriendsView.sendFriendRequest(driver, "prueba"+i+"@email.com");
		}
		PO_HomeView.clickOption(driver, "/desconectarse", "class", "btn btn-primary");
	}
	
	
}
