/// <reference types="cypress" />

describe('Liga Master public access', () => {
  it('shows public information when visiting without login', () => {
    cy.visit('/liga-master');

    cy.contains('h2', 'Clasificación').should('be.visible');
    cy.contains('h2', 'Accesos Rápidos').should('be.visible');
  });

  it('does not render DT dashboard elements', () => {
    cy.visit('/liga-master');

    cy.contains('DT:').should('not.exist');
    cy.contains('button', 'Plantilla').should('not.exist');
    cy.contains('button', 'Mercado').should('not.exist');
  });
});
