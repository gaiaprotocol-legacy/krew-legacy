import { Button, DomNode, el, msg } from "common-app-module";
import KrewCommunalContract from "../contracts/KrewCommunalContract.js";
import KrewPersonalContract from "../contracts/KrewPersonalContract.js";
import KrewType from "../database-interface/KrewType.js";
import KrewService from "./KrewService.js";

export default class CreateKrewForm extends DomNode {
  private krewType: KrewType = KrewType.Personal;
  private personalSection: DomNode;
  private communalSection: DomNode;
  private createButton: Button;

  constructor() {
    super(".create-krew-form");
    this.addAllowedEvents("krewCreated");

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
          el(
            "h2",
            msg("create-krew-form-communal-krew-title"),
            el("span.comming-soon", "Coming Soon"),
          ),
          el("p", msg("create-krew-form-communal-krew-description")),
          el(
            "ul",
            el("li", msg("create-krew-form-communal-krew-feature-1")),
            el("li", msg("create-krew-form-communal-krew-feature-2")),
            el("li", msg("create-krew-form-communal-krew-feature-3")),
          ),
          //{ click: () => this.selectKrewType(KrewType.Communal) },
        ),
      ),
      this.createButton = new Button({
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
    this.createButton.title = el(".loading-spinner");

    try {
      if (this.krewType === KrewType.Personal) {
        const krewId = await KrewPersonalContract.createKrew();
        await KrewService.trackPersonalEvents();
        this.fireEvent("krewCreated", "p_" + krewId);
      } else if (this.krewType === KrewType.Communal) {
        const krewId = await KrewCommunalContract.createKrew();
        await KrewService.trackCommunalEvents();
        this.fireEvent("krewCreated", "c_" + krewId);
      }
    } catch (e) {
      console.error(e);
    }

    if (!this.deleted) {
      this.createButton.title = msg("create-krew-form-create-button");
    }
  }
}
