// =============================================================================
//  M1 – M8  |  EASY missions (50 – 80 pts)
// =============================================================================

// ---------------------------------------------------------------------------
// M1: User Profile Page (50 pts)
// ---------------------------------------------------------------------------
describe('M1: User Profile Page (50 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
  });

  it('profile-nav-link navigates to profile-page', () => {
    cy.get('[data-testid="profile-nav-link"]').click();
    cy.get('[data-testid="profile-page"]').should('be.visible');
  });

  it('profile fields are visible and non-empty', () => {
    cy.get('[data-testid="profile-nav-link"]').click();
    cy.get('[data-testid="profile-page"]').should('be.visible');
    cy.get('[data-testid="profile-username"]').should('be.visible').invoke('text').should('not.be.empty');
    cy.get('[data-testid="profile-email"]').should('be.visible').invoke('text').should('not.be.empty');
    cy.get('[data-testid="profile-role"]').should('be.visible').invoke('text').should('not.be.empty');
    cy.get('[data-testid="profile-created-at"]').should('be.visible').invoke('text').should('not.be.empty');
    cy.get('[data-testid="profile-last-active"]').should('be.visible').invoke('text').should('not.be.empty');
  });

  it('profile-edit-button reveals profile-save-button', () => {
    cy.get('[data-testid="profile-nav-link"]').click();
    cy.get('[data-testid="profile-edit-button"]').click();
    cy.get('[data-testid="profile-save-button"]').should('be.visible');
  });

  it('password-change fields are present', () => {
    cy.get('[data-testid="profile-nav-link"]').click();
    cy.get('[data-testid="profile-password-current"]').should('exist');
    cy.get('[data-testid="profile-password-new"]').should('exist');
    cy.get('[data-testid="profile-password-confirm"]').should('exist');
    cy.get('[data-testid="profile-password-save"]').should('exist');
  });
});

// ---------------------------------------------------------------------------
// M2: Dark Mode Toggle (50 pts)
// ---------------------------------------------------------------------------
describe('M2: Dark Mode Toggle (50 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
  });

  it('dark-mode-toggle exists in the header', () => {
    cy.get('[data-testid="dark-mode-toggle"]').should('exist');
  });

  it('theme-indicator-light is visible by default', () => {
    cy.get('[data-testid="theme-indicator-light"]').should('be.visible');
  });

  it('clicking dark-mode-toggle shows theme-indicator-dark', () => {
    cy.get('[data-testid="dark-mode-toggle"]').click();
    cy.get('[data-testid="theme-indicator-dark"]').should('be.visible');
  });
});

// ---------------------------------------------------------------------------
// M3: Dashboard Bookmarks (60 pts)
// ---------------------------------------------------------------------------
describe('M3: Dashboard Bookmarks (60 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('bookmark-toggle-dashboard exists on /dashboard', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="bookmark-toggle-dashboard"]').should('exist');
  });

  it('bookmark-toggle-dashboard1 exists on /dashboard1', () => {
    cy.visit('/dashboard1');
    cy.get('[data-testid="bookmark-toggle-dashboard1"]').should('exist');
  });

  it('bookmark-toggle-dashboard2 exists on /dashboard2', () => {
    cy.visit('/dashboard2');
    cy.get('[data-testid="bookmark-toggle-dashboard2"]').should('exist');
  });

  it('clicking bookmark-toggle-dashboard1 activates bookmark-active-dashboard1', () => {
    cy.visit('/dashboard1');
    cy.get('[data-testid="bookmark-toggle-dashboard1"]').click();
    cy.get('[data-testid="bookmark-active-dashboard1"]').should('be.visible');
  });
});

