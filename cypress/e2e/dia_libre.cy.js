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

     // Ir a la lista de solicitudes
    cy.visit('https://demo.dolibarr.org/holiday/list.php');

    // Seleccionar el usuario apiuser
    cy.get('#select2-search_employee-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();

    // Hacer clic en el botón de buscar
    cy.get('button[name="button_search_x"]').click();

    // Esperar a que el checkbox esté visible y seleccionarlo si está disponible
    cy.get('input#checkforselects').should('be.visible').check();

    // Esperar a que el menú de acciones masivas esté visible
    cy.get('#select2-massaction-container').should('be.visible').click();
    
    // Elegir "Eliminar" en el menú de acciones masivas
    cy.contains('.select2-results__option', 'Eliminar').click();

    // Confirmar la eliminación
    cy.get('input[name="confirmmassaction"]').click();

    // Seleccionar "Sí" en la confirmación de eliminación
    cy.get('select#confirm').should('be.visible').select('yes');

    // Confirmar la eliminación final
    cy.get('input.confirmvalidatebutton').should('be.visible').click();

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

  it('CP02 - Campo "Tipo" vacío (clase inválida)', () => {
    // Ingresar al formulario de nueva solicitud
    cy.contains('Nuevo').click();
  
    // Verificar que se está en el formulario
    cy.url().should('include', 'holiday/card.php');
  
    // Seleccionar representante válido
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Omitir la selección del campo "Tipo" para provocar el error
  
    // Seleccionar fechas de inicio y fin
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    // Seleccionar Revisador
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Agregar comentario en el iframe
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Intento sin seleccionar tipo.');
    });
  
    // Intentar enviar el formulario
    cy.get('input[name="save"]').click();
  
    // Verificar mensaje de error
    cy.get('.jnotify-message').should('contain.text', "El campo 'Tipo' es obligatorio");
  });
  
  it('CP03 - Fecha fin anterior a fecha de inicio', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Ingresar fecha de inicio: 06/05/2025 y fecha de fin: 05/05/2025 manualmente
    cy.get('input[id="date_debut_"]').clear().type('06/05/2025');
    cy.get('input[id="date_fin_"]').clear().type('05/05/2025');
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicito este día libre por motivos personales.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Verificar mensaje de error
    cy.get('.jnotify-message div').should('contain', 'Debe indicar una fecha de fin superior a la fecha de inicio.');
  });
  
  it('CP04 - Formato de fecha inválido (mes inexistente)', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    // Representante válido
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Tipo válido
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Ingresar fechas no válidas (mes 15 no existe)
    cy.get('#date_debut_').clear().type('05/15/2025');
    cy.get('#date_fin_').clear().type('05/15/2025');
  
    // Revisador válido
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Comentario
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicitud con fecha inválida.');
    });
  
    // Enviar
    cy.get('input[name="save"]').click();
  
    // Verificar errores
    cy.get('.jnotify-message').should('contain', 'Debe indicar una fecha de inicio.');
    cy.get('.jnotify-message').should('contain', 'Debe indicar una fecha de fin.');
  });
  
  it('CP05 - Intervalo inválido (Tarde a Mañana)', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    // Representante válido
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Tipo válido
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Fechas como "Ahora"
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    // Medio día inicio: Tarde
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    // Medio día fin: Mañana
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    // Revisador válido
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Comentario
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicito un día sin días hábiles.');
    });
  
    // Enviar
    cy.get('input[name="save"]').click();
  
    // Verificar mensaje de error
    cy.get('.jnotify-message').should('contain', 'Su petición de días libres no contiene ningún día hábil');
  });
  
  it('CP06 - Rango de fechas en fin de semana (clase inválida)', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    cy.get('input[id="date_debut_"]').clear().type('10/05/2025');
    cy.get('input[id="date_fin_"]').clear().type('11/05/2025');
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicito días libres en fin de semana.');
    });
  
    cy.get('input[name="save"]').click();
  
    cy.get('.jnotify-message div').should('contain', 'Su petición de días libres no contiene ningún día hábil');
  });
  
  it('CP07 - Solicitud válida con fechas iguales y jornada completa', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Establecer misma fecha para inicio y fin
    cy.get('input[id="date_debut_"]').clear().type('06/05/2025');
    cy.get('input[id="date_fin_"]').clear().type('06/05/2025');
  
    // Jornada de inicio: Mañana, Jornada de fin: Tarde
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Día completo con jornada desde mañana hasta tarde.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Como fue exitosa, eliminar
    cy.get('a.butActionDelete').click();
    cy.get('button.ui-button').contains('Sí').should('be.visible').click();
  });
  
  it('CP08 - Fecha de inicio anterior al día actual (valor inválido)', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Fecha en el pasado
    cy.get('input[id="date_debut_"]').clear().type('01/01/2024');
    cy.get('input[id="date_fin_"]').clear().type('02/01/2024');
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicito días retroactivos.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Validación: debería haber algún error, pero el sistema lo permite (test muestra falla funcional)
    cy.get('.jnotify-message').should('exist');
  
    // Como fue aceptada, deberia limpiar el entorno eliminando la solicitud, pero no lo hara ya que fallara en la linea anterior
    cy.get('a.butActionDelete').click();
    cy.get('button.ui-button').contains('Sí').should('be.visible').click();
  });
  
  it('CP09 - Campo de fecha de inicio vacío', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Dejar el campo de fecha de inicio vacío
    cy.get('#date_fin_ButtonNow').click();
  
    // Hora de inicio: Mañana, Hora de fin: Tarde
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Esperar a que el iframe esté cargado
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicitud sin fecha de inicio.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Verificar que aparece una alerta con el mensaje de error
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Debe indicar una fecha de inicio.');
    });
  });
  
  it('CP10 - Campo de fecha de fin vacío', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Establecer fecha de inicio válida
    cy.get('#date_debut_ButtonNow').click();
  
    // Dejar el campo de fecha de fin vacío
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Esperar a que el iframe esté cargado
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicitud sin fecha de fin.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Verificar que aparece una alerta con el mensaje de error
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Debe indicar una fecha de fin.');
    });
  });
  
  it('CP11 - Campo de aprobador vacío', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Fechas válidas
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    // Hora de inicio y fin
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    // Dejar el campo de aprobador vacío
  
    // Descripción
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicitud sin aprobador.');
    });
  
    // Enviar solicitud
    cy.get('input[name="save"]').click();
  
    // Verificar que aparece alerta
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Debe elegir el aprobador para su solicitud de licencia.');
    });
  });
  
  it('CP12 - Campo de descripción vacío', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Fechas válidas
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    // Hora de inicio y fin válidas
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // No se llena la descripción
  
    // Guardar solicitud
    cy.url().then((urlAntes) => {
      cy.get('input[name="save"]').click();
      cy.wait(1000); // esperar breve momento por si hay cambio
      cy.url().should('eq', urlAntes); // verificar que la URL no cambió
    });
  });
  
  it('CP13 - Descripción con script malicioso', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Fechas válidas
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Ingresar script malicioso
    const maliciousScript = '<script>alert("XSS")</script>';
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type(maliciousScript, { parseSpecialCharSequences: false });
    });
  
    cy.get('input[name="save"]').click();
  
    // Esperar brevemente y verificar si la URL cambió (lo que no debería pasar si hay validación)
    cy.url().should('include', 'holiday/card'); // si cambia, probablemente se creó
  });
  
  it('CP14 - Descripción demasiado larga', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Generar una descripción de más de 500 caracteres
    const longText = 'A'.repeat(600);
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type(longText);
    });
  
    cy.get('input[name="save"]').click();
  
    // Verificar el notify message de error por límite excedido
    cy.get('.jnotify-message').should('contain.text', 'Data too long for column');
  });
  
  it('CP15 - Cancelar la solicitud con todos los campos llenos', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicitud de prueba que será cancelada.');
    });
  
    // Clic en el botón "Anular"
    cy.get('input[name="cancel"]').click();
  
    // Validar redirección al listado
    cy.url().should('include', 'holiday/list.php');
  });
  
  it('CP16 - El usuario intenta seleccionarse a sí mismo como aprobador', () => {
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    // Seleccionar usuario: apiuser
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Tipo de permiso: Otra petición
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    // Fechas válidas
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    // Medio día inicio: Mañana
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    // Medio día fin: Tarde
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    // Aprobador: apiuser (el mismo que el solicitante)
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    // Descripción válida
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Intento de autoaprobación.');
    });
  
    // Guardar solicitud
    cy.url().then((urlAntes) => {
    cy.get('input[name="save"]').click();
    cy.wait(1000); // esperar breve momento por si hay cambio
    cy.url().should('eq', urlAntes); // verificar que la URL no cambió
    });
  });
  
  it('CP17 - Duplicación de solicitud para el mismo período (clase inválida)', () => {
    // Primer intento: solicitud válida
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    cy.get('input[id="date_debut_"]').clear().type('12/05/2025');
    cy.get('input[id="date_fin_"]').clear().type('13/05/2025');
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Primera solicitud del rango.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Segunda solicitud con el mismo rango
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    cy.get('input[id="date_debut_"]').clear().type('12/05/2025');
    cy.get('input[id="date_fin_"]').clear().type('13/05/2025');
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Segunda solicitud idéntica.');
    });
  
    cy.get('input[name="save"]').click();
  
    cy.get('.jnotify-message div').should('contain', 'Ya se ha efectuado una petición de días libres para este periodo.');
  });
  
  it('CP18 - Intento de eliminación de solicitud no permitida', () => {
    cy.visit('https://demo.dolibarr.org/holiday/list.php');
  
    // Seleccionar usuario David Doe
    cy.get('#select2-search_employee-container').click();
    cy.get('.select2-search__field').type('David Doe');
    cy.contains('.select2-results__option', 'David Doe').click();
    cy.get('button[name="button_search_x"]').click();
  
    // Marcar la casilla de selección
    cy.get('input#checkforselects').check();
  
    // Elegir acción "Eliminar"
    cy.get('#select2-massaction-container').click();
    cy.get('.select2-results__option').contains('Eliminar').click();
  
    // Confirmar la acción
    cy.get('input[name="confirmmassaction"]').click();
    cy.get('select#confirm').select('Sí');
    cy.get('input.confirmvalidatebutton').click();
  
    // Verificar mensaje
    cy.get('.jnotify-message div').should('contain', 'debe ser borrador, cancelada o rechazada para ser eliminada');
  });
  
  it('CP19 - Eliminación exitosa desde el listado', () => {
    // Paso 1: Crear una solicitud válida
    cy.contains('Nuevo').click();
    cy.url().should('include', 'holiday/card.php');
  
    cy.get('#select2-fuserid-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.get('#select2-type-container').click();
    cy.get('.select2-search__field').type('Otra petición');
    cy.contains('.select2-results__option', 'Otra petición').click();
  
    cy.get('#date_debut_ButtonNow').click();
    cy.get('#date_fin_ButtonNow').click();
  
    cy.get('#select2-starthalfday-container').click();
    cy.contains('.select2-results__option', 'Mañana').click();
  
    cy.get('#select2-endhalfday-container').click();
    cy.contains('.select2-results__option', 'Tarde').click();
  
    cy.get('#select2-valideur-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
  
    cy.frameLoaded('iframe.cke_wysiwyg_frame.cke_reset');
    cy.get('iframe.cke_wysiwyg_frame').then($iframe => {
      const body = $iframe.contents().find('body');
      cy.wrap(body).click().type('Solicitud para prueba de eliminación.');
    });
  
    cy.get('input[name="save"]').click();
  
    // Paso 2: Ir al listado
    cy.visit('https://demo.dolibarr.org/holiday/list.php');
  
    // Paso 3: Filtrar por apiuser
    cy.get('#select2-search_employee-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
    cy.get('button[name="button_search_x"]').click();
  
    // Paso 4: Seleccionar todas
    cy.get('input#checkforselects').check();
  
    // Paso 5: Elegir acción "Eliminar"
    cy.get('#select2-massaction-container').click();
    cy.contains('.select2-results__option', 'Eliminar').click();
  
    // Paso 6: Confirmar acción
    cy.get('input[name="confirmmassaction"]').click();
    cy.get('select#confirm').select('Sí');
    cy.get('input.confirmvalidatebutton').click();
  
    // Verificar mensaje de éxito
    cy.get('.jnotify-message div').should('contain', 'Registro eliminado');
  });
  
  it('CP20 - Cancelación de eliminación desde listado', () => {
    // Ir al listado
    cy.visit('https://demo.dolibarr.org/holiday/list.php');
  
    // Filtrar por apiuser
    cy.get('#select2-search_employee-container').click();
    cy.get('.select2-search__field').type('apiuser');
    cy.contains('.select2-results__option', 'apiuser').click();
    cy.get('button[name="button_search_x"]').click();
  
    // Seleccionar todas las solicitudes
    cy.get('input#checkforselects').check();
  
    // Elegir acción "Eliminar"
    cy.get('#select2-massaction-container').click();
    cy.contains('.select2-results__option', 'Eliminar').click();
  
    // Confirmar eliminación
    cy.get('input[name="confirmmassaction"]').click();
  
    // Seleccionar "No" en el select de confirmación
    cy.get('select#confirm').select('No');
  
    // Validar
    cy.get('input.confirmvalidatebutton').click();
  
    // Verificar que NO aparece mensaje de eliminación
    cy.get('.jnotify-message div').should('not.exist');
  
    // Verificar que permanece en la URL del listado
    cy.url().should('include', '/holiday/list.php');
  });
  
});
