describe('App', () => {
  it('Loads successfully', () => {
    cy.visit('/');

    cy.get('main').should('be.visible');
  });
});
