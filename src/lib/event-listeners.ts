import { menuController } from "@ionic/core";

window.addEventListener("keypress", (e) => {
  if (e.ctrlKey && e.key === "p")
    menuController
      .isOpen()
      .then((isOpen) =>
        isOpen ? menuController.close() : menuController.open()
      );
});
