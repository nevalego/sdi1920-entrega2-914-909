package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_FriendsView extends PO_NavView {

	public static void aceptInvitation(WebDriver driver, String friendName) {
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "id", "btnAceptInvitation"+friendName, getTimeout());
		elementos.get(0).click();
}
	public static void seeFriendsDetails(WebDriver driver, String friendName) {
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "id", "btnFriendDetails"+friendName, getTimeout());
		elementos.get(0).click();
}
	
	
	static public void checkMyInvitationsText(WebDriver driver, int language) {
		// Esperamos a que se cargue el titulos de la página
		SeleniumUtils.textoPresentePagina(driver, p.getString("invitation.title", language));
		// Esperamos a que se cargue el texto de la página
		SeleniumUtils.textoPresentePagina(driver, p.getString("invitation.message", language));

		// Esperamos a que se cargue el boton de busqueda
		SeleniumUtils.textoPresentePagina(driver, p.getString("invitation.accept", language));
		// Esperamos a que se cargue la columna email
		SeleniumUtils.textoPresentePagina(driver, p.getString("pagination.init", language));

		// Esperamos a que se cargue la columna nombre
		SeleniumUtils.textoPresentePagina(driver, p.getString("pagination.end", language));

		// Esperamos a que se cargue la columna nombre
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.name", language));
		// Esperamos a que se cargue la columna apellidos
		SeleniumUtils.textoPresentePagina(driver, p.getString("users.surname", language));

		SeleniumUtils.textoPresentePagina(driver, p.getString("users.surname", language));

		// Esperamos a que se cargue el footer
		SeleniumUtils.textoPresentePagina(driver, p.getString("footer.message", language));
	}

	static public void checkMyInvitationsListChangeIdiom(WebDriver driver, String textIdiom1, String textIdiom2,
			int locale1, int locale2) {
		// Esperamos a que se cargue el saludo de bienvenida en Español
		checkMyInvitationsText(driver, locale1);
		// Cambiamos a segundo idioma
		changeIdiom(driver, textIdiom2);
		// COmprobamos que el texto de bienvenida haya cambiado a segundo idioma
		checkMyInvitationsText(driver, locale2);
		// Volvemos a Español.
		changeIdiom(driver, textIdiom1);
		// Esperamos a que se cargue el saludo de bienvenida en Español
		checkMyInvitationsText(driver, locale1);
	}

}
