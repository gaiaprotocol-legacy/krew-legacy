import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  msg,
  Popup,
  Router,
  Tabs,
} from "common-app-module";
import { ethers } from "ethers";
import KrewCommunalContract from "../contracts/KrewCommunalContract.js";
import KrewPersonalContract from "../contracts/KrewPersonalContract.js";
import Krew from "../database-interface/Krew.js";
import PreviewKrew from "../database-interface/PreviewKrew.js";
import BuyKeyPopup from "../key/BuyKeyPopup.js";
import SellKeyPopup from "../key/SellKeyPopup.js";
import MaterialIcon from "../MaterialIcon.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import KrewUserService from "../user/KrewUserService.js";
import EditKrewPopup from "./EditKrewPopup.js";
import KrewActivityList from "./KrewActivityList.js";
import KrewHolderList from "./KrewHolderList.js";
import KrewService from "./KrewService.js";
import KrewUtil from "./KrewUtil.js";

export default class KrewPopup extends Popup {
  private krew: Krew | undefined;

  private editButton: DomNode;
  private holderCountDisplay: DomNode;
  private priceDisplay: DomNode;
  private balanceDisplay: DomNode;

  private ownerDisplay: DomNode | undefined;
  private ownerProfileImage: DomNode | undefined;
  private ownerName: DomNode | undefined;
  private ownerXUsername: DomNode | undefined;

  private tabs: Tabs;
  private holderList: KrewHolderList;
  private activityList: KrewActivityList;

  constructor(private krewId: string, previewKrew?: PreviewKrew) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.krew-popup",
        el(
          "header",
          el(".krew-image", {
            style: {
              backgroundImage: `url(${previewKrew?.image})`,
            },
          }),
          el(
            "h1",
            previewKrew ? KrewUtil.getName(previewKrew) : "...",
            el("span.id", "ID: #" + krewId.substring(2)),
          ),
          this.editButton = el("a.edit.hidden", new MaterialIcon("edit"), {
            click: () => {
              new EditKrewPopup(krewId, previewKrew);
              this.delete();
            },
          }),
        ),
        this.krewId.startsWith("p_")
          ? this.ownerDisplay = el(
            ".owner",
            el("h3", msg("krew-popup-owner-label")),
            el(
              ".info-container",
              this.ownerProfileImage = el(".profile-image"),
              el(
                ".info",
                this.ownerName = el(".name", "..."),
                this.ownerXUsername = el(".x-username", "..."),
              ),
            ),
          )
          : undefined,
        el(
          ".metric-container",
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("group")),
            el(
              ".metric",
              el("h3", msg("krew-popup-holders-label")),
              this.holderCountDisplay = el(".value", "..."),
            ),
          ),
          el(
            "section.price",
            el(".icon-container", new MaterialIcon("sell")),
            el(
              ".metric",
              el("h3", msg("krew-popup-price-label")),
              this.priceDisplay = el(".value", "..."),
            ),
          ),
        ),
        el(
          ".balance-container",
          el(
            ".balance",
            el("h3", msg("krew-popup-balance-label")),
            this.balanceDisplay = el(".value", "..."),
          ),
          new Button({
            title: "Buy",
            click: () => this.buyKey(),
          }),
          new Button({
            title: "Sell",
            click: () => this.sellKey(),
          }),
        ),
        this.tabs = new Tabs("krew-popup", [{
          id: "holders",
          label: msg("krew-popup-holders-tab"),
        }, {
          id: "activities",
          label: msg("krew-popup-activities-tab"),
        }]),
        this.holderList = new KrewHolderList(krewId),
        this.activityList = new KrewActivityList(krewId),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            click: () => this.delete(),
            title: msg("cancel-button"),
          }),
        ),
      ),
    );

    this.tabs.on("select", (id: string) => {
      [
        this.holderList,
        this.activityList,
      ].forEach((list) => list.hide());
      if (id === "holders") this.holderList.show();
      else if (id === "activities") this.activityList.show();
    }).init();

    this.fetchKrew();
    this.fetchBalance();

    this.onDelegate(Router, "go", () => this.delete());
  }

  private async fetchKrew() {
    this.krew = await KrewService.fetchKrew(this.krewId);
    if (this.krew) {
      this.holderCountDisplay.text = this.krew.key_holder_count.toString();
      this.priceDisplay.text = ethers.formatEther(
        this.krew.last_fetched_key_price,
      );

      if (this.krew.owner === KrewSignedUserManager.user?.wallet_address) {
        this.editButton.deleteClass("hidden");
      }
    }
    if (this.krewId.startsWith("p_")) this.fetchOwner();
  }

  private async fetchBalance() {
    const walletAddress = KrewSignedUserManager.user?.wallet_address;
    if (walletAddress) {
      if (this.krewId.startsWith("p_")) {
        this.balanceDisplay.text = String(
          await KrewPersonalContract.getBalance(
            BigInt(this.krewId.substring(2)),
            walletAddress,
          ),
        );
      } else if (this.krewId.startsWith("c_")) {
        this.balanceDisplay.text = String(
          await KrewCommunalContract.getBalance(
            BigInt(this.krewId.substring(2)),
            walletAddress,
          ),
        );
      }
    } else {
      this.balanceDisplay.text = "0";
    }
  }

  private async buyKey() {
    if (this.krew) {
      new BuyKeyPopup(this.krew);
      this.delete();
    }
  }

  private async sellKey() {
    if (this.krew) {
      new SellKeyPopup(this.krew);
      this.delete();
    }
  }

  private async fetchOwner() {
    if (
      this.krew?.owner && this.ownerDisplay && this.ownerProfileImage &&
      this.ownerName &&
      this.ownerXUsername
    ) {
      const owner = await KrewUserService.fetchByWalletAddress(this.krew.owner);
      if (owner) {
        this.ownerProfileImage.style({
          backgroundImage: `url(${owner.profile_image_thumbnail})`,
        });
        this.ownerName.text = owner.display_name ?? "";
        this.ownerXUsername.text = "@" + owner.x_username ?? "";
        this.ownerDisplay.onDom(
          "click",
          () => Router.go(`/${owner.x_username}`),
        );
      }
    }
  }
}
