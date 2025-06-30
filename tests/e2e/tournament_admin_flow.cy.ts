/// <reference types="cypress" />

describe('Admin tournament management', () => {
  it('creates, starts and deletes a tournament', () => {
    cy.visit('/login');
    cy.get('input[type="text"]').first().type('admin');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuario');

    cy.visit('/admin/torneos');

    cy.contains('button', 'Nuevo Torneo').click();
    cy.get('input[placeholder="Nombre del torneo"]').type('Cypress Cup');
    cy.get('input[placeholder="Total de jornadas"]').clear().type('3');
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
