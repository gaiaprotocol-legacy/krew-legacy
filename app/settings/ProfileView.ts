import { el, View } from "common-app-module";
import Layout from "../layout/Layout.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import UserDisplay from "../user/UserDisplay.js";

export default class ProfileView extends View {
  private userDisplay: UserDisplay;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".profile-view",
        this.userDisplay = new UserDisplay(undefined, true),
      ),
    );
    this.userDisplay.user = KrewSignedUserManager.user;
  }
}
