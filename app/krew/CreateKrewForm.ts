import { Button, DomNode, el, msg } from "common-app-module";
import KrewCommunalContract from "../contracts/KrewCommunalContract.js";
import KrewPersonalContract from "../contracts/KrewPersonalContract.js";
import KrewType from "../database-interface/KrewType.js";

export default class CreateKrewForm extends DomNode {
  private krewType: KrewType = KrewType.Personal;
  private personalSection: DomNode;
  private communalSection: DomNode;

  constructor() {
    super(".create-krew-form");
    this.append(
      el("h2", msg("create-krew-form-title")),
      el("p", msg("create-krew-form-intro")),
      el(
        ".select-krew-type",
        this.personalSection = el(
          "section.personal.selected",
          el("h2", msg("create-krew-form-personal-krew-title")),
          el("p", msg("create-krew-form-personal-krew-description")),
          el(
            "ul",
            el("li", msg("create-krew-form-personal-krew-feature-1")),
            el("li", msg("create-krew-form-personal-krew-feature-2")),
            el("li", msg("create-krew-form-personal-krew-feature-3")),
          ),
          { click: () => this.selectKrewType(KrewType.Personal) },
        ),
        this.communalSection = el(
          "section.communal",
          el("h2", msg("create-krew-form-communal-krew-title")),
          el("p", msg("create-krew-form-communal-krew-description")),
          el(
            "ul",
            el("li", msg("create-krew-form-communal-krew-feature-1")),
            el("li", msg("create-krew-form-communal-krew-feature-2")),
            el("li", msg("create-krew-form-communal-krew-feature-3")),
          ),
          { click: () => this.selectKrewType(KrewType.Communal) },
        ),
      ),
      new Button({
        tag: ".create",
        click: () => this.createKrew(),
        title: msg("create-krew-form-create-button"),
      }),
    );
  }

  private selectKrewType(type: KrewType) {
    this.krewType = type;
    if (type === KrewType.Personal) {
      this.personalSection.addClass("selected");
      this.communalSection.deleteClass("selected");
    } else {
      this.communalSection.addClass("selected");
      this.personalSection.deleteClass("selected");
    }
  }

  private async createKrew() {
    if (this.krewType === KrewType.Personal) {
      await KrewPersonalContract.createKrew();
    } else if (this.krewType === KrewType.Communal) {
      await KrewCommunalContract.createKrew();
    }
  }
}
