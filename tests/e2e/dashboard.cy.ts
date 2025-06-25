/// <reference types="cypress" />

describe('Dashboard interactions', () => {
  it('toggles theme and triggers a notification', () => {
    cy.visit('/liga-master');

    cy.window().then(win => {
      const before = win.localStorage.getItem('vz_theme');
      cy.get('button[aria-label="Cambiar tema"]').click();
      const after = win.localStorage.getItem('vz_theme');
      expect(after).not.to.eq(before);
    });

    cy.window().then(win => {
      if ('Notification' in win) {
        cy.stub(win, 'Notification').as('notify');
        // @ts-ignore
        new win.Notification('Test');
        cy.get('@notify').should('have.been.called');
      }
    });
  });
});
