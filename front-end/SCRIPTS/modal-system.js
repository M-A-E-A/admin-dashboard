/**
 * Modal Management System
 * Handles opening, closing, validation, and submission of modals
 * Integrates with authentication and toast notifications
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.isAnimating = false;
        this.init();
    }

    /**
     * Initialize modal system
     */
    init() {
        this.setupModals();
        this.attachEventListeners();
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup all modals on the page
     */
    setupModals() {
        // Find all modal overlays
        const overlays = document.querySelectorAll('.modal__overlay');
        
        overlays.forEach(overlay => {
            const modal = overlay.querySelector('.modal');
            if (modal && modal.id) {
                this.modals.set(modal.id, {
                    overlay: overlay,
                    modal: modal,
                    form: modal.querySelector('form'),
                    id: modal.id
                });
            }
        });

        console.log(`✓ Modal System initialized with ${this.modals.size} modals`);
    }

    /**
     * Attach event listeners to modal elements
     */
    attachEventListeners() {
        // Close buttons
        document.querySelectorAll('.modal-close-btn, #modalClose, #modalCancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModalFromButton(btn);
            });
        });

        // Quick action buttons
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickActionClick(btn);
            });
        });

        // Modal overlay click (close on backdrop)
        this.modals.forEach((data) => {
            data.overlay.addEventListener('click', (e) => {
                if (e.target === data.overlay) {
                    this.closeModal(data.id);
                }
            });
        });

        // Form submissions
        this.modals.forEach((data) => {
            if (data.form) {
                data.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmission(data);
                });
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close active modal
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal(this.activeModal);
            }
        });
    }

    /**
     * Handle quick action button clicks
     * @param {HTMLElement} button - The button element
     */
    handleQuickActionClick(button) {
        // Check authentication
        if (button.hasAttribute('data-requires-auth')) {
            if (!window.auth?.isLoggedIn?.()) {
                this.showToast('Veuillez vous connecter pour accéder à cette fonction', 'warning');
                window.location.href = '/HTML/signin.html';
                return;
            }
        }

        const modalId = button.getAttribute('data-modal');
        if (modalId) {
            this.openModal(modalId);
        }
    }

    /**
     * Open a modal
     * @param {String} modalId - The ID of the modal to open
     */
    async openModal(modalId) {
        if (this.isAnimating) return;
        if (!this.modals.has(modalId)) {
            console.warn(`Modal not found: ${modalId}`);
            return;
        }

        const data = this.modals.get(modalId);
        this.isAnimating = true;

        // Close previous modal if any
        if (this.activeModal && this.activeModal !== modalId) {
            await this.closeModal(this.activeModal);
        }

        // Show overlay and modal
        data.overlay.hidden = false;
        data.overlay.classList.add('active');
        this.activeModal = modalId;

        // Trigger animation
        setTimeout(() => {
            data.overlay.classList.add('fade-in');
            data.modal.style.animation = 'modalSlideIn 150ms ease-out';
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        this.focusFirstFormInput(data.modal);

        setTimeout(() => {
            this.isAnimating = false;
        }, 150);
    }

    /**
     * Close a modal
     * @param {String} modalId - The ID of the modal to close
     */
    async closeModal(modalId) {
        if (this.isAnimating || !this.modals.has(modalId)) return;

        const data = this.modals.get(modalId);
        this.isAnimating = true;

        // Trigger fade-out animation
        data.overlay.classList.remove('fade-in');
        data.modal.style.animation = 'none';
        data.modal.style.opacity = '0';
        data.modal.style.transform = 'scale(0.95)';

        await new Promise(resolve => setTimeout(resolve, 150));

        // Hide overlay
        data.overlay.hidden = true;
        data.overlay.classList.remove('active');
        data.modal.style.opacity = '1';
        data.modal.style.transform = 'scale(1)';

        this.activeModal = null;

        // Restore body scroll
        document.body.style.overflow = '';

        setTimeout(() => {
            this.isAnimating = false;
        }, 150);
    }

    /**
     * Close modal from close button
     * @param {HTMLElement} button - The close button element
     */
    closeModalFromButton(button) {
        const modal = button.closest('.modal');
        if (modal) {
            this.closeModal(modal.id);
        }
    }

    /**
     * Handle form submission
     * @param {Object} data - Modal data object containing form
     */
    async handleFormSubmission(data) {
        const form = data.form;

        // Validate form
        if (!form.checkValidity()) {
            this.showToast('Veuillez remplir tous les champs', 'warning');
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData);

        console.log(`📤 Form submitted: ${data.id}`, payload);

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Traitement...';

            // Simulate API call (replace with actual API call)
            await this.simulateApiCall(data.id, payload);

            // Show success message
            this.showToast(`✓ ${this.getSuccessMessage(data.id)}`, 'success');

            // Close modal
            await this.closeModal(data.id);

            // Reset form
            form.reset();

            // Restore button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // Trigger data update event
            window.dispatchEvent(new CustomEvent('modalSubmitted', {
                detail: { modalId: data.id, data: payload }
            }));

        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('Une erreur s\'est produite', 'error');
        }
    }

    /**
     * Simulate API call (replace with actual API integration)
     * @param {String} modalId - The modal ID
     * @param {Object} payload - Form data
     */
    async simulateApiCall(modalId, payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Save to localStorage for demo purposes
                const key = `dashboard-${modalId}-${Date.now()}`;
                localStorage.setItem(key, JSON.stringify(payload));
                resolve();
            }, 800);
        });
    }

    /**
     * Get success message based on modal type
     * @param {String} modalId - The modal ID
     */
    getSuccessMessage(modalId) {
        const messages = {
            'addUserModal': 'Utilisateur ajouté avec succès',
            'createReportModal': 'Rapport créé avec succès',
            'newTransactionModal': 'Transaction enregistrée avec succès'
        };
        return messages[modalId] || 'Opération réussie';
    }

    /**
     * Show toast notification
     * @param {String} message - Message to display
     * @param {String} type - Toast type (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        const container = document.querySelector('.toast-container') || this.createToastContainer();
        container.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('toast--visible'), 10);

        // Auto hide
        setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 150);
        }, 3000);
    }

    /**
     * Create toast container if it doesn't exist
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Focus first form input
     * @param {HTMLElement} modal - Modal element
     */
    focusFirstFormInput(modal) {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 150);
        }
    }

    /**
     * Reset all modals to initial state
     */
    resetAll() {
        this.modals.forEach((data) => {
            if (data.form) {
                data.form.reset();
            }
            if (data.overlay) {
                data.overlay.hidden = true;
                data.overlay.classList.remove('active', 'fade-in');
            }
        });
        this.activeModal = null;
        document.body.style.overflow = '';
    }

    /**
     * Debug helper - log all modals
     */
    debug() {
        console.table(Array.from(this.modals.entries()).map(([id, data]) => ({
            id,
            isVisible: !data.overlay.hidden,
            hasForm: !!data.form
        })));
    }
}

// Initialize modal manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modalManager = new ModalManager();
    });
} else {
    window.modalManager = new ModalManager();
}

// Expose globally for debugging and testing
if (typeof window !== 'undefined') {
    window.ModalManager = ModalManager;
}
