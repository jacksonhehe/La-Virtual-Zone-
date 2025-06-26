/// <reference types="cypress" />

describe('Player table sorting and filtering', () => {
  beforeEach(() => {
    cy.visit('/liga-master/plantilla');
  });

  it('filters players by search term', () => {
    cy.get('[data-cy="player-search"]').type('juan');
    cy.get('tbody tr').should('have.length', 1).first().contains('Juan Pérez');
  });

  it('sorts players by name when header clicked', () => {
    cy.get('[data-cy="sort-name"]').click();
    cy.get('tbody tr').first().contains('Carlos Sánchez');
    cy.get('[data-cy="sort-name"]').click();
    cy.get('tbody tr').first().contains('Juan Pérez');
  });
});
