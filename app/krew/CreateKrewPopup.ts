import { Alert, Button, Component, el, msg, Popup } from "common-app-module";

export default class CreateKrewPopup extends Popup {
  private krewType: string | undefined;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".popup.create-krew-popup",
        el("header", el("h1", msg("create-krew-popup-title"))),
        el(
          "main",
          el("p", msg("create-krew-popup-intro")),
          el(
            ".krew-type",
            el(
              ".personal",
              el("h2", msg("create-krew-popup-personal-krew-title")),
              el("p", msg("create-krew-popup-personal-krew-description")),
            ),
            el(
              ".communal",
              el("h2", msg("create-krew-popup-communal-krew-title")),
              el("p", msg("create-krew-popup-communal-krew-description")),
            ),
          ),
        ),
        el(
          "footer",
          new Button({
            tag: ".create",
            click: () => {
              if (!this.krewType) {
                new Alert({
                  title: msg("create-krew-popup-no-krew-type-selected-title"),
                  message: msg(
                    "create-krew-popup-no-krew-type-selected-message",
                  ),
                });
                return;
              }
              this.createKrew(this.krewType);
            },
            title: msg("create-krew-popup-create-button"),
          }),
        ),
      ),
    );
  }

  private createKrew(krewType: string) {
    // Implement the logic to create a krew based on the selected type
    console.log(`Creating a ${krewType} krew`);
    // Close the popup after creation
    this.delete();
  }
}
