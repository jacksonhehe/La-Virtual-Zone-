/// <reference types="cypress" />

const dtUser = {
  id: '3',
  username: 'entrenador',
  role: 'dt',
  xp: 500,
  clubId: 'club4',
  status: 'active',
  notifications: true,
  lastLogin: new Date().toISOString(),
  followers: 0,
  following: 0
};

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
