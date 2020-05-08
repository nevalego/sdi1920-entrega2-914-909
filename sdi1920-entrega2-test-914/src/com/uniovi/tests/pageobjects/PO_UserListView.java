package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_UserListView extends PO_NavView {

	public static void makeASearch(WebDriver driver, String textToSearch) {
		WebElement search = driver.findElement(By.id("searchText"));
		search.click();
		search.clear();
		search.sendKeys(textToSearch);

		// Pulsamos para realizar la busqueda
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "id", "btnSearch", getTimeout());
		elementos.get(0).click();
	}
	
	public static void addFriend(WebDriver driver, String friendName) {
				List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "id", "btnAddFriend"+friendName, getTimeout());
				elementos.get(0).click();
	}

	static public void checkUserListText(WebDriver driver, int language) {
		// Esperamos a que se cargue el titulos de la página
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.title", language));
		// Esperamos a que se cargue el texto de la página
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.message", language));

		// Esperamos a que se cargue la columna nombre
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.name", language));
		// Esperamos a que se cargue la columna apellidos
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.surname", language));
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.email", language));
		// Esperamos a que se cargue las opciones añadir amigos
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.addFriend", language));
		// Esperamos a que se cargue el footer
		SeleniumUtils.textoPresentePagina(driver, p.getString("footer.message", language));
	}

	static public void checkUserListChangeIdiom(WebDriver driver, String textIdiom1, String textIdiom2, int locale1,
			int locale2) {
		// Esperamos a que se cargue el saludo de bienvenida en Español
		checkUserListText(driver, locale1);
		// Cambiamos a segundo idioma
		changeIdiom(driver, textIdiom2);
		// COmprobamos que el texto de bienvenida haya cambiado a segundo idioma
		checkUserListText(driver, locale2);
		// Volvemos a Español.
		changeIdiom(driver, textIdiom1);
		// Esperamos a que se cargue el saludo de bienvenida en Español
		checkUserListText(driver, locale1);
	}
}
