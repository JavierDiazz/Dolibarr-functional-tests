import 'cypress-iframe';

describe('RRHH - Día Libre | Dolibarr', () => {

  beforeEach(() => {
    // Ir a la página principal de demos
    cy.visit('https://demo.dolibarr.org/public/demo/index.php');

    // Hacer clic en la empresa deseada
    cy.contains('Company manufacturing products').click();

    // Ingresar credenciales
    // cy.get('#username').clear().type('demo');
    cy.get('#password').clear().type('demo');
    cy.get('input[type="submit"].button').click();

    // Ir al módulo de RRHH > Día Libre
    cy.contains('RRH').click();
  });

  it('CP01 - Crear solicitud de día libre con representante válido', () => {
    // Ingresar al formulario de nueva solicitud
    cy.contains('Nuevo').click();

    // Verificar que se está en el formulario
    cy.url().should('include', 'holiday/card.php');

    // Abrir el dropdown del select2 (representante)
    cy.get('#select2-fuserid-container').click();

    // Buscar el nombre del representante
    cy.get('.select2-search__field').type('apiuser');

    // Seleccionar el resultado
    cy.contains('.select2-results__option', 'apiuser').click();

    // Seleccionar tipo de día libre
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();

    // Ingresar fecha de inicio y fin
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
    // cy.get('input[id="date_debut_"]').clear().type('05/05/2025');
    // cy.get('input[id="date_fin_"]').clear().type('06/05/2025');

    // Seleccionar Revisador
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();

    // Esperar a que el iframe esté cargado
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');

    // Agregar comentario
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicito este día libre por motivos personales.');
    });

    // Enviar el formulario
    cy.get('input[name="save"]').click();

    // Si fue creada exitosamente, nos redirige a la vista de la petición, donde la eliminaremos parra dejar espacio a mas tests.
    cy.get('a.butActionDelete').click();

    cy.get('button.ui-button').contains('Sí').should('be.visible').click();
  });

});
