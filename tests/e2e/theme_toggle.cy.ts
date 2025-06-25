/// <reference types="cypress" />

describe('Theme toggle', () => {
  it('stores selected theme', () => {
    cy.visit('/liga-master');
    cy.get('[aria-label="Cambiar tema"]').click();
    cy.window().then(win => {
      const value = win.localStorage.getItem('vz_theme');
      expect(value).to.be.oneOf(['dark', 'light']);
    });
  });
});
