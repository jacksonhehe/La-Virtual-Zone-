/// <reference types="cypress" />

describe('Admin tournament management', () => {
  it('creates, starts and deletes a tournament', () => {
    cy.visit('/login');
    cy.get('input[type="text"]').first().type('admin');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuario');

    cy.visit('/admin/torneos');

    // Navigate from the dashboard to the tournaments list
    cy.contains('Próximos').click();
    cy.url().should('include', '/admin/torneos/list');

    cy.contains('button', 'Nuevo Torneo').click();

    // Step 1 - basics
    cy.get('input[placeholder="Nombre del torneo"]').type('Cypress Cup');
    cy.contains('button', 'Siguiente').click();

    // Step 2 - format
    cy.get('input[placeholder="Total de jornadas"]').clear().type('3');
    cy.contains('button', 'Siguiente').click();

    // Step 3 - schedule
    cy.contains('button', 'Siguiente').click();

    // Step 4 - confirm
    cy.contains('button', 'Crear').click();

    cy.contains('.card', 'Cypress Cup').within(() => {
      cy.get('button').eq(1).click();
      cy.contains('Activo');
      cy.get('button[title="Eliminar"]').click();
    });
    cy.contains('button', 'Eliminar').click();
    cy.contains('Cypress Cup').should('not.exist');
  });
});
