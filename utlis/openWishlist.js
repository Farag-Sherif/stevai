export const openWistlistModal = async () => {
  try {
    const bootstrap = await import("bootstrap");
    const wishlistEl = document.getElementById("wishlist");
    if (!wishlistEl) return; // Modal not mounted yet (e.g. dynamic import)

    // Hide other modals and offcanvas first
    document.querySelectorAll(".modal.show").forEach((modal) => {
      const instance = bootstrap.Modal.getInstance(modal);
      if (instance) instance.hide();
    });
    document.querySelectorAll(".offcanvas.show").forEach((el) => {
      const instance = bootstrap.Offcanvas.getInstance(el);
      if (instance) instance.hide();
    });

    // Reuse existing instance or create new one
    let myModal = bootstrap.Modal.getInstance(wishlistEl);
    if (!myModal) {
      myModal = new bootstrap.Modal(wishlistEl, { keyboard: false, backdrop: true });
    }
    myModal.show();
  } catch (e) {
    console.warn("Could not open wishlist modal:", e);
  }
};