// ---------------------------------------------------------------------------
// M4: CSV Export for Charts (60 pts)
// ---------------------------------------------------------------------------
describe('M4: CSV Export for Charts (60 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('at least one export-csv-* button exists on /dashboard', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid^="export-csv-"]').should('have.length.at.least', 1);
  });

  it('export-csv-quarterly-sales exists on /dashboard2', () => {
    cy.visit('/dashboard2');
    cy.get('[data-testid="export-csv-quarterly-sales"]').should('exist');
  });

  it('export-csv-budget-vs-actual exists on /dashboard2', () => {
    cy.visit('/dashboard2');
    cy.get('[data-testid="export-csv-budget-vs-actual"]').should('exist');
  });

  it('export-csv-performance exists on /dashboard2', () => {
    cy.visit('/dashboard2');
    cy.get('[data-testid="export-csv-performance"]').should('exist');
  });
});

// ---------------------------------------------------------------------------
// M5: Activity Log (80 pts)
// ---------------------------------------------------------------------------
describe('M5: Activity Log (80 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
  });

  it('sidebar-activity-link is visible for admin', () => {
    cy.get('[data-testid="sidebar-activity-link"]').should('be.visible');
  });

  it('clicking sidebar-activity-link shows activity-page and activity-table', () => {
    cy.get('[data-testid="sidebar-activity-link"]').click();
    cy.get('[data-testid="activity-page"]').should('be.visible');
    cy.get('[data-testid="activity-table"]').should('be.visible');
  });

  it('all filter controls are present on activity page', () => {
    cy.get('[data-testid="sidebar-activity-link"]').click();
    cy.get('[data-testid="activity-filter-user"]').should('exist');
    cy.get('[data-testid="activity-filter-action"]').should('exist');
    cy.get('[data-testid="activity-filter-date-from"]').should('exist');
    cy.get('[data-testid="activity-filter-date-to"]').should('exist');
  });

  it('activity-pagination exists on activity page', () => {
    cy.get('[data-testid="sidebar-activity-link"]').click();
    cy.get('[data-testid="activity-pagination"]').should('exist');
  });
});

// ---------------------------------------------------------------------------
// M6: Notification Center (50 pts)
// ---------------------------------------------------------------------------
describe('M6: Notification Center (50 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
  });

  it('notification-bell exists in the header', () => {
    cy.get('[data-testid="notification-bell"]').should('exist');
  });

  it('clicking notification-bell opens notification-dropdown', () => {
    cy.get('[data-testid="notification-bell"]').click();
    cy.get('[data-testid="notification-dropdown"]').should('be.visible');
  });

  it('notification-mark-all-read and notification-clear-all exist in dropdown', () => {
    cy.get('[data-testid="notification-bell"]').click();
    cy.get('[data-testid="notification-dropdown"]').within(() => {
      cy.get('[data-testid="notification-mark-all-read"]').should('exist');
      cy.get('[data-testid="notification-clear-all"]').should('exist');
    });
  });
});

// ---------------------------------------------------------------------------
// M7: Dashboard Filter Persistence (50 pts)
// ---------------------------------------------------------------------------
describe('M7: Dashboard Filter Persistence (50 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/dashboard1');
  });

  it('filter-metric, filter-date-from and filter-date-to exist on /dashboard1', () => {
    cy.get('[data-testid="filter-metric"]').should('exist');
    cy.get('[data-testid="filter-date-from"]').should('exist');
    cy.get('[data-testid="filter-date-to"]').should('exist');
  });

  it('filter-reset-button exists on /dashboard1', () => {
    cy.get('[data-testid="filter-reset-button"]').should('exist');
  });
});

// ---------------------------------------------------------------------------
// M8: Breadcrumb Navigation (60 pts)
// ---------------------------------------------------------------------------
describe('M8: Breadcrumb Navigation (60 pts)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/dashboard1');
  });

  it('breadcrumb-bar is visible on an authenticated page', () => {
    cy.get('[data-testid="breadcrumb-bar"]').should('be.visible');
  });

  it('breadcrumb-home and breadcrumb-current exist inside breadcrumb-bar', () => {
    cy.get('[data-testid="breadcrumb-bar"]').within(() => {
      cy.get('[data-testid="breadcrumb-home"]').should('exist');
      cy.get('[data-testid="breadcrumb-current"]').should('exist');
    });
  });
});
