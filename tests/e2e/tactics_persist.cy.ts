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

describe('Tactics pitch', () => {
  it('persists player positions', () => {
    cy.visit('/liga-master/tacticas');

    // Example drag action assuming draggable players and pitch slots exist
    cy.get('[data-cy="player"]').first().trigger('dragstart');
    cy.get('[data-cy="pitch-slot"]').first().trigger('drop');

    cy.reload();
  });
});
